import mongoose from "mongoose";
import BillingTrend from "../models/BillingTrend.js";
import Incident from "../models/Incident.js";
import { calculateAggregates } from "./aggregation.service.js";

const DOMINANCE_THRESHOLD = 0.6;
const VENDOR_CONCENTRATION_THRESHOLD = 0.8;
const COST_SPIKE_THRESHOLD = 2.0;

export async function detectCostSpikes(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const spikes = await BillingTrend.find({ userId: userObjectId, isAnomaly: true });
    const detectedIncidents = [];

    for (const spike of spikes) {
      const existingIncident = await Incident.findOne({
        userId: userObjectId,
        provider: spike.provider,
        serviceType: spike.serviceType,
        region: spike.region,
        incidentType: "cost_spike",
        status: "active",
      });

      if (!existingIncident) {
        const newIncident = new Incident({
          userId: userObjectId,
          provider: spike.provider,
          serviceType: spike.serviceType,
          region: spike.region,
          incidentType: "cost_spike",
          severity: "high",
          status: "active",
          description: `${spike.provider} ${spike.serviceType} service cost spike detected (${spike.deviation.toFixed(2)}x rolling average)`,
          metrics: {
            currentValue: spike.todayCost,
            threshold: spike.rollingAverageCost,
            deviation: spike.deviation,
          },
          detectedAt: new Date(),
        });

        await newIncident.save();
        detectedIncidents.push(newIncident);
      }
    }

    return detectedIncidents;
  } catch (error) {
    throw new Error(`Cost spike detection failed: ${error.message}`);
  }
}

export async function detectDominanceRisk(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const agg = await calculateAggregates(userId);
    const detectedIncidents = [];

    if (!agg.totalCost || agg.totalCost === 0) {
      return detectedIncidents;
    }

    for (const serviceType of agg.costByServiceType) {
      const percentage = serviceType.totalCost / agg.totalCost;

      if (percentage > DOMINANCE_THRESHOLD) {
        const existingIncident = await Incident.findOne({
          userId: userObjectId,
          serviceType: serviceType._id,
          incidentType: "dominance_risk",
          status: "active",
        });

        if (!existingIncident) {
          const newIncident = new Incident({
            userId: userObjectId,
            serviceType: serviceType._id,
            incidentType: "dominance_risk",
            severity: "medium",
            status: "active",
            description: `${serviceType._id} service represents ${(percentage * 100).toFixed(1)}% of total system cost (threshold: ${(DOMINANCE_THRESHOLD * 100).toFixed(0)}%)`,
            metrics: {
              currentValue: percentage,
              threshold: DOMINANCE_THRESHOLD,
            },
            detectedAt: new Date(),
          });

          await newIncident.save();
          detectedIncidents.push(newIncident);
        }
      }
    }

    return detectedIncidents;
  } catch (error) {
    throw new Error(`Dominance risk detection failed: ${error.message}`);
  }
}

export async function detectVendorConcentration(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const agg = await calculateAggregates(userId);
    const detectedIncidents = [];

    if (!agg.totalCost || agg.totalCost === 0) {
      return detectedIncidents;
    }

    for (const provider of agg.costByProvider) {
      const percentage = provider.totalCost / agg.totalCost;

      if (percentage > VENDOR_CONCENTRATION_THRESHOLD) {
        const existingIncident = await Incident.findOne({
          userId: userObjectId,
          provider: provider._id,
          incidentType: "vendor_concentration_risk",
          status: "active",
        });

        if (!existingIncident) {
          const newIncident = new Incident({
            userId: userObjectId,
            provider: provider._id,
            incidentType: "vendor_concentration_risk",
            severity: "critical",
            status: "active",
            description: `${provider._id.toUpperCase()} provider represents ${(percentage * 100).toFixed(1)}% of total system cost (threshold: ${(VENDOR_CONCENTRATION_THRESHOLD * 100).toFixed(0)}%)`,
            metrics: {
              currentValue: percentage,
              threshold: VENDOR_CONCENTRATION_THRESHOLD,
            },
            detectedAt: new Date(),
          });

          await newIncident.save();
          detectedIncidents.push(newIncident);
        }
      }
    }

    return detectedIncidents;
  } catch (error) {
    throw new Error(`Vendor concentration detection failed: ${error.message}`);
  }
}

export async function resolveAutoResolvableIncidents(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const activeIncidents = await Incident.find({ userId: userObjectId, status: "active" });
    const resolvedIncidents = [];

    for (const incident of activeIncidents) {
      let shouldResolve = false;

      if (incident.incidentType === "cost_spike") {
        const spike = await BillingTrend.findOne({
          userId: userObjectId,
          provider: incident.provider,
          serviceType: incident.serviceType,
          region: incident.region,
        });

        if (!spike || !spike.isAnomaly) {
          shouldResolve = true;
        }
      } else if (incident.incidentType === "dominance_risk") {
        const agg = await calculateAggregates(userId);

        if (agg.totalCost > 0) {
          const serviceTypeCost = agg.costByServiceType.find(
            (st) => st._id === incident.serviceType
          );

          if (!serviceTypeCost) {
            shouldResolve = true;
          } else {
            const percentage = serviceTypeCost.totalCost / agg.totalCost;
            if (percentage <= DOMINANCE_THRESHOLD) {
              shouldResolve = true;
            }
          }
        }
      } else if (incident.incidentType === "vendor_concentration_risk") {
        const agg = await calculateAggregates(userId);

        if (agg.totalCost > 0) {
          const providerCost = agg.costByProvider.find(
            (p) => p._id === incident.provider
          );

          if (!providerCost) {
            shouldResolve = true;
          } else {
            const percentage = providerCost.totalCost / agg.totalCost;
            if (percentage <= VENDOR_CONCENTRATION_THRESHOLD) {
              shouldResolve = true;
            }
          }
        }
      }

      if (shouldResolve) {
        incident.status = "resolved";
        incident.resolvedAt = new Date();
        await incident.save();
        resolvedIncidents.push(incident);
      }
    }

    return resolvedIncidents;
  } catch (error) {
    throw new Error(`Auto-resolution failed: ${error.message}`);
  }
}

export async function runAnomalyDetection(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const costSpikes = await detectCostSpikes(userId);
    const dominanceRisks = await detectDominanceRisk(userId);
    const vendorConcentration = await detectVendorConcentration(userId);
    const autoResolved = await resolveAutoResolvableIncidents(userId);

    const allActive = await Incident.find({ userId: userObjectId, status: "active" });
    const allResolved = await Incident.find({ userId: userObjectId, status: "resolved" });

    const summary = {
      success: true,
      detectionResults: {
        newCostSpikes: costSpikes.length,
        newDominanceRisks: dominanceRisks.length,
        newVendorConcentration: vendorConcentration.length,
        autoResolved: autoResolved.length,
      },
      summary: {
        totalIncidents: allActive.length + allResolved.length,
        activeIncidents: allActive.length,
        resolvedIncidents: allResolved.length,
        lastUpdated: new Date(),
      },
      incidents: allActive,
    };

    return summary;
  } catch (error) {
    throw new Error(`Anomaly detection failed: ${error.message}`);
  }
}
