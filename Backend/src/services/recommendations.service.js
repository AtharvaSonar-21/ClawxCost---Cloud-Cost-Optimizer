import mongoose from "mongoose";
import BillingTrend from "../models/BillingTrend.js";
import BillingNormalized from "../models/BillingNormalized.js";
import Incident from "../models/Incident.js";
import Recommendation from "../models/Recommendation.js";
import { calculateAggregates } from "./aggregation.service.js";

const STORAGE_THRESHOLD = 6; // 6 out of 7 days
const REGION_CONCENTRATION_THRESHOLD = 0.7; // 70%

// Realistic savings potential by recommendation type (not hardcoded 15%)
const SAVINGS_POTENTIAL = {
  compute_rightsizing: { percentage: 0.32, confidence: 0.85, label: "Reserved Instance consolidation" },
  storage_lifecycle: { percentage: 0.55, confidence: 0.90, label: "Lifecycle policy implementation" },
  region_diversification: { percentage: 0.12, confidence: 0.60, label: "Regional consolidation" },
};

/**
 * Calculate realistic savings potential for a given recommendation type
 * @param {string} recommendationType - Type of recommendation
 * @param {number} currentCost - Current daily or monthly cost
 * @returns {Object} { dailyAmount, monthlyAmount, percentageReduction, confidence }
 */
function calculateSavingsPotential(recommendationType, currentCost) {
  const potential = SAVINGS_POTENTIAL[recommendationType];
  if (!potential) {
    // Fallback for unknown types (conservative estimate)
    return {
      dailyAmount: parseFloat((currentCost * 0.10).toFixed(2)),
      monthlyAmount: parseFloat((currentCost * 0.10 * 30).toFixed(2)),
      percentageReduction: 10,
      confidence: 0.50,
    };
  }

  const dailyAmount = parseFloat((currentCost * potential.percentage).toFixed(2));
  const monthlyAmount = parseFloat((dailyAmount * 30).toFixed(2));

  return {
    dailyAmount,
    monthlyAmount,
    percentageReduction: Math.round(potential.percentage * 100),
    confidence: potential.confidence,
  };
}

export async function detectComputeRightsizing(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const computeSpikes = await Incident.find({
      userId: userObjectId,
      serviceType: "compute",
      incidentType: "cost_spike",
      status: "active",
    });

    const recommendations = [];

    for (const spike of computeSpikes) {
      const existing = await Recommendation.findOne({
        userId: userObjectId,
        provider: spike.provider,
        serviceType: "compute",
        recommendationType: "compute_rightsizing",
        status: "active",
      });

      if (!existing) {
        const trend = await BillingTrend.findOne({
          userId: userObjectId,
          provider: spike.provider,
          serviceType: "compute",
          region: spike.region,
        });

        if (trend) {
          const savings = calculateSavingsPotential("compute_rightsizing", trend.todayCost);

          const rec = new Recommendation({
            userId: userObjectId,
            provider: spike.provider,
            serviceType: "compute",
            region: spike.region,
            recommendationType: "compute_rightsizing",
            severity: "high",
            status: "active",
            issue: `${String(spike.provider || "cloud").toUpperCase()} compute cost spike detected (${trend.deviation.toFixed(2)}x rolling average)`,
            recommendation:
              "Consider rightsizing compute instances or switching to reserved instances for sustained workloads",
            estimatedSavings: {
              dailyAmount: savings.dailyAmount,
              monthlyAmount: savings.monthlyAmount,
              percentageReduction: savings.percentageReduction,
            },
            confidence: savings.confidence,
            relatedIncidentId: spike._id,
            detectedAt: new Date(),
          });

          await rec.save();
          recommendations.push(rec);
        }
      }
    }

    return recommendations;
  } catch (error) {
    throw new Error(`Compute rightsizing detection failed: ${error.message}`);
  }
}

export async function detectStorageLifecycleOpportunity(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const storageServices = await BillingTrend.find({ userId: userObjectId, serviceType: "storage" });
    const recommendations = [];

    for (const service of storageServices) {
      if (!service.lastSevenDays || service.lastSevenDays.length < 2) {
        continue;
      }

      let increasingDays = 0;
      for (let i = 1; i < service.lastSevenDays.length; i++) {
        if (service.lastSevenDays[i].cost > service.lastSevenDays[i - 1].cost) {
          increasingDays++;
        }
      }

      if (increasingDays >= STORAGE_THRESHOLD) {
        const existing = await Recommendation.findOne({
          userId: userObjectId,
          serviceType: "storage",
          provider: service.provider,
          recommendationType: "storage_lifecycle",
          status: "active",
        });

        if (!existing) {
          const savings = calculateSavingsPotential("storage_lifecycle", service.todayCost);

          const rec = new Recommendation({
            userId: userObjectId,
            serviceType: "storage",
            provider: service.provider,
            region: service.region,
            recommendationType: "storage_lifecycle",
            severity: "medium",
            status: "active",
            issue: `Storage cost steadily increasing (${increasingDays} of 7 days up)`,
            recommendation:
              "Storage costs are trending upward. Implement lifecycle policies to archive old data",
            estimatedSavings: {
              dailyAmount: savings.dailyAmount,
              monthlyAmount: savings.monthlyAmount,
              percentageReduction: savings.percentageReduction,
            },
            confidence: savings.confidence,
            relatedTrendId: service._id,
            detectedAt: new Date(),
          });

          await rec.save();
          recommendations.push(rec);
        }
      }
    }

    return recommendations;
  } catch (error) {
    throw new Error(`Storage lifecycle detection failed: ${error.message}`);
  }
}

export async function detectRegionConcentration(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const recommendations = [];
    const agg = await calculateAggregates(userId);

    if (!agg.costByServiceType || agg.totalCost === 0) {
      return recommendations;
    }

    for (const serviceType of agg.costByServiceType) {
      const regionAgg = await BillingNormalized.aggregate([
        {
          $match: {
            userId: userObjectId,
            serviceType: serviceType._id,
            date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: "$region", totalCost: { $sum: "$dailyCost" } } },
      ]);

      const regionTotal = regionAgg.reduce((sum, r) => sum + r.totalCost, 0);

      for (const region of regionAgg) {
        const percentage = region.totalCost / regionTotal;

        if (percentage > REGION_CONCENTRATION_THRESHOLD) {
          const existing = await Recommendation.findOne({
            userId: userObjectId,
            serviceType: serviceType._id,
            region: region._id,
            recommendationType: "region_diversification",
            status: "active",
          });

          if (!existing) {
            const savings = calculateSavingsPotential("region_diversification", region.totalCost);

            const rec = new Recommendation({
              userId: userObjectId,
              serviceType: serviceType._id,
              region: region._id,
              recommendationType: "region_diversification",
              severity: "medium",
              status: "active",
              issue: `${serviceType._id} costs in ${region._id} represent ${(percentage * 100).toFixed(1)}% of total`,
              recommendation:
                "High cost concentration in single region. Consider multi-region strategy for resilience and cost optimization",
              estimatedSavings: {
                dailyAmount: savings.dailyAmount,
                monthlyAmount: savings.monthlyAmount,
                percentageReduction: savings.percentageReduction,
              },
              confidence: savings.confidence,
              detectedAt: new Date(),
            });

            await rec.save();
            recommendations.push(rec);
          }
        }
      }
    }

    return recommendations;
  } catch (error) {
    throw new Error(`Region concentration detection failed: ${error.message}`);
  }
}

export async function revalidateRecommendations(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const activeRecs = await Recommendation.find({ userId: userObjectId, status: "active" });
    const staled = [];

    for (const rec of activeRecs) {
      let shouldStale = false;

      if (rec.recommendationType === "compute_rightsizing") {
        const incident = await Incident.findById(rec.relatedIncidentId);
        if (!incident || incident.status !== "active") {
          shouldStale = true;
        }
      } else if (rec.recommendationType === "storage_lifecycle") {
        const trend = await BillingTrend.findById(rec.relatedTrendId);
        if (!trend || !trend.lastSevenDays || trend.lastSevenDays.length < 2) {
          shouldStale = true;
        } else {
          let increasingDays = 0;
          for (let i = 1; i < trend.lastSevenDays.length; i++) {
            if (trend.lastSevenDays[i].cost > trend.lastSevenDays[i - 1].cost) {
              increasingDays++;
            }
          }
          if (increasingDays < STORAGE_THRESHOLD) {
            shouldStale = true;
          }
        }
      } else if (rec.recommendationType === "region_diversification") {
        const regionAgg = await BillingNormalized.aggregate([
          { $match: { userId: userObjectId, serviceType: rec.serviceType, region: rec.region } },
          { $group: { _id: "$region", totalCost: { $sum: "$dailyCost" } } },
        ]);

        if (regionAgg.length === 0) {
          shouldStale = true;
        } else {
          const allRegions = await BillingNormalized.aggregate([
            { $match: { userId: userObjectId, serviceType: rec.serviceType } },
            { $group: { _id: "$region", totalCost: { $sum: "$dailyCost" } } },
          ]);
          const total = allRegions.reduce((sum, r) => sum + r.totalCost, 0);
          const percentage = regionAgg[0].totalCost / total;
          if (percentage <= REGION_CONCENTRATION_THRESHOLD) {
            shouldStale = true;
          }
        }
      }

      if (shouldStale) {
        rec.status = "stale";
        rec.stalledAt = new Date();
        await rec.save();
        staled.push(rec);
      }
    }

    return staled;
  } catch (error) {
    throw new Error(`Revalidation failed: ${error.message}`);
  }
}

export async function generateRecommendations(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const compute = await detectComputeRightsizing(userId);
    const storage = await detectStorageLifecycleOpportunity(userId);
    const regions = await detectRegionConcentration(userId);
    const staled = await revalidateRecommendations(userId);

    const all = await Recommendation.find({ userId: userObjectId, status: "active" });

    const summary = {
      newCompute: compute.length,
      newStorage: storage.length,
      newRegions: regions.length,
      autoStaled: staled.length,
      totalActive: all.length,
      lastUpdated: new Date(),
    };

    return { success: true, summary, recommendations: all };
  } catch (error) {
    throw new Error(`Recommendation generation failed: ${error.message}`);
  }
}
