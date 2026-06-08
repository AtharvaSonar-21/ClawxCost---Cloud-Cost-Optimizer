import mongoose from "mongoose";
import BillingNormalized from "../models/BillingNormalized.js";
import BillingTrend from "../models/BillingTrend.js";

const ANOMALY_THRESHOLD = 2.0;

export async function calculateRollingAverageByServiceType(userId, serviceType, provider, region) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await BillingNormalized.aggregate([
    {
      $match: {
        userId: userObjectId,
        serviceType,
        provider,
        region,
        date: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        dailyTotal: { $sum: "$dailyCost" },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 7 },
  ]);

  if (result.length === 0) {
    return null;
  }

  const costs = result.map((item) => item.dailyTotal);
  const rollingAverage = costs.reduce((a, b) => a + b, 0) / costs.length;
  const todayCost = costs[0];

  const lastSevenDays = result.reverse().map((item) => ({
    date: item._id,
    cost: item.dailyTotal,
  }));

  return {
    rollingAverage,
    todayCost,
    lastSevenDays,
  };
}

export function calculateDeviationAndAnomaly(todayCost, rollingAverage) {
  if (rollingAverage === 0) {
    return { deviation: todayCost > 0 ? Infinity : 0, isAnomaly: false };
  }

  const deviation = todayCost / rollingAverage;
  const isAnomaly = deviation >= ANOMALY_THRESHOLD;

  return { deviation, isAnomaly };
}

export async function recalculateAllTrends(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const uniqueCombinations = await BillingNormalized.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: {
            provider: "$provider",
            serviceType: "$serviceType",
            region: "$region",
          },
        },
      },
    ]);

    const trends = [];
    const anomalies = [];

    for (const combo of uniqueCombinations) {
      const { provider, serviceType, region } = combo._id;

      const rollingAverageData = await calculateRollingAverageByServiceType(
        userId,
        serviceType,
        provider,
        region
      );

      if (!rollingAverageData) {
        continue;
      }

      const { rollingAverage, todayCost, lastSevenDays } = rollingAverageData;
      const { deviation, isAnomaly } = calculateDeviationAndAnomaly(
        todayCost,
        rollingAverage
      );

      const trendDocument = {
        userId: userObjectId,
        provider,
        serviceType,
        region,
        rollingAverageCost: parseFloat(rollingAverage.toFixed(2)),
        todayCost: parseFloat(todayCost.toFixed(2)),
        deviation: parseFloat(deviation.toFixed(2)),
        isAnomaly,
        anomalyThreshold: ANOMALY_THRESHOLD,
        lastSevenDays,
        lastUpdated: new Date(),
      };

      await BillingTrend.updateOne(
        { userId: userObjectId, provider, serviceType, region },
        trendDocument,
        { upsert: true }
      );

      trends.push(trendDocument);

      if (isAnomaly) {
        anomalies.push({
          provider,
          serviceType,
          region,
          deviation: parseFloat(deviation.toFixed(2)),
          todayCost,
          rollingAverage,
        });
      }
    }

    return {
      success: true,
      summary: {
        totalTrends: trends.length,
        anomaliesDetected: anomalies.length,
        lastUpdated: new Date(),
      },
      trends,
      anomalies,
    };
  } catch (error) {
    throw new Error(`Failed to recalculate trends: ${error.message}`);
  }
}
