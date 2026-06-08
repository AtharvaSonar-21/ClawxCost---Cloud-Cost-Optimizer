import mongoose from "mongoose";

// Validation constants for reasonable bounds
const MAX_DAILY_COST = 100000; // $100k per day max (adjust based on your budget)
const MAX_USAGE_HOURS = 24; // Daily data should not exceed 24 hours

const billingRawSchema = new mongoose.Schema(
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
      trim: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    usageHours: {
      type: Number,
      required: true,
      min: [0, "Usage hours cannot be negative"],
      max: [MAX_USAGE_HOURS, "Usage hours cannot exceed 24 hours per day"],
      validate: {
        validator: function (v) {
          return v >= 0 && v <= MAX_USAGE_HOURS;
        },
        message: `Usage hours must be between 0 and ${MAX_USAGE_HOURS}`,
      },
    },
    cost: {
      type: Number,
      required: true,
      min: [0, "Cost cannot be negative"],
      max: [MAX_DAILY_COST, `Cost cannot exceed $${MAX_DAILY_COST} per day`],
      validate: [
        {
          validator: function (v) {
            return v >= 0 && v <= MAX_DAILY_COST;
          },
          message: `Cost must be between $0 and $${MAX_DAILY_COST}`,
        },
      ],
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          // Date must not be in the future (allow same day)
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return v <= today;
        },
        message: "Date cannot be in the future",
      },
    },
    // Duplicate detection fields
    rowHash: {
      type: String,
      // Hash of (provider, service, region, cost, usageHours, date) for duplicate detection
      // Not required so existing records still work
    },
    fileHash: {
      type: String,
      // Hash of entire CSV file (for idempotent uploads)
      // Not required so existing records still work
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering by user
billingRawSchema.index({ userId: 1, date: -1 });
billingRawSchema.index({ userId: 1, provider: 1 });
// Index for duplicate detection
billingRawSchema.index({ userId: 1, rowHash: 1 });
billingRawSchema.index({ userId: 1, fileHash: 1 });

export default mongoose.model("BillingRaw", billingRawSchema);