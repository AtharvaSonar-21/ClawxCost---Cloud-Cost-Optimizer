import { useGetCostSummary } from '@/services/dataFetching'
import PixelLoader from '@/components/ui/PixelLoader'

export default function CostSummary() {
  const { data, loading, error } = useGetCostSummary()

  if (loading) {
    return <PixelLoader message="Ingesting cost summaries..." />
  }

  if (error) {
    return <div className="text-center font-pixel text-pixel-coral text-xs md:text-sm">Error: {error}</div>
  }

  if (!data) {
    return <div className="text-center font-pixel text-xs md:text-sm">No data available</div>
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="app-section-title">Cost Summary</h3>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        <div className="app-card bg-pixel-teal border-pixel-teal">
          <p className="text-xs md:text-sm font-pixel opacity-80">Total Cost</p>
          <p className="text-2xl md:text-4xl font-pixel mt-2">${data.totalCost?.toFixed(2) || 0}</p>
          <p className="text-[10px] md:text-xs font-pixel opacity-60 mt-2">{data.totalEntries || 0} entries</p>
        </div>

        <div className="app-card bg-pixel-purple border-pixel-coral">
          <p className="text-xs md:text-sm font-pixel opacity-80">Cost by Provider</p>
          <div className="mt-3 md:mt-4 space-y-1 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
            {Array.isArray(data.costByProvider) && data.costByProvider.length > 0 ? (
              data.costByProvider.map((provider) => (
                <div key={String(provider._id || 'unknown')} className="flex justify-between font-pixel text-[10px] md:text-sm gap-2">
                  <span className="truncate">{String(provider._id || 'unknown').toUpperCase()}</span>
                  <span className="flex-shrink-0">${Number(provider.totalCost || 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs">No data</p>
            )}
          </div>
        </div>

        <div className="app-card bg-pixel-coral border-pixel-purple">
          <p className="text-xs md:text-sm font-pixel opacity-80">Cost by Service Type</p>
          <div className="mt-3 md:mt-4 space-y-1 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
            {Array.isArray(data.costByServiceType) && data.costByServiceType.length > 0 ? (
              data.costByServiceType.map((service) => (
                <div key={String(service._id || 'unknown')} className="flex justify-between font-pixel text-[10px] md:text-sm gap-2">
                  <span className="capitalize truncate">{String(service._id || 'unknown')}</span>
                  <span className="flex-shrink-0">${Number(service.totalCost || 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
