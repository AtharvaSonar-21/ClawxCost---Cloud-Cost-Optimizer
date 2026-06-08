import { calculateAggregates } from "../services/aggregation.service.js";
import Logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";

const PRICING = {
  aws: {
    compute: { small: 0.023, medium: 0.0464, large: 0.0928 },
    storagePerGbMonth: 0.023,
    egressPerGb: 0.09,
    managedDbPerHour: 0.115,
  },
  gcp: {
    compute: { small: 0.020, medium: 0.041, large: 0.082 },
    storagePerGbMonth: 0.020,
    egressPerGb: 0.085,
    managedDbPerHour: 0.105,
  },
  azure: {
    compute: { small: 0.024, medium: 0.048, large: 0.096 },
    storagePerGbMonth: 0.022,
    egressPerGb: 0.087,
    managedDbPerHour: 0.112,
  },
};

export const getSummary = async (req, res) => {
  try {
    const requestId = req.requestId;
    const userId = req.user.id;
    const data = await calculateAggregates(userId);
    Logger.info("ANALYTICS", "Summary fetched", { requestId });
    res.status(200).json(successResponse(data));
  } catch (error) {
    const requestId = req.requestId || "unknown";
    Logger.error("ANALYTICS", "Failed to fetch analytics", { requestId }, error);
    res.status(500).json(errorResponse("Failed to fetch analytics", 500, requestId));
  }
};

/**
 * POST /analytics/estimate
 * Pre-deployment cloud cost estimate using simple provider pricing baselines.
 */
export const estimateCost = async (req, res) => {
  try {
    const requestId = req.requestId || Logger.generateRequestId();
    const {
      provider,
      instanceType = "medium",
      computeHours = 720,
      storageGb = 100,
      egressGb = 50,
      managedDbHours = 0,
      commitment = "on_demand",
    } = req.body || {};

    const providerKey = String(provider || "").toLowerCase().trim();
    if (!PRICING[providerKey]) {
      return res.status(400).json(errorResponse("provider must be one of: aws, gcp, azure", 400, requestId));
    }

    const instanceKey = String(instanceType || "").toLowerCase().trim();
    if (!PRICING[providerKey].compute[instanceKey]) {
      return res.status(400).json(errorResponse("instanceType must be one of: small, medium, large", 400, requestId));
    }

    const values = {
      computeHours: Number(computeHours),
      storageGb: Number(storageGb),
      egressGb: Number(egressGb),
      managedDbHours: Number(managedDbHours),
    };

    if (Object.values(values).some((v) => Number.isNaN(v) || v < 0)) {
      return res.status(400).json(errorResponse("computeHours, storageGb, egressGb, managedDbHours must be non-negative numbers", 400, requestId));
    }

    const rates = PRICING[providerKey];
    const commitmentDiscount =
      commitment === "reserved_1y" ? 0.72 : commitment === "reserved_3y" ? 0.56 : 1;

    const compute = values.computeHours * rates.compute[instanceKey] * commitmentDiscount;
    const storage = values.storageGb * rates.storagePerGbMonth;
    const egress = values.egressGb * rates.egressPerGb;
    const managedDb = values.managedDbHours * rates.managedDbPerHour * commitmentDiscount;

    const monthlyTotal = compute + storage + egress + managedDb;
    const dailyAverage = monthlyTotal / 30;

    Logger.info("ANALYTICS", "Pre-deployment estimate generated", {
      requestId,
      provider: providerKey,
      monthlyTotal: Number(monthlyTotal.toFixed(2)),
    });

    return res.status(200).json(
      successResponse({
        provider: providerKey,
        assumptionDays: 30,
        commitment,
        breakdown: {
          compute: Number(compute.toFixed(2)),
          storage: Number(storage.toFixed(2)),
          egress: Number(egress.toFixed(2)),
          managedDb: Number(managedDb.toFixed(2)),
        },
        monthlyTotal: Number(monthlyTotal.toFixed(2)),
        dailyAverage: Number(dailyAverage.toFixed(2)),
      })
    );
  } catch (error) {
    const requestId = req.requestId || Logger.generateRequestId();
    Logger.error("ANALYTICS", "Failed to estimate cost", { requestId }, error);
    return res.status(500).json(errorResponse("Failed to estimate cost", 500, requestId));
  }
};
