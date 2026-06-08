import { getAdminAnalyticsOverview } from '../services/admin-analytics.service.js';
import { successResponse, errorResponse } from '../utils/response.js';
import Logger from '../utils/logger.js';

export const getOverview = async (req, res) => {
  const requestId = req.requestId;
  const userId = req.user?.id;

  try {
    if (!userId) {
      return res.status(401).json(errorResponse('Unauthorized', 401, requestId));
    }

    const data = await getAdminAnalyticsOverview();
    Logger.info('ADMIN_ANALYTICS', 'Overview fetched', { requestId, userId });
    return res.status(200).json(successResponse(data));
  } catch (error) {
    Logger.error('ADMIN_ANALYTICS', 'Failed to fetch overview', { requestId, userId }, error);
    return res
      .status(500)
      .json(errorResponse('Failed to fetch admin analytics overview', 500, requestId));
  }
};

export default {
  getOverview,
};
