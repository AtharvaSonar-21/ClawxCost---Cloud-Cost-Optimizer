import csv from "csv-parser";
import { Readable } from "stream";
import BillingRaw from "../models/BillingRaw.js";
import BillingNormalized from "../models/BillingNormalized.js";
import { normalizeBillingRecord } from "../services/normalization.service.js";
import { recalculateAllTrends } from "../services/trends.service.js";
import { runAnomalyDetection } from "../services/anomaly-detection.service.js";
import { generateRecommendations } from "../services/recommendations.service.js";
import { generateCostForecasts } from "../services/forecasting.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { hashCSVFile, hashBillingRow } from "../utils/hasher.js";

export const uploadBillingFile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const requestId = req.requestId || Logger.generateRequestId();

    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }

    // Check if file exists
    if (!req.file) {
      Logger.warn("BILLING", "File upload failed: no file provided", { requestId });
      return res.status(400).json(
        errorResponse("No file provided. Please upload a CSV file.", 400, requestId)
      );
    }

    // Check file extension
    if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
      Logger.warn("BILLING", "File upload failed: invalid file type", {
        requestId,
        fileName: req.file.originalname,
      });
      return res.status(400).json(
        errorResponse("Invalid file type. Only CSV files are accepted.", 400, requestId)
      );
    }

    // Check for duplicate file upload (idempotency)
    const fileHash = hashCSVFile(req.file.buffer);
    const existingFile = await BillingRaw.findOne({ userId, fileHash });
    if (existingFile) {
      Logger.warn("BILLING", "Duplicate file upload detected", {
        requestId,
        fileName: req.file.originalname,
        fileHash,
      });
      return res.status(409).json(
        errorResponse(
          "This CSV file has already been uploaded. Duplicate file detected (idempotent check).",
          409,
          requestId
        )
      );
    }

    const processedRecords = [];
    const skippedRecords = [];
    const duplicateRecords = [];

    // Parse CSV file from buffer first; process rows only after parsing finishes.
    const parsedRows = await new Promise((resolve, reject) => {
      const rows = [];
      Readable.from([req.file.buffer])
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", () => resolve(rows))
        .on("error", reject);
    });

    const validatedRows = [];
    for (const row of parsedRows) {
      try {
        const { provider, service, region, cost, usageHours, date } = row;

        if (!provider || !service || !region || cost === undefined || usageHours === undefined || !date) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "Missing required fields: provider, service, region, cost, usageHours, date",
          });
          continue;
        }

        const costNum = parseFloat(cost);
        const usageHoursNum = parseFloat(usageHours);

        if (isNaN(costNum) || costNum < 0) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "cost must be a valid non-negative number",
          });
          continue;
        }
        if (costNum > 100000) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "cost cannot exceed $100,000 per day (exceeds reasonable limit)",
          });
          continue;
        }

        if (isNaN(usageHoursNum) || usageHoursNum < 0) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "usageHours must be a valid non-negative number",
          });
          continue;
        }
        if (usageHoursNum > 24) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "usageHours cannot exceed 24 (use daily billing periods)",
          });
          continue;
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "date must be a valid date (YYYY-MM-DD format)",
          });
          continue;
        }

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (parsedDate > today) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "date cannot be in the future",
          });
          continue;
        }

        const providerValue = provider.toLowerCase().trim();
        if (!["aws", "gcp", "azure"].includes(providerValue)) {
          skippedRecords.push({
            row: JSON.stringify(row),
            reason: "provider must be one of: aws, gcp, azure",
          });
          continue;
        }

        const serviceValue = service.trim();
        const regionValue = region.trim();
        const dateOnly = parsedDate.toISOString().split("T")[0];
        const rowHash = hashBillingRow({
          provider: providerValue,
          service: serviceValue,
          region: regionValue,
          cost: costNum,
          usageHours: usageHoursNum,
          date: dateOnly,
        });

        validatedRows.push({
          provider: providerValue,
          service: serviceValue,
          region: regionValue,
          cost: costNum,
          usageHours: usageHoursNum,
          date: parsedDate,
          dateOnly,
          rowHash,
          originalRow: row,
        });
      } catch (rowError) {
        skippedRecords.push({
          row: JSON.stringify(row),
          reason: rowError.message,
        });
      }
    }

    const uniqueHashes = [...new Set(validatedRows.map((item) => item.rowHash))];
    const existingHashes = new Set();
    if (uniqueHashes.length > 0) {
      const existingRows = await BillingRaw.find({
        userId,
        rowHash: { $in: uniqueHashes },
      })
        .select({ rowHash: 1, _id: 0 })
        .lean();
      existingRows.forEach((item) => existingHashes.add(item.rowHash));
    }

    const batchSeenHashes = new Set();
    const rawDocs = [];
    const normalizedDocs = [];

    for (const item of validatedRows) {
      const rowString = JSON.stringify(item.originalRow);
      if (existingHashes.has(item.rowHash) || batchSeenHashes.has(item.rowHash)) {
        duplicateRecords.push({
          row: rowString,
          reason:
            "Exact duplicate of previously ingested record (provider, service, region, cost, usageHours, date match)",
        });
        continue;
      }
      batchSeenHashes.add(item.rowHash);

      const rawDoc = {
        userId,
        provider: item.provider,
        service: item.service,
        region: item.region,
        usageHours: item.usageHours,
        cost: item.cost,
        date: item.date,
        rowHash: item.rowHash,
        fileHash,
      };

      try {
        const normalizedData = normalizeBillingRecord(rawDoc);
        rawDocs.push(rawDoc);
        normalizedDocs.push(normalizedData);
        processedRecords.push({
          provider: item.provider,
          service: item.service,
          region: item.region,
          cost: item.cost,
          usageHours: item.usageHours,
          date: item.dateOnly,
        });
      } catch (normalizationError) {
        skippedRecords.push({
          row: rowString,
          reason: normalizationError.message,
        });
      }
    }

    if (rawDocs.length > 0) {
      await BillingRaw.insertMany(rawDocs, { ordered: false });
      await BillingNormalized.insertMany(normalizedDocs, { ordered: false });
    }

    Logger.info("BILLING", "CSV file parsed successfully", {
      requestId,
      fileName: req.file.originalname,
      parsedCount: parsedRows.length,
      processedCount: processedRecords.length,
      skippedCount: skippedRecords.length,
      duplicateCount: duplicateRecords.length,
    });

    // Trigger analytics pipeline asynchronously (non-blocking)
    if (processedRecords.length > 0) {
      recalculateAllTrends(userId)
        .then(() => {
          Logger.info("BILLING", "Trend recalculation completed", { requestId });
          return runAnomalyDetection(userId);
        })
        .then(() => {
          Logger.info("BILLING", "Anomaly detection completed", { requestId });
          return generateRecommendations(userId);
        })
        .then(() => {
          Logger.info("BILLING", "Recommendation generation completed", { requestId });
          return generateCostForecasts(userId);
        })
        .then(() => {
          Logger.info("BILLING", "Cost forecasting completed", { requestId });
        })
        .catch((pipelineError) => {
          Logger.warn(
            "BILLING",
            "Analytics pipeline failed (non-blocking)",
            { requestId },
            pipelineError
          );
        });
    }

    const summaryMsg =
      processedRecords.length > 0
        ? `${processedRecords.length} records ingested successfully.`
        : "No new records were ingested.";
    const duplicateMsg =
      duplicateRecords.length > 0
        ? ` ${duplicateRecords.length} duplicates were skipped.`
        : "";

    res.status(201).json(
      successResponse(
        {
          message: `Billing file processed. ${summaryMsg}${duplicateMsg}`,
          processedRecords: processedRecords.length,
          skippedRecords: skippedRecords.length,
          duplicateRecords: duplicateRecords.length,
          details: {
            processed: processedRecords.slice(0, 10),
            skipped: skippedRecords.slice(0, 10),
            duplicates: duplicateRecords.slice(0, 10),
          },
        },
        201
      )
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("BILLING", "File upload failed", { requestId }, error);
    res.status(500).json(errorResponse("Failed to upload billing file", 500, requestId));
  }
};
