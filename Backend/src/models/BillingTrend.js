import mongoose from "mongoose";

const BillingTrendSchema = new mongoose.Schema(
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
      enum: ["compute", "storage", "network"],
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
    rollingAverageCost: {
      type: Number,
      required: true,
      min: 0,
    },
    todayCost: {
      type: Number,
      required: true,
      min: 0,
    },
    deviation: {
      type: Number,
      required: true,
      min: 0,
    },
    isAnomaly: {
      type: Boolean,
      required: true,
      default: false,
    },
    anomalyThreshold: {
      type: Number,
      required: true,
      default: 2.0,
    },
    lastSevenDays: [
      {
        date: String,
        cost: Number,
      },
    ],
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering by user
BillingTrendSchema.index({ userId: 1, lastUpdated: -1 });
BillingTrendSchema.index({ userId: 1, provider: 1, serviceType: 1, lastUpdated: -1 });

export default mongoose.model("BillingTrend", BillingTrendSchema);
