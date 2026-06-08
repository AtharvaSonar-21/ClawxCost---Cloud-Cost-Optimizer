import mongoose from "mongoose";
import BudgetAlert from "../models/BudgetAlert.js";
import BillingForecast from "../models/BillingForecast.js";
import { getAggregatedForecast } from "./forecasting.service.js";
import Logger from "../utils/logger.js";

/**
 * Get or create default budget alert for user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - BudgetAlert document
 */
export async function getOrCreateBudgetAlert(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let budget = await BudgetAlert.findOne({ userId: userObjectId });

    if (!budget) {
      // Create default budget ($10,000/month)
      budget = await BudgetAlert.create({
        userId: userObjectId,
        monthlyBudget: 10000,
        thresholds: {
          warning: 75,
          critical: 90,
        },
        alertsEnabled: true,
        notifications: {
          emailOnWarning: true,
          emailOnCritical: true,
        },
      });
      Logger.info("BUDGET", "Created default budget alert for user", { userId });
    }

    return budget;
  } catch (error) {
    throw new Error(`Failed to get or create budget alert: ${error.message}`);
  }
}

/**
 * Evaluate current spending against budget
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Budget status with alerts
 */
export async function evaluateBudgetStatus(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's budget config
    const budget = await getOrCreateBudgetAlert(userId);

    if (!budget.alertsEnabled) {
      return {
        success: true,
        budgetAlert: budget,
        status: "alerts_disabled",
      };
    }

    // Get current forecast data
    const forecast = await getAggregatedForecast(userId);

    const currentSpend = forecast.totalCurrentMonth;
    const projectedMonthlyTotal = forecast.totalProjectedMonth;
    const remainingBudget = Math.max(0, budget.monthlyBudget - currentSpend);
    const percentageOfBudget = (currentSpend / budget.monthlyBudget) * 100;

    // Determine alert level
    let alertLevel = "ok";
    let alertMessage = null;

    if (percentageOfBudget >= 100) {
      alertLevel = "exceeded";
      alertMessage = `Budget exceeded! Current spend: $${currentSpend.toFixed(2)} of $${budget.monthlyBudget.toFixed(2)}`;
    } else if (percentageOfBudget >= budget.thresholds.critical) {
      alertLevel = "critical";
      alertMessage = `Critical budget alert! You've spent ${percentageOfBudget.toFixed(1)}% of your monthly budget ($${currentSpend.toFixed(2)} of $${budget.monthlyBudget.toFixed(2)})`;
    } else if (percentageOfBudget >= budget.thresholds.warning) {
      alertLevel = "warning";
      alertMessage = `Budget warning! You've spent ${percentageOfBudget.toFixed(1)}% of your monthly budget ($${currentSpend.toFixed(2)} of $${budget.monthlyBudget.toFixed(2)})`;
    }

    // Update budget document with current status
    const statusUpdate = {
      currentSpend: parseFloat(currentSpend.toFixed(2)),
      percentageOfBudget: parseFloat(percentageOfBudget.toFixed(2)),
      remainingBudget: parseFloat(remainingBudget.toFixed(2)),
      daysRemaining: forecast.daysRemaining,
      projectedMonthlyTotal: parseFloat(projectedMonthlyTotal.toFixed(2)),
      alertLevel,
      lastUpdated: new Date(),
    };

    await BudgetAlert.updateOne(
      { userId: userObjectId },
      { currentMonthStatus: statusUpdate }
    );

    return {
      success: true,
      budgetAlert: budget,
      status: {
        ...statusUpdate,
        message: alertMessage || "Within budget",
        budgetLimit: budget.monthlyBudget,
        warningThreshold: budget.thresholds.warning,
        criticalThreshold: budget.thresholds.critical,
      },
    };
  } catch (error) {
    throw new Error(`Failed to evaluate budget status: ${error.message}`);
  }
}

/**
 * Update budget configuration for user
 * @param {string} userId - User ID
 * @param {Object} updates - Budget updates { monthlyBudget, thresholds, ... }
 * @returns {Promise<Object>} - Updated BudgetAlert
 */
export async function updateBudgetAlert(userId, updates) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Validate updates
    if (updates.monthlyBudget !== undefined) {
      if (updates.monthlyBudget < 1 || updates.monthlyBudget > 10000000) {
        throw new Error("Budget must be between $1 and $10,000,000");
      }
    }

    if (updates.thresholds) {
      if (
        updates.thresholds.warning &&
        (updates.thresholds.warning < 1 || updates.thresholds.warning > 100)
      ) {
        throw new Error("Warning threshold must be between 1% and 100%");
      }
      if (
        updates.thresholds.critical &&
        (updates.thresholds.critical < 1 || updates.thresholds.critical > 100)
      ) {
        throw new Error("Critical threshold must be between 1% and 100%");
      }
      // Critical should be >= warning
      const critical = updates.thresholds.critical;
      const warning = updates.thresholds.warning;
      if (critical && warning && critical < warning) {
        throw new Error("Critical threshold cannot be lower than warning threshold");
      }
    }

    const updatedBudget = await BudgetAlert.findOneAndUpdate(
      { userId: userObjectId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedBudget) {
      throw new Error("Budget alert not found");
    }

    Logger.info("BUDGET", "Budget alert updated", { userId });

    return updatedBudget;
  } catch (error) {
    throw new Error(`Failed to update budget alert: ${error.message}`);
  }
}

/**
 * Check if alert should be sent (rate limiting)
 * @param {Object} budget - BudgetAlert document
 * @param {string} alertType - 'warning' or 'critical'
 * @returns {boolean} - True if alert should be sent
 */
function shouldSendAlert(budget, alertType) {
  const now = new Date();
  const lastSentField = alertType === "warning" ? "lastWarningAlertSentAt" : "lastCriticalAlertSentAt";
  const lastSent = budget[lastSentField];

  // Don't send alert more than once per 24 hours
  if (lastSent) {
    const hoursSinceLastAlert = (now - lastSent) / (1000 * 60 * 60);
    if (hoursSinceLastAlert < 24) {
      return false;
    }
  }

  return true;
}

/**
 * Record that an alert was sent
 * @param {string} userId - User ID
 * @param {string} alertType - 'warning' or 'critical'
 */
async function recordAlertSent(userId, alertType) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const updateField =
      alertType === "warning" ? "lastWarningAlertSentAt" : "lastCriticalAlertSentAt";

    await BudgetAlert.updateOne(
      { userId: userObjectId },
      { [updateField]: new Date() }
    );
  } catch (error) {
    Logger.warn("BUDGET", "Failed to record alert sent", { error: error.message });
  }
}

/**
 * Process budget alerts and return alert details
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Alert information
 */
export async function processBudgetAlerts(userId) {
  try {
    const budgetStatus = await evaluateBudgetStatus(userId);

    if (budgetStatus.status === "alerts_disabled") {
      return {
        alertsEnabled: false,
        alerts: [],
      };
    }

    const status = budgetStatus.status;
    const budget = budgetStatus.budgetAlert;
    const alerts = [];

    // Check for critical alert
    if (status.alertLevel === "critical" || status.alertLevel === "exceeded") {
      if (
        budget.notifications.emailOnCritical &&
        shouldSendAlert(budget, "critical")
      ) {
        alerts.push({
          type: "critical",
          severity: status.alertLevel === "exceeded" ? "exceeded" : "critical",
          message: status.message,
          currentSpend: status.currentSpend,
          budgetLimit: status.budgetLimit,
          percentageOfBudget: status.percentageOfBudget,
          shouldNotify: true,
        });

        await recordAlertSent(userId, "critical");
      }
    }
    // Check for warning alert (only if not critical)
    else if (status.alertLevel === "warning") {
      if (
        budget.notifications.emailOnWarning &&
        shouldSendAlert(budget, "warning")
      ) {
        alerts.push({
          type: "warning",
          severity: "warning",
          message: status.message,
          currentSpend: status.currentSpend,
          budgetLimit: status.budgetLimit,
          percentageOfBudget: status.percentageOfBudget,
          shouldNotify: true,
        });

        await recordAlertSent(userId, "warning");
      }
    }

    return {
      alertsEnabled: budget.alertsEnabled,
      currentStatus: status,
      alerts,
    };
  } catch (error) {
    throw new Error(`Failed to process budget alerts: ${error.message}`);
  }
}
