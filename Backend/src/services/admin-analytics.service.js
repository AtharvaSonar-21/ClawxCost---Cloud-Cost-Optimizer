import User from '../models/User.js';
import BillingNormalized from '../models/BillingNormalized.js';

export async function getAdminAnalyticsOverview() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [totalUsers, usersNewLast30d, activeUserIds] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    BillingNormalized.distinct('userId', { date: { $gte: thirtyDaysAgo } }),
  ]);

  const [totalCostResult, topProviders, topServices, growthRaw, topUsersRaw, usageTrendRaw] =
    await Promise.all([
      BillingNormalized.aggregate([
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$dailyCost' },
            totalUsageHours: { $sum: '$usageHours' },
            totalRecords: { $sum: 1 },
          },
        },
      ]),
      BillingNormalized.aggregate([
        {
          $group: {
            _id: '$provider',
            totalCost: { $sum: '$dailyCost' },
            totalUsageHours: { $sum: '$usageHours' },
            records: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
      ]),
      BillingNormalized.aggregate([
        {
          $group: {
            _id: '$serviceType',
            totalCost: { $sum: '$dailyCost' },
            totalUsageHours: { $sum: '$usageHours' },
            records: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            users: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      BillingNormalized.aggregate([
        {
          $group: {
            _id: '$userId',
            totalCost: { $sum: '$dailyCost' },
            totalUsageHours: { $sum: '$usageHours' },
            records: { $sum: 1 },
            lastActivity: { $max: '$date' },
          },
        },
        { $sort: { totalCost: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: '$_id',
            name: '$user.name',
            email: '$user.email',
            role: '$user.role',
            isLocked: '$user.isLocked',
            totalCost: 1,
            totalUsageHours: 1,
            records: 1,
            lastActivity: 1,
          },
        },
      ]),
      BillingNormalized.aggregate([
        { $match: { date: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              userId: '$userId',
            },
            dailyCost: { $sum: '$dailyCost' },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

  const totalCost = totalCostResult[0]?.totalCost || 0;
  const totalUsageHours = totalCostResult[0]?.totalUsageHours || 0;
  const totalRecords = totalCostResult[0]?.totalRecords || 0;

  const monthLabel = (year, month) =>
    new Date(year, month - 1, 1).toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  const growthChart = growthRaw.map((item) => ({
    label: monthLabel(item._id.year, item._id.month),
    users: item.users,
  }));

  const usageByUser = {};
  usageTrendRaw.forEach((item) => {
    const userId = String(item._id.userId);
    if (!usageByUser[userId]) {
      usageByUser[userId] = [];
    }
    usageByUser[userId].push({
      date: item._id.date,
      dailyCost: Number(item.dailyCost || 0),
    });
  });

  const topUsers = topUsersRaw.map((user) => ({
    ...user,
    totalCost: Number(user.totalCost || 0),
    totalUsageHours: Number(user.totalUsageHours || 0),
    trend: usageByUser[String(user.userId)] || [],
  }));

  return {
    summary: {
      totalUsers,
      usersNewLast30d,
      activeUsersLast30d: activeUserIds.length,
      totalCost,
      totalUsageHours,
      totalBillingRecords: totalRecords,
      topProvider: topProviders[0]?._id || null,
      topServiceType: topServices[0]?._id || null,
    },
    growthChart,
    providers: topProviders.map((p) => ({
      provider: p._id,
      totalCost: Number(p.totalCost || 0),
      totalUsageHours: Number(p.totalUsageHours || 0),
      records: p.records,
    })),
    services: topServices.map((s) => ({
      serviceType: s._id,
      totalCost: Number(s.totalCost || 0),
      totalUsageHours: Number(s.totalUsageHours || 0),
      records: s.records,
    })),
    topUsers,
  };
}

export default {
  getAdminAnalyticsOverview,
};
