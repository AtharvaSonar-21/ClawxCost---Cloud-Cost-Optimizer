import mongoose from "mongoose";

const budgetAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Monthly budget in dollars
    monthlyBudget: {
      type: Number,
      required: true,
      min: [1, "Budget must be at least $1"],
      max: [10000000, "Budget cannot exceed $10,000,000"],
    },
    // Alert thresholds (percentage of budget)
    thresholds: {
      warning: {
        type: Number,
        default: 75, // Alert at 75% of budget
        min: [1, "Warning threshold must be at least 1%"],
        max: [100, "Warning threshold cannot exceed 100%"],
      },
      critical: {
        type: Number,
        default: 90, // Alert at 90% of budget
        min: [1, "Critical threshold must be at least 1%"],
        max: [100, "Critical threshold cannot exceed 100%"],
      },
    },
    // Whether alerts are enabled
    alertsEnabled: {
      type: Boolean,
      default: true,
    },
    // Email notification preferences
    notifications: {
      emailOnWarning: {
        type: Boolean,
        default: true,
      },
      emailOnCritical: {
        type: Boolean,
        default: true,
      },
    },
    // Fiscal year/month configuration
    fiscalYearStart: {
      type: Number,
      default: 1, // Month (1-12) when fiscal year starts
      min: 1,
      max: 12,
    },
    // Track when alerts were last sent
    lastWarningAlertSentAt: Date,
    lastCriticalAlertSentAt: Date,

    // Status tracking
    currentMonthStatus: {
      currentSpend: Number,
      percentageOfBudget: Number,
      remainingBudget: Number,
      daysRemaining: Number,
      projectedMonthlyTotal: Number,
      alertLevel: {
        type: String,
        enum: ["ok", "warning", "critical", "exceeded"],
        default: "ok",
      },
      lastUpdated: Date,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure one budget config per user
budgetAlertSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("BudgetAlert", budgetAlertSchema);
