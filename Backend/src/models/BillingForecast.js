import mongoose from "mongoose";

const billingForecastSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["aws", "gcp", "azure"],
      required: true,
      lowercase: true,
    },
    serviceType: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    // Current month cost (actual costs to date)
    currentMonthCost: {
      type: Number,
      default: 0,
    },
    // Projected monthly total (current + projected remaining days)
    projectedMonthlyTotal: {
      type: Number,
      default: 0,
    },
    // Days into current month
    daysIntoMonth: {
      type: Number,
      default: 1,
    },
    // Days remaining in month
    daysRemaining: {
      type: Number,
      default: 30,
    },
    // Average daily cost from historical data
    dailyAverage: {
      type: Number,
      default: 0,
    },
    // Trend direction: 'increasing', 'decreasing', or 'flat'
    dailyTrend: {
      type: String,
      enum: ["increasing", "decreasing", "flat"],
      default: "flat",
    },
    // Confidence in trend prediction (0-1)
    trendConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
    // Last time forecast was calculated
    forecastedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
billingForecastSchema.index({ userId: 1, provider: 1, serviceType: 1, region: 1 });
billingForecastSchema.index({ userId: 1, lastUpdated: -1 });

export default mongoose.model("BillingForecast", billingForecastSchema);
