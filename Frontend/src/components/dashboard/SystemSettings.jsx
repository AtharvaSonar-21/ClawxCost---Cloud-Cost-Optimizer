import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '@/api/client'
import PixelLoader from '@/components/ui/PixelLoader'

export default function SystemSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState({ configured: false })
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchStatus = async () => {
    setLoading(true)
    setError('')
    const response = await apiGet('/admin/config/gemini-key-status')
    if (response.success) {
      setStatus(response.data || { configured: false })
    } else {
      setError(response.message || 'Failed to retrieve configuration status.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleSaveKey = async (e) => {
    e.preventDefault()
    if (!apiKey.trim()) {
      setError('Please input a valid API key.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    const response = await apiPost('/admin/config/gemini-key', { apiKey: apiKey.trim() })
    setSaving(false)

    if (response.success) {
      setSuccess('Gemini API key configured successfully!')
      setApiKey('')
      await fetchStatus()
    } else {
      setError(response.message || 'Failed to configure API key.')
    }
  }

  if (loading) {
    return <PixelLoader message="Connecting to Admin Config services..." />
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title text-pixel-coral">System Configuration</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gemini API Key Form */}
        <div className="app-card border-pixel-coral space-y-4">
          <h3 className="text-lg font-pixel text-pixel-coral">Gemini AI Engine</h3>
          <p className="app-subheading text-xs">
            ClawxCost utilizes the Gemini API for natural language cloud billing analytics.
            Configure the global system-wide key below.
          </p>

          <div className="p-3 border border-pixel-coral/30 bg-pixel-black/40 font-pixel text-xs space-y-2">
            <p className="flex justify-between">
              <span>Status:</span>
              <span className={status.configured ? 'text-pixel-teal font-bold' : 'text-pixel-coral font-bold'}>
                {status.configured ? 'CONFIGURED' : 'NOT CONFIGURED'}
              </span>
            </p>
            {status.lastUpdated && (
              <p className="flex justify-between opacity-70 text-[10px]">
                <span>Last Updated:</span>
                <span>{new Date(status.lastUpdated).toLocaleString()}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <label className="block font-pixel text-[10px] mb-2">New Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Gemini API key (e.g. AIzaSy...)"
                className="app-input border-pixel-coral focus:border-pixel-purple"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs hover:opacity-85 disabled:opacity-50"
            >
              {saving ? 'Configuring Key...' : 'Save Configuration'}
            </button>
          </form>

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
        </div>

        {/* System Credentials & Info */}
        <div className="app-card border-pixel-coral space-y-4">
          <h3 className="text-lg font-pixel text-pixel-coral">Platform Overview</h3>
          <p className="app-subheading text-xs">
            System operations metrics and default configurations active in this session.
          </p>

          <div className="space-y-3 font-pixel text-xs">
            <div className="p-3 border border-pixel-coral/20 bg-pixel-black/20 space-y-2">
              <p className="text-[10px] text-pixel-coral uppercase tracking-wider">Default Seed Credentials</p>
              <p className="flex justify-between text-[10px] font-mono">
                <span>Default Admin:</span>
                <span className="opacity-80">admin@clawxcost.com</span>
              </p>
              <p className="flex justify-between text-[10px] font-mono">
                <span>Password:</span>
                <span className="opacity-80">ClawxCostAdmin2026!</span>
              </p>
            </div>

            <div className="p-3 border border-pixel-coral/20 bg-pixel-black/20 space-y-2">
              <p className="text-[10px] text-pixel-coral uppercase tracking-wider">Mongoose Database State</p>
              <p className="flex justify-between text-[10px]">
                <span>Ingestion Pipeline:</span>
                <span className="text-pixel-teal">ACTIVE</span>
              </p>
              <p className="flex justify-between text-[10px]">
                <span>Anomalies Monitor:</span>
                <span className="text-pixel-teal">ACTIVE</span>
              </p>
              <p className="flex justify-between text-[10px]">
                <span>Google OAuth Login:</span>
                <span className="text-pixel-teal">CONFIGURED</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
