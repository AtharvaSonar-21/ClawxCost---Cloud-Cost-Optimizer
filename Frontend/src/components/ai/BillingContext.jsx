import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiGet } from '@/api/client';

export default function BillingContext() {
  const { token } = useAuth();
  const [costData, setCostData] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [costRes, incidentsRes, recsRes] = await Promise.all([
          apiGet('/analytics/cost-summary'),
          apiGet('/incidents'),
          apiGet('/recommendations'),
        ]);

        if (costRes.success) {
          const summary = costRes.data?.costSummary || costRes.data || {};
          setCostData(summary);
        }
        if (incidentsRes.success) {
          const incidentsArray = Array.isArray(incidentsRes.data)
            ? incidentsRes.data
            : Array.isArray(incidentsRes.data?.incidents)
            ? incidentsRes.data.incidents
            : [];
          setIncidents(incidentsArray);
        }
        if (recsRes.success) {
          const recsArray = Array.isArray(recsRes.data)
            ? recsRes.data
            : Array.isArray(recsRes.data?.recommendations)
            ? recsRes.data.recommendations
            : [];
          setRecommendations(recsArray);
        }
      } catch (err) {
        console.error('Failed to fetch context data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-pixel-darker border-2 border-pixel-teal p-4">
        <p className="font-pixel text-sm opacity-60">Loading context...</p>
      </div>
    );
  }

  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const safeRecommendations = Array.isArray(recommendations) ? recommendations : [];
  const activeIncidents = safeIncidents.filter((i) => i.status === 'active').length;
  const activeRecommendations = safeRecommendations.filter((r) => r.status === 'active').length;

  const providerEntries = Array.isArray(costData?.costByProvider)
    ? costData.costByProvider.map((item) => [item._id || 'unknown', Number(item.totalCost || 0)])
    : Object.entries(costData?.costByProvider || {}).map(([k, v]) => [k, Number(v || 0)]);

  const serviceEntries = Array.isArray(costData?.costByServiceType)
    ? costData.costByServiceType.map((item) => [item._id || 'unknown', Number(item.totalCost || 0)])
    : Object.entries(costData?.costByServiceType || {}).map(([k, v]) => [k, Number(v || 0)]);

  return (
    <div className="space-y-4">
      <h3 className="font-pixel text-lg">Your Cost Context</h3>

      <div className="grid grid-cols-1 gap-3">
        {/* Total Cost */}
        {costData && (
          <div className="bg-pixel-teal text-pixel-darker p-4 border-2 border-pixel-teal">
            <p className="text-xs font-pixel opacity-80">Total Cost</p>
            <p className="text-2xl font-pixel mt-1">
              ${costData.totalCost?.toFixed(2) || '0.00'}
            </p>
          </div>
        )}

        {/* Cost by Provider */}
        {providerEntries.length > 0 && (
          <div className="bg-pixel-purple p-4 border-2 border-pixel-coral">
            <p className="text-xs font-pixel mb-2">By Provider</p>
            <div className="space-y-1">
              {providerEntries.map(([provider, cost]) => (
                <div key={provider} className="flex justify-between text-xs font-pixel">
                  <span className="uppercase">{provider}</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost by Service */}
        {serviceEntries.length > 0 && (
            <div className="bg-pixel-purple p-4 border-2 border-pixel-coral">
              <p className="text-xs font-pixel mb-2">By Service Type</p>
              <div className="space-y-1">
                {serviceEntries.map(
                  ([service, cost]) => (
                    <div key={service} className="flex justify-between text-xs font-pixel">
                      <span className="capitalize">{service}</span>
                      <span>${cost.toFixed(2)}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Active Incidents */}
        {activeIncidents > 0 && (
          <div className="bg-pixel-coral text-pixel-darker p-4 border-2 border-pixel-coral">
            <p className="text-xs font-pixel opacity-80">Active Incidents</p>
            <p className="text-2xl font-pixel mt-1">{activeIncidents}</p>
          </div>
        )}

        {/* Pending Recommendations */}
        {activeRecommendations > 0 && (
          <div className="bg-pixel-coral text-pixel-darker p-4 border-2 border-pixel-coral">
            <p className="text-xs font-pixel opacity-80">Pending Recommendations</p>
            <p className="text-2xl font-pixel mt-1">{activeRecommendations}</p>
          </div>
        )}

        {!costData && (
          <div className="bg-pixel-darker border-2 border-pixel-teal p-4">
            <p className="text-xs font-pixel opacity-60">
              No billing data yet. Upload some billing data to see insights.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-pixel-coral text-pixel-darker p-4 border-2 border-pixel-coral">
            <p className="text-xs font-pixel">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
