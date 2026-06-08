import mongoose from "mongoose";

const billingNormalizedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["aws", "gcp", "azure"],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["compute", "storage", "network"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    dailyCost: {
      type: Number,
      required: true,
      min: 0,
    },
    usageHours: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient filtering by user
billingNormalizedSchema.index({ userId: 1, date: -1 });
billingNormalizedSchema.index({
  userId: 1,
  provider: 1,
  serviceType: 1,
  date: 1,
});

export default mongoose.model(
  "BillingNormalized",
  billingNormalizedSchema
);