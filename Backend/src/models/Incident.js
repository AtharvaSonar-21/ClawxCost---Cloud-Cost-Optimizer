import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
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
    incidentType: {
      type: String,
      enum: ["cost_spike", "dominance_risk", "vendor_concentration_risk"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved", "acknowledged"],
      default: "active",
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metrics: {
      currentValue: {
        type: Number,
        required: true,
      },
      threshold: {
        type: Number,
        required: true,
      },
      deviation: {
        type: Number,
        sparse: true,
      },
    },
    detectedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      sparse: true,
    },
    acknowledgedBy: {
      type: String,
      sparse: true,
    },
    acknowledgedAt: {
      type: Date,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering by user
IncidentSchema.index({ userId: 1, status: 1, detectedAt: -1 });
IncidentSchema.index({ userId: 1, incidentType: 1, status: 1, detectedAt: -1 });
IncidentSchema.index({ userId: 1, provider: 1, serviceType: 1, status: 1 });

export default mongoose.model("Incident", IncidentSchema);
