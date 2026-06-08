import { useGetTrends } from '@/services/dataFetching'
import PixelLoader from '@/components/ui/PixelLoader'

export default function TrendsChart() {
  const { data, loading, error } = useGetTrends()

  if (loading) {
    return <PixelLoader message="Analyzing spending trends..." />
  }

  if (error) {
    return <div className="text-center font-pixel text-pixel-coral">Error: {error}</div>
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <div className="text-center font-pixel">No trends data available</div>
  }

  const trendsArray = Array.isArray(data) ? data : data.trends ? data.trends : []

  return (
    <div className="space-y-6">
      <h3 className="app-section-title">Cost Trends</h3>

      {trendsArray.length === 0 ? (
        <div className="text-center font-pixel opacity-60">
          No trends detected yet. Upload more billing data to see trends.
        </div>
      ) : (
        <div className="space-y-4">
          {trendsArray.slice(0, 5).map((trend, idx) => (
            <div key={idx} className="app-card p-4">
              <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <p className="font-pixel text-sm">
                    {trend.serviceType?.toUpperCase() || 'UNKNOWN'} - {trend.provider?.toUpperCase() || 'UNKNOWN'}
                  </p>
                  {trend.region && <p className="text-xs opacity-60 font-pixel">{trend.region}</p>}
                </div>
                <div className="text-right">
                  <p className="font-pixel">${trend.todayCost?.toFixed(2) || '0.00'}</p>
                  <p className={`text-xs font-pixel ${trend.isAnomaly ? 'text-pixel-coral' : 'text-pixel-teal'}`}>
                    {trend.isAnomaly ? 'ANOMALY' : 'NORMAL'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs font-pixel">
                <div className="flex justify-between opacity-80">
                  <span>7-day avg:</span>
                  <span>${trend.rollingAverageCost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>Deviation:</span>
                  <span>{trend.deviation?.toFixed(2) || '0.00'}x</span>
                </div>
              </div>

              {trend.lastSevenDays && trend.lastSevenDays.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs opacity-60 mb-2">Last 7 days:</p>
                  <div className="flex gap-1 h-16">
                    {trend.lastSevenDays.map((day, i) => {
                      const maxCost = Math.max(...trend.lastSevenDays.map((d) => d.cost || 0), 1)
                      const dayCost = Number(day.cost || 0)
                      const height = (dayCost / maxCost) * 100
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-pixel-teal opacity-70 border border-pixel-teal"
                          style={{ height: `${height}%` }}
                          title={`${day.date}: $${dayCost.toFixed(2)}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {trendsArray.length > 5 && (
            <p className="text-center text-xs opacity-60 font-pixel">Showing 5 of {trendsArray.length} trends</p>
          )}
        </div>
      )}

      <div className="app-card p-4 text-xs font-pixel opacity-80">
        <p>Tip: An anomaly is flagged when today's cost is at least 2x the 7-day rolling average.</p>
      </div>
    </div>
  )
}
