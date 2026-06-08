import { useEffect, useState } from 'react'
import { apiGet, apiPut } from '@/api/client'

export default function BudgetAlerts() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [status, setStatus] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState({
    monthlyBudget: 10000,
    warning: 75,
    critical: 90,
    alertsEnabled: true,
  })

  const loadBudget = async () => {
    setLoading(true)
    setError('')

    const [configRes, statusRes, alertsRes] = await Promise.all([
      apiGet('/budgets/config'),
      apiGet('/budgets/status'),
      apiGet('/budgets/alerts'),
    ])

    if (!configRes.success) {
      setError(configRes.message || 'Failed to load budget configuration')
      setLoading(false)
      return
    }

    setForm({
      monthlyBudget: Number(configRes.data?.monthlyBudget || 10000),
      warning: Number(configRes.data?.thresholds?.warning || 75),
      critical: Number(configRes.data?.thresholds?.critical || 90),
      alertsEnabled: Boolean(configRes.data?.alertsEnabled ?? true),
    })

    if (statusRes.success) setStatus(statusRes.data || null)
    if (alertsRes.success) setAlerts(alertsRes.data?.alerts || [])
    setLoading(false)
  }

  useEffect(() => {
    loadBudget()
  }, [])

  const update = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess('')
    setError('')

    const payload = {
      monthlyBudget: Number(form.monthlyBudget),
      thresholds: {
        warning: Number(form.warning),
        critical: Number(form.critical),
      },
      alertsEnabled: Boolean(form.alertsEnabled),
    }

    if (payload.thresholds.critical < payload.thresholds.warning) {
      setSaving(false)
      setError('Critical threshold cannot be lower than warning threshold')
      return
    }

    const response = await apiPut('/budgets/config', payload)
    setSaving(false)

    if (!response.success) {
      setError(response.message || 'Failed to update budget configuration')
      return
    }

    setSuccess('Budget configuration updated successfully.')
    await loadBudget()
  }

  const statusColor = {
    ok: 'text-pixel-teal',
    warning: 'text-pixel-yellow',
    critical: 'text-pixel-coral',
    exceeded: 'text-pixel-coral',
  }

  if (loading) {
    return <div className="font-pixel">Loading budget and alerts...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Budget Thresholds & Alerts</h2>

      <form onSubmit={handleSave} className="app-card max-w-3xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="number"
            min="1"
            name="monthlyBudget"
            value={form.monthlyBudget}
            onChange={update}
            className="app-input"
            placeholder="Monthly budget ($)"
          />
          <input
            type="number"
            min="1"
            max="100"
            name="warning"
            value={form.warning}
            onChange={update}
            className="app-input"
            placeholder="Warning threshold %"
          />
          <input
            type="number"
            min="1"
            max="100"
            name="critical"
            value={form.critical}
            onChange={update}
            className="app-input"
            placeholder="Critical threshold %"
          />
        </div>

        <label className="flex items-center gap-2 font-pixel text-xs">
          <input
            type="checkbox"
            name="alertsEnabled"
            checked={form.alertsEnabled}
            onChange={update}
          />
          Enable alerts
        </label>

        {error && (
          <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs">
            {success}
          </div>
        )}

        <button type="submit" className="app-btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Budget Settings'}
        </button>
      </form>

      <div className="app-card max-w-3xl space-y-3">
        <h3 className="font-pixel text-lg">Current Status</h3>
        {!status ? (
          <p className="font-pixel text-xs opacity-70">No status available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-pixel text-xs">
            <p>
              Alert Level:{' '}
              <span className={statusColor[status.alertLevel] || 'text-pixel-teal'}>
                {String(status.alertLevel || 'ok').toUpperCase()}
              </span>
            </p>
            <p>Current Spend: ${Number(status.currentSpend || 0).toFixed(2)}</p>
            <p>Budget Limit: ${Number(status.budgetLimit || 0).toFixed(2)}</p>
            <p>Projected Total: ${Number(status.projectedMonthlyTotal || 0).toFixed(2)}</p>
            <p>Budget Used: {Number(status.percentageOfBudget || 0).toFixed(1)}%</p>
            <p>Days Remaining: {Number(status.daysRemaining || 0)}</p>
          </div>
        )}
      </div>

      <div className="app-card max-w-3xl space-y-3">
        <h3 className="font-pixel text-lg">Active Alerts</h3>
        {alerts.length === 0 ? (
          <p className="font-pixel text-xs opacity-70">No active alerts right now.</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a, idx) => (
              <div key={`${a.type}-${idx}`} className="border-2 border-pixel-coral p-3 font-pixel text-xs">
                <p className="text-pixel-coral uppercase">{a.severity}</p>
                <p>{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
