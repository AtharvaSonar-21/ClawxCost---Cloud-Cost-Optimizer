import mongoose from "mongoose";
import { GoogleAuth } from "google-auth-library";
import CloudConnection from "../models/CloudConnection.js";
import { recalculateAllTrends } from "../services/trends.service.js";
import { runAnomalyDetection } from "../services/anomaly-detection.service.js";
import { generateRecommendations } from "../services/recommendations.service.js";
import { generateCostForecasts } from "../services/forecasting.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const listConnections = async (req, res) => {
  try {
    const requestId = req.requestId || Logger.generateRequestId();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const connections = await CloudConnection.find({ userId: userObjectId })
      .sort({ connectedAt: -1 })
      .lean();

    return res.status(200).json(successResponse({ connections }));
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("CLOUD", "Failed to list cloud connections", { requestId }, error);
    return res.status(500).json(errorResponse("Failed to list cloud connections", 500, requestId));
  }
};

export const connectCloudAccount = async (req, res) => {
  try {
    const requestId = req.requestId || Logger.generateRequestId();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const {
      provider,
      accountName,
      accountId,
      projectId = null,
      serviceAccountJson = null,
    } = req.body || {};
    const providerValue = String(provider || "").toLowerCase().trim();
    const accountNameValue = String(accountName || "").trim();
    const accountIdValue = String(accountId || "").trim();
    const projectIdValue = projectId ? String(projectId).trim() : null;

    if (!["aws", "gcp", "azure"].includes(providerValue)) {
      return res.status(400).json(errorResponse("provider must be one of: aws, gcp, azure", 400, requestId));
    }
    if (!accountNameValue || !accountIdValue) {
      return res.status(400).json(errorResponse("accountName and accountId are required", 400, requestId));
    }

    if (providerValue !== "gcp") {
      return res
        .status(501)
        .json(errorResponse("Only GCP linking is currently supported for validated connection.", 501, requestId));
    }

    if (!serviceAccountJson || typeof serviceAccountJson !== "string") {
      return res
        .status(400)
        .json(errorResponse("serviceAccountJson is required for GCP validation.", 400, requestId));
    }

    let parsedServiceAccount;
    try {
      parsedServiceAccount = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      return res.status(400).json(errorResponse("serviceAccountJson must be valid JSON.", 400, requestId));
    }

    const normalizedBillingAccount = accountIdValue.startsWith("billingAccounts/")
      ? accountIdValue
      : `billingAccounts/${accountIdValue}`;

    // Validate the provided service account can access the billing account/project.
    try {
      const auth = new GoogleAuth({
        credentials: parsedServiceAccount,
        scopes: ["https://www.googleapis.com/auth/cloud-billing.readonly"],
      });
      const client = await auth.getClient();
      const tokenResponse = await client.getAccessToken();
      const accessToken = tokenResponse?.token;
      if (!accessToken) {
        return res.status(401).json(errorResponse("Unable to obtain GCP access token from service account.", 401, requestId));
      }

      const billingAccountResp = await fetch(
        `https://cloudbilling.googleapis.com/v1/${normalizedBillingAccount}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!billingAccountResp.ok) {
        const payload = await billingAccountResp.text();
        Logger.warn("CLOUD", "Billing account validation failed", { requestId, payload });
        return res
          .status(403)
          .json(errorResponse("GCP billing account validation failed. Check account ID and service account permissions.", 403, requestId));
      }

      if (projectIdValue) {
        const projectBillingResp = await fetch(
          `https://cloudbilling.googleapis.com/v1/projects/${projectIdValue}/billingInfo`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!projectBillingResp.ok) {
          const payload = await projectBillingResp.text();
          Logger.warn("CLOUD", "Project billing validation failed", { requestId, payload, projectId: projectIdValue });
          return res
            .status(403)
            .json(errorResponse("GCP project billing validation failed. Ensure project ID exists and service account has billing viewer access.", 403, requestId));
        }
      }
    } catch (validationError) {
      Logger.error("CLOUD", "GCP validation exception", { requestId }, validationError);
      return res
        .status(400)
        .json(errorResponse("Failed to validate GCP billing credentials. Verify service account JSON and permissions.", 400, requestId));
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const connection = await CloudConnection.findOneAndUpdate(
      { userId: userObjectId, provider: providerValue, accountId: normalizedBillingAccount },
      {
        userId: userObjectId,
        provider: providerValue,
        accountName: accountNameValue,
        accountId: normalizedBillingAccount,
        projectId: projectIdValue,
        status: "connected",
        connectedAt: now,
        metadata: {
          validation: "gcp_cloudbilling_api",
          validatedAt: now,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    Logger.info("CLOUD", "Cloud account linked", {
      requestId,
      userId,
      provider: providerValue,
      accountId: accountIdValue,
    });

    return res.status(201).json(
      successResponse(
        {
          message: "Cloud account linked successfully",
          connection,
        },
        201
      )
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("CLOUD", "Failed to link cloud account", { requestId }, error);
    return res.status(500).json(errorResponse("Failed to link cloud account", 500, requestId));
  }
};

export const disconnectCloudAccount = async (req, res) => {
  try {
    const requestId = req.requestId || Logger.generateRequestId();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const { id } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const deleted = await CloudConnection.findOneAndDelete({ _id: id, userId: userObjectId });

    if (!deleted) {
      return res.status(404).json(errorResponse("Cloud connection not found", 404, requestId));
    }

    Logger.info("CLOUD", "Cloud account disconnected", { requestId, userId, connectionId: id });
    return res.status(200).json(successResponse({ message: "Cloud account disconnected successfully" }));
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("CLOUD", "Failed to disconnect cloud account", { requestId }, error);
    return res.status(500).json(errorResponse("Failed to disconnect cloud account", 500, requestId));
  }
};

export const syncCloudConnection = async (req, res) => {
  try {
    const requestId = req.requestId || Logger.generateRequestId();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    const { id } = req.params;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const connection = await CloudConnection.findOne({ _id: id, userId: userObjectId });

    if (!connection) {
      return res.status(404).json(errorResponse("Cloud connection not found", 404, requestId));
    }

    // Current release limitation: true provider bill ingestion needs billing export setup.
    // We still refresh analytics from existing ingested records and record sync heartbeat.
    await recalculateAllTrends(userId);
    await runAnomalyDetection(userId);
    await generateRecommendations(userId);
    await generateCostForecasts(userId);

    connection.lastSyncAt = new Date();
    connection.status = "connected";
    connection.metadata = {
      ...(connection.metadata || {}),
      lastSyncMode: "pipeline_refresh",
      lastSyncMessage:
        "Analytics refreshed from existing billing data. Direct provider bill ingestion requires billing export integration.",
      lastSyncRequestId: requestId,
    };
    await connection.save();

    Logger.info("CLOUD", "Cloud connection sync completed", {
      requestId,
      userId,
      connectionId: id,
    });

    return res.status(200).json(
      successResponse({
        message:
          "Sync completed. Analytics were refreshed from existing billing data. Configure provider billing export for automatic ingestion.",
        connection,
      })
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("CLOUD", "Failed to sync cloud connection", { requestId }, error);
    return res.status(500).json(errorResponse("Failed to sync cloud connection", 500, requestId));
  }
};
