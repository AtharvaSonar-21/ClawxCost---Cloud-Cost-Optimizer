import { useState } from 'react'
import { apiPost } from '@/api/client'

export default function CostEstimator() {
  const [form, setForm] = useState({
    provider: 'gcp',
    instanceType: 'medium',
    commitment: 'on_demand',
    computeHours: 720,
    storageGb: 100,
    egressGb: 50,
    managedDbHours: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const update = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    const payload = {
      ...form,
      computeHours: Number(form.computeHours),
      storageGb: Number(form.storageGb),
      egressGb: Number(form.egressGb),
      managedDbHours: Number(form.managedDbHours),
    }

    const response = await apiPost('/analytics/estimate', payload)
    setLoading(false)

    if (!response.success) {
      setError(response.message || 'Failed to estimate cost')
      return
    }
    setResult(response.data)
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Pre-Deployment Cost Estimator</h2>

      <form onSubmit={handleSubmit} className="app-card max-w-3xl space-y-4">
        <p className="app-subheading">
          Estimate monthly cloud cost before deployment using provider baseline pricing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select name="provider" value={form.provider} onChange={update} className="app-input">
            <option value="aws">AWS</option>
            <option value="gcp">GCP</option>
            <option value="azure">Azure</option>
          </select>
          <select name="instanceType" value={form.instanceType} onChange={update} className="app-input">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <select name="commitment" value={form.commitment} onChange={update} className="app-input">
            <option value="on_demand">On-Demand</option>
            <option value="reserved_1y">Reserved 1Y</option>
            <option value="reserved_3y">Reserved 3Y</option>
          </select>

          <input
            type="number"
            name="computeHours"
            min="0"
            value={form.computeHours}
            onChange={update}
            className="app-input"
            placeholder="Compute hours / month"
          />
          <input
            type="number"
            name="storageGb"
            min="0"
            value={form.storageGb}
            onChange={update}
            className="app-input"
            placeholder="Storage GB / month"
          />
          <input
            type="number"
            name="egressGb"
            min="0"
            value={form.egressGb}
            onChange={update}
            className="app-input"
            placeholder="Network egress GB / month"
          />
        </div>

        <input
          type="number"
          name="managedDbHours"
          min="0"
          value={form.managedDbHours}
          onChange={update}
          className="app-input max-w-sm"
          placeholder="Managed DB hours / month"
        />

        {error && (
          <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
            {error}
          </div>
        )}

        <button type="submit" className="app-btn-primary" disabled={loading}>
          {loading ? 'Estimating...' : 'Estimate Monthly Cost'}
        </button>
      </form>

      {result && (
        <div className="app-card max-w-3xl space-y-3">
          <h3 className="font-pixel text-lg">Estimate Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-pixel text-xs">
            <p>Provider: {String(result.provider || '').toUpperCase()}</p>
            <p>Commitment: {String(result.commitment || '').replace('_', ' ')}</p>
            <p>Monthly Total: ${Number(result.monthlyTotal || 0).toFixed(2)}</p>
            <p>Daily Average: ${Number(result.dailyAverage || 0).toFixed(2)}</p>
          </div>

          <div className="border-2 border-pixel-teal p-3 font-pixel text-xs space-y-1">
            <p>Compute: ${Number(result.breakdown?.compute || 0).toFixed(2)}</p>
            <p>Storage: ${Number(result.breakdown?.storage || 0).toFixed(2)}</p>
            <p>Egress: ${Number(result.breakdown?.egress || 0).toFixed(2)}</p>
            <p>Managed DB: ${Number(result.breakdown?.managedDb || 0).toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
