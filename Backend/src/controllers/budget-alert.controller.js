import {
  getOrCreateBudgetAlert,
  evaluateBudgetStatus,
  updateBudgetAlert,
  processBudgetAlerts,
} from "../services/budget-alert.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * GET /budgets/config - Get user's budget configuration
 */
export const getBudgetConfig = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const budget = await getOrCreateBudgetAlert(userId);

    Logger.info("BUDGET", "Budget config retrieved", { requestId, userId });

    res.status(200).json(
      successResponse({
        monthlyBudget: budget.monthlyBudget,
        thresholds: budget.thresholds,
        alertsEnabled: budget.alertsEnabled,
        notifications: budget.notifications,
        currentMonthStatus: budget.currentMonthStatus,
      })
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("BUDGET", "Failed to get budget config", { requestId }, error);
    res.status(500).json(errorResponse("Failed to retrieve budget config", 500, requestId));
  }
};

/**
 * PUT /budgets/config - Update budget configuration
 */
export const updateBudgetConfig = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const { monthlyBudget, thresholds, alertsEnabled, notifications } = req.body;

    // Validate input
    const updates = {};
    if (monthlyBudget !== undefined) updates.monthlyBudget = monthlyBudget;
    if (thresholds !== undefined) updates.thresholds = thresholds;
    if (alertsEnabled !== undefined) updates.alertsEnabled = alertsEnabled;
    if (notifications !== undefined) updates.notifications = notifications;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json(
        errorResponse("No updates provided", 400, requestId)
      );
    }

    const updatedBudget = await updateBudgetAlert(userId, updates);

    Logger.info("BUDGET", "Budget config updated", { requestId, userId });

    res.status(200).json(
      successResponse({
        message: "Budget configuration updated successfully",
        monthlyBudget: updatedBudget.monthlyBudget,
        thresholds: updatedBudget.thresholds,
        alertsEnabled: updatedBudget.alertsEnabled,
        notifications: updatedBudget.notifications,
      })
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();

    // Validation error
    if (error.message.includes("must be") || error.message.includes("cannot be")) {
      Logger.warn("BUDGET", "Validation error", { requestId, error: error.message });
      return res.status(400).json(errorResponse(error.message, 400, requestId));
    }

    Logger.error("BUDGET", "Failed to update budget config", { requestId }, error);
    res.status(500).json(errorResponse("Failed to update budget config", 500, requestId));
  }
};

/**
 * GET /budgets/status - Get current budget status and alerts
 */
export const getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const budgetStatus = await evaluateBudgetStatus(userId);

    Logger.info("BUDGET", "Budget status evaluated", { requestId, userId });

    res.status(200).json(successResponse(budgetStatus.status));
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("BUDGET", "Failed to get budget status", { requestId }, error);
    res.status(500).json(errorResponse("Failed to retrieve budget status", 500, requestId));
  }
};

/**
 * GET /budgets/alerts - Get active budget alerts
 */
export const getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const budgetAlerts = await processBudgetAlerts(userId);

    Logger.info("BUDGET", "Budget alerts processed", {
      requestId,
      userId,
      alertCount: budgetAlerts.alerts.length,
    });

    res.status(200).json(
      successResponse({
        alertsEnabled: budgetAlerts.alertsEnabled,
        activeAlerts: budgetAlerts.alerts.length,
        alerts: budgetAlerts.alerts,
        currentStatus: budgetAlerts.currentStatus,
      })
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("BUDGET", "Failed to process budget alerts", { requestId }, error);
    res.status(500).json(errorResponse("Failed to process budget alerts", 500, requestId));
  }
};
