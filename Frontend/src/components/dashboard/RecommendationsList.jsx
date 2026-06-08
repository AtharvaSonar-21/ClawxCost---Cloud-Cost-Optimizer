import { useState } from 'react'
import { useGetRecommendations, useApplyRecommendation } from '@/services/dataFetching'
import PixelLoader from '@/components/ui/PixelLoader'

export default function RecommendationsList({ isReadOnly = false }) {
  const { data: recommendations, loading, error, refetch } = useGetRecommendations()
  const { apply, loading: applyLoading } = useApplyRecommendation()
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedRec, setSelectedRec] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [notes, setNotes] = useState('')

  const filteredRecommendations =
    recommendations?.filter((r) => statusFilter === 'all' || r.status === statusFilter) || []

  const totalSavings = filteredRecommendations.reduce(
    (sum, r) => sum + (r.estimatedSavings?.monthlyAmount || 0),
    0
  )

  const handleApply = async (recId) => {
    const result = await apply(recId, notes)
    if (result.success) {
      setFeedback({ type: 'success', message: 'Recommendation applied successfully.' })
      refetch()
      setNotes('')
      setSelectedRec(null)
      return
    }
    setFeedback({ type: 'error', message: result.error })
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Recommendations</h2>

      {filteredRecommendations.length > 0 && (
        <div className="app-card bg-pixel-teal text-pixel-darker border-pixel-teal">
          <p className="font-pixel text-sm opacity-80">Potential Monthly Savings</p>
          <p className="text-4xl font-pixel mt-2">${totalSavings.toFixed(2)}</p>
          <p className="text-xs font-pixel opacity-60 mt-2">
            {filteredRecommendations.length} recommendations
          </p>
        </div>
      )}

      {!isReadOnly && (
        <div className="flex gap-2 flex-wrap">
          {['active', 'stale', 'applied', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 font-pixel text-xs border-2 transition ${
                statusFilter === status
                  ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
                  : 'bg-pixel-darker text-pixel-teal border-pixel-teal hover:opacity-80'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 border-2 font-pixel text-sm ${
            feedback.type === 'success'
              ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
              : 'bg-pixel-coral text-pixel-darker border-pixel-coral'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {loading && <PixelLoader message="Retrieving cost optimization recommendations..." />}
      {error && <div className="text-center font-pixel text-pixel-coral">Error: {error}</div>}

      {!loading && !error && filteredRecommendations.length === 0 && (
        <div className="text-center font-pixel opacity-60">
          {statusFilter === 'all' ? 'No recommendations found' : `No ${statusFilter} recommendations`}
        </div>
      )}

      {!loading && !error && filteredRecommendations.length > 0 && (
        <div className="space-y-3">
          {filteredRecommendations.map((rec) => (
            <div key={rec._id} className="app-card p-4">
              <div className="flex justify-between items-start mb-3 gap-4">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-2 flex-wrap">
                    <span className="font-pixel text-xs bg-pixel-purple px-2 py-1 capitalize">
                      {rec.recommendationType?.replace(/_/g, ' ')}
                    </span>
                    <span className="font-pixel text-xs px-2 py-1 border border-pixel-teal">
                      {rec.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-pixel text-sm mb-2">{rec.issue}</p>
                  <p className="text-sm font-pixel opacity-80 mb-3">{rec.recommendation}</p>
                </div>
                <div className="text-right bg-pixel-purple p-3 border border-pixel-coral">
                  <p className="font-pixel text-xs opacity-80">Monthly Savings</p>
                  <p className="font-pixel text-xl text-pixel-coral">
                    ${rec.estimatedSavings?.monthlyAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {!isReadOnly && rec.status === 'active' && (
                <button
                  onClick={() => setSelectedRec(rec)}
                  className="px-3 py-2 bg-pixel-teal text-pixel-darker font-pixel text-xs border border-pixel-teal hover:opacity-80"
                >
                  Apply Recommendation
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedRec && !isReadOnly && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRec(null)}
        >
          <div className="app-card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="app-section-title mb-4">Apply Recommendation</h3>
            <div className="space-y-3 font-pixel text-sm mb-6">
              <p>
                <span className="opacity-60">Type:</span> {selectedRec.recommendationType}
              </p>
              <p className="text-xs opacity-80">{selectedRec.issue}</p>
              <p className="bg-pixel-purple p-2 border border-pixel-coral">
                Potential Savings: ${selectedRec.estimatedSavings?.monthlyAmount?.toFixed(2) || '0.00'}/month
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-pixel mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this action"
                className="app-input"
                rows="4"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleApply(selectedRec._id)}
                disabled={applyLoading}
                className="flex-1 px-4 py-2 bg-pixel-teal text-pixel-darker font-pixel border border-pixel-teal hover:opacity-80 disabled:opacity-50"
              >
                {applyLoading ? 'Applying...' : 'Apply'}
              </button>
              <button
                onClick={() => setSelectedRec(null)}
                className="flex-1 px-4 py-2 bg-pixel-darker text-pixel-teal font-pixel border border-pixel-teal hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
