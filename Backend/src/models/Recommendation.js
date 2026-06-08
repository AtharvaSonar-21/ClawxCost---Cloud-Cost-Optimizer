import mongoose from "mongoose";

const RecommendationSchema = new mongoose.Schema(
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
      sparse: true,
      lowercase: true,
    },
    serviceType: {
      type: String,
      enum: ["compute", "storage", "network"],
      sparse: true,
    },
    region: {
      type: String,
      sparse: true,
    },
    recommendationType: {
      type: String,
      enum: ["compute_rightsizing", "storage_lifecycle", "region_diversification"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "stale", "applied"],
      default: "active",
      index: true,
    },
    issue: {
      type: String,
      required: true,
    },
    recommendation: {
      type: String,
      required: true,
    },
    estimatedSavings: {
      dailyAmount: {
        type: Number,
        required: true,
      },
      monthlyAmount: {
        type: Number,
        required: true,
      },
      percentageReduction: {
        type: Number,
        default: 15,
      },
    },
    relatedIncidentId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
      ref: "Incident",
    },
    relatedTrendId: {
      type: mongoose.Schema.Types.ObjectId,
      sparse: true,
      ref: "BillingTrend",
    },
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    appliedAt: {
      type: Date,
      sparse: true,
    },
    stalledAt: {
      type: Date,
      sparse: true,
    },
    notes: {
      type: String,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering by user
RecommendationSchema.index({ userId: 1, status: 1, severity: 1, detectedAt: -1 });
RecommendationSchema.index({ userId: 1, recommendationType: 1, status: 1 });
RecommendationSchema.index({ userId: 1, provider: 1, serviceType: 1, status: 1 });

export default mongoose.model("Recommendation", RecommendationSchema);
