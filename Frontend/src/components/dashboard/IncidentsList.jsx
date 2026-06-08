import { useState } from 'react'
import { useGetIncidents, useAcknowledgeIncident } from '@/services/dataFetching'
import PixelLoader from '@/components/ui/PixelLoader'

export default function IncidentsList({ isReadOnly = false }) {
  const { data: incidents, loading, error, refetch } = useGetIncidents()
  const { acknowledge, loading: ackLoading } = useAcknowledgeIncident()
  const [statusFilter, setStatusFilter] = useState('active')
  const [selectedIncident, setSelectedIncident] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const filteredIncidents = incidents?.filter((i) => statusFilter === 'all' || i.status === statusFilter) || []

  const handleAcknowledge = async (incidentId) => {
    const result = await acknowledge(incidentId)
    if (result.success) {
      setFeedback({ type: 'success', message: 'Incident acknowledged successfully' })
      refetch()
      return
    }
    setFeedback({ type: 'error', message: result.error })
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Incidents</h2>

      {!isReadOnly && (
        <div className="flex gap-2 flex-wrap">
          {['active', 'acknowledged', 'resolved', 'all'].map((status) => (
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

      {loading && <PixelLoader message="Scanning anomaly engine..." />}
      {error && <div className="text-center font-pixel text-pixel-coral">Error: {error}</div>}

      {!loading && !error && filteredIncidents.length === 0 && (
        <div className="text-center font-pixel opacity-60">
          {statusFilter === 'all' ? 'No incidents found' : `No ${statusFilter} incidents`}
        </div>
      )}

      {!loading && !error && filteredIncidents.length > 0 && (
        <div className="space-y-3">
          {filteredIncidents.map((incident) => (
            <div
              key={incident._id}
              className="app-card p-4 hover:opacity-90 cursor-pointer transition"
              onClick={() => setSelectedIncident(incident)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-2 flex-wrap">
                    <span className="font-pixel text-xs bg-pixel-purple px-2 py-1">
                      {incident.incidentType?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span
                      className={`font-pixel text-xs px-2 py-1 ${
                        incident.severity === 'critical'
                          ? 'bg-pixel-coral text-pixel-darker'
                          : incident.severity === 'high'
                            ? 'bg-pixel-teal text-pixel-darker'
                            : 'bg-pixel-purple'
                      }`}
                    >
                      {incident.severity?.toUpperCase()}
                    </span>
                    <span className="font-pixel text-xs px-2 py-1 border border-pixel-teal">
                      {incident.status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-pixel text-sm mb-2">{incident.description}</p>
                  {incident.provider && (
                    <p className="text-xs opacity-60 font-pixel">
                      {incident.provider.toUpperCase()} {incident.serviceType && `- ${incident.serviceType}`}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-60 font-pixel">
                    {new Date(incident.detectedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {incident.metrics && (
                <div className="mt-3 text-xs font-pixel opacity-80">
                  <p>
                    Current: {(Number(incident.metrics.currentValue || 0) * 100).toFixed(1)}% / Threshold:{' '}
                    {(Number(incident.metrics.threshold || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              )}

              {!isReadOnly && incident.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAcknowledge(incident._id)
                  }}
                  disabled={ackLoading}
                  className="mt-3 px-3 py-2 bg-pixel-teal text-pixel-darker font-pixel text-xs border border-pixel-teal hover:opacity-80 disabled:opacity-50"
                >
                  {ackLoading ? 'Acknowledging...' : 'Acknowledge'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedIncident && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="app-card max-w-md w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="app-section-title mb-4">Incident Details</h3>
            <div className="space-y-3 font-pixel text-sm">
              <p>
                <span className="opacity-60">Type:</span> {selectedIncident.incidentType}
              </p>
              <p>
                <span className="opacity-60">Severity:</span> {selectedIncident.severity}
              </p>
              <p>
                <span className="opacity-60">Status:</span> {selectedIncident.status}
              </p>
              <p>
                <span className="opacity-60">Description:</span>
              </p>
              <p className="whitespace-pre-wrap">{selectedIncident.description}</p>
              <p>
                <span className="opacity-60">Detected:</span>{' '}
                {new Date(selectedIncident.detectedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="mt-6 w-full px-4 py-2 bg-pixel-teal text-pixel-darker font-pixel border border-pixel-teal hover:opacity-80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
