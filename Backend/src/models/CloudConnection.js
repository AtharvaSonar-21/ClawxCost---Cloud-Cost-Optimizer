import mongoose from "mongoose";

const cloudConnectionSchema = new mongoose.Schema(
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
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    projectId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ["connected", "error", "disconnected"],
      default: "connected",
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastSyncAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

cloudConnectionSchema.index({ userId: 1, provider: 1, accountId: 1 }, { unique: true });

export default mongoose.model("CloudConnection", cloudConnectionSchema);
