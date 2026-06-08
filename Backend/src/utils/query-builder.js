/**
 * Query building utilities for common filtering patterns
 * Eliminates code duplication in incident and recommendation controllers
 */

/**
 * Build MongoDB filter object for incidents from query parameters
 * @param {object} query - Express req.query object
 * @returns {object} { filter, pagination }
 */
export function buildIncidentFilter(query) {
  const { status, incidentType, severity, provider, limit = 50, offset = 0 } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }
  if (incidentType) {
    filter.incidentType = incidentType;
  }
  if (severity) {
    filter.severity = severity;
  }
  if (provider) {
    filter.provider = provider;
  }

  return {
    filter,
    pagination: {
      limit: Math.min(parseInt(limit) || 50, 100), // Cap at 100
      offset: Math.max(parseInt(offset) || 0, 0), // Min 0
    },
  };
}

/**
 * Build MongoDB filter object for recommendations from query parameters
 * @param {object} query - Express req.query object
 * @returns {object} { filter, pagination }
 */
export function buildRecommendationFilter(query) {
  const {
    status,
    recommendationType,
    type, // Alias for recommendationType
    severity,
    provider,
    limit = 50,
    offset = 0,
  } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  }
  // Support both 'recommendationType' and 'type' query params
  if (recommendationType || type) {
    filter.recommendationType = recommendationType || type;
  }
  if (severity) {
    filter.severity = severity;
  }
  if (provider) {
    filter.provider = provider;
  }

  return {
    filter,
    pagination: {
      limit: Math.min(parseInt(limit) || 50, 100), // Cap at 100
      offset: Math.max(parseInt(offset) || 0, 0), // Min 0
    },
  };
}

export default {
  buildIncidentFilter,
  buildRecommendationFilter,
};
