/**
 * Custom hooks for data fetching from ClawxCost API
 * Each hook manages loading, error, and refetch states
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiPatch } from '@/api/client';

/**
 * Generic data fetching hook
 * @param {Function} fetchFn - Async function that returns API response
 * @returns {object} { data, loading, error, refetch }
 */
function useFetch(fetchFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFnRef.current();
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || 'An error occurred');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * Hook to fetch cost summary
 * GET /analytics/cost-summary
 */
export function useGetCostSummary() {
  return useFetch(async () => {
    const response = await apiGet('/analytics/cost-summary');
    if (!response.success) {
      return response;
    }
    return {
      ...response,
      data: response.data?.costSummary || response.data || {},
    };
  });
}

/**
 * Hook to fetch trends
 * GET /analytics/trends
 */
export function useGetTrends() {
  return useFetch(() => apiGet('/analytics/trends'));
}

/**
 * Hook to fetch incidents
 * GET /incidents
 */
export function useGetIncidents() {
  return useFetch(async () => {
    const response = await apiGet('/incidents');
    if (!response.success) {
      return response;
    }
    return {
      ...response,
      data: Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.incidents)
        ? response.data.incidents
        : [],
    };
  });
}

/**
 * Hook to fetch recommendations
 * GET /recommendations
 */
export function useGetRecommendations() {
  return useFetch(async () => {
    const response = await apiGet('/recommendations');
    if (!response.success) {
      return response;
    }
    return {
      ...response,
      data: Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.recommendations)
        ? response.data.recommendations
        : [],
    };
  });
}

/**
 * Hook to upload billing data
 * POST /billing
 * Returns a function to call with billing data
 */
export function useUploadBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const upload = useCallback(async (billingData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiPost('/billing', billingData);
      if (response.success) {
        setSuccess(true);
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { upload, loading, error, success };
}

/**
 * Hook to acknowledge an incident
 * PATCH /incidents/:id/acknowledge
 */
export function useAcknowledgeIncident() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const acknowledge = useCallback(async (incidentId, acknowledgedBy = 'Admin') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPatch(`/incidents/${incidentId}/acknowledge`, {
        acknowledgedBy,
      });
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { acknowledge, loading, error };
}

/**
 * Hook to apply a recommendation
 * PATCH /recommendations/:id/apply
 */
export function useApplyRecommendation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apply = useCallback(async (recommendationId, notes = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiPatch(`/recommendations/${recommendationId}/apply`, {
        notes,
      });
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message);
        return { success: false, error: response.message };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { apply, loading, error };
}

/**
 * Hook to fetch comprehensive analytics
 * GET /analytics/comprehensive
 */
export function useGetComprehensiveAnalytics() {
  return useFetch(() => apiGet('/analytics/comprehensive'));
}

/**
 * Hook to fetch admin analytics overview
 * GET /admin/analytics/overview
 */
export function useGetAdminOverview() {
  return useFetch(() => apiGet('/admin/analytics/overview'));
}

export default {
  useGetCostSummary,
  useGetTrends,
  useGetIncidents,
  useGetRecommendations,
  useUploadBilling,
  useAcknowledgeIncident,
  useApplyRecommendation,
  useGetComprehensiveAnalytics,
  useGetAdminOverview,
};
