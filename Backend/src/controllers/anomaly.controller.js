import Incident from "../models/Incident.js";
import { runAnomalyDetection } from "../services/anomaly-detection.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { buildIncidentFilter } from "../utils/query-builder.js";

export const getIncidents = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }
    const { filter, pagination } = buildIncidentFilter(req.query);
    const scopedFilter = { ...filter, userId };

    const incidents = await Incident.find(scopedFilter)
      .sort({ detectedAt: -1 })
      .limit(pagination.limit)
      .skip(pagination.offset);

    const total = await Incident.countDocuments(scopedFilter);
    const activeCount = await Incident.countDocuments({ ...scopedFilter, status: "active" });
    const resolvedCount = await Incident.countDocuments({ ...scopedFilter, status: "resolved" });

    Logger.info("ANOMALY", "Incidents fetched", { requestId, total, returned: incidents.length });

    res.status(200).json(
      successResponse({
        incidents,
        pagination: {
          total,
          limit: pagination.limit,
          offset: pagination.offset,
          returned: incidents.length,
        },
        counts: {
          total,
          active: activeCount,
          resolved: resolvedCount,
        },
      })
    );
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANOMALY", "Failed to fetch incidents", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch incidents", 500, requestId));
  }
};

export const getIncidentsSummary = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const allIncidents = await Incident.find({ userId });

    const severityCounts = {
      critical: allIncidents.filter((i) => i.severity === "critical").length,
      high: allIncidents.filter((i) => i.severity === "high").length,
      medium: allIncidents.filter((i) => i.severity === "medium").length,
      low: allIncidents.filter((i) => i.severity === "low").length,
    };

    const statusCounts = {
      active: allIncidents.filter((i) => i.status === "active").length,
      resolved: allIncidents.filter((i) => i.status === "resolved").length,
      acknowledged: allIncidents.filter((i) => i.status === "acknowledged").length,
    };

    const typeCounts = {
      cost_spike: allIncidents.filter((i) => i.incidentType === "cost_spike").length,
      dominance_risk: allIncidents.filter((i) => i.incidentType === "dominance_risk").length,
      vendor_concentration_risk: allIncidents.filter(
        (i) => i.incidentType === "vendor_concentration_risk"
      ).length,
    };

    Logger.info("ANOMALY", "Summary fetched", { requestId, totalIncidents: allIncidents.length });

    res.status(200).json(
      successResponse({
        summary: {
          totalIncidents: allIncidents.length,
          severity: severityCounts,
          status: statusCounts,
          type: typeCounts,
        },
      })
    );
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANOMALY", "Failed to fetch incident summary", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch incident summary", 500, requestId));
  }
};

export const acknowledgeIncident = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", 401, requestId));
    }
    const { id } = req.params;
    const acknowledgedBy = req.body?.acknowledgedBy;

    if (!acknowledgedBy) {
      Logger.warn("ANOMALY", "Acknowledge failed: missing acknowledgedBy", { requestId });
      return res.status(400).json(errorResponse("acknowledgedBy field is required", 400, requestId));
    }

    const incident = await Incident.findOneAndUpdate(
      { _id: id, userId },
      {
        status: "acknowledged",
        acknowledgedBy,
        acknowledgedAt: new Date(),
      },
      { new: true }
    );

    if (!incident) {
      Logger.warn("ANOMALY", "Acknowledge failed: incident not found", { requestId, incidentId: id });
      return res.status(404).json(errorResponse("Incident not found", 404, requestId));
    }

    Logger.info("ANOMALY", "Incident acknowledged", { requestId, incidentId: id });
    res.status(200).json(successResponse(incident));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANOMALY", "Failed to acknowledge incident", { requestId }, error);
    res.status(500).json(errorResponse("Failed to acknowledge incident", 500, requestId));
  }
};

export const triggerDetection = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const result = await runAnomalyDetection(userId);
    Logger.info("ANOMALY", "Detection triggered", { requestId });
    res.status(200).json(successResponse(result));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANOMALY", "Failed to run anomaly detection", { requestId }, error);
    res.status(500).json(errorResponse("Failed to run anomaly detection", 500, requestId));
  }
};
