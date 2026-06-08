
import mongoose from "mongoose";
import BillingNormalized from "../models/BillingNormalized.js";

export async function calculateAggregates(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const totalResult = await BillingNormalized.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$dailyCost" },
          totalEntries: { $sum: 1 },
        },
      },
    ]);

    const totalCost = totalResult[0]?.totalCost || 0;
    const totalEntries = totalResult[0]?.totalEntries || 0;

    const costByProvider = await BillingNormalized.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: "$provider",
          totalCost: { $sum: "$dailyCost" },
        },
      },
    ]);

    const costByServiceType = await BillingNormalized.aggregate([
      {
        $match: { userId: userObjectId },
      },
      {
        $group: {
          _id: "$serviceType",
          totalCost: { $sum: "$dailyCost" },
          averageCost: { $avg: "$dailyCost" },
          count: { $sum: 1 },
        },
      },
    ]);

    const topContributor = costByServiceType.reduce(
      (max, current) => {
        return current.totalCost > max.totalCost ? current : max;
      },
      { totalCost: 0 }
    );

    return {
      totalCost,
      totalEntries,
      costByProvider,
      costByServiceType,
      topContributor,
    };
  } catch (error) {
    throw new Error(`Aggregation failed: ${error.message}`);
  }
}