import { useState } from 'react'
import { useUploadBilling } from '@/services/dataFetching'
import { apiPostForm } from '@/api/client'

export default function BillingUpload() {
  const [uploadMode, setUploadMode] = useState('single')
  const [formData, setFormData] = useState({
    provider: 'aws',
    service: '',
    region: '',
    cost: '',
    usageHours: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [csvFile, setCsvFile] = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const { upload, loading } = useUploadBilling()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSingleSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)

    if (!formData.service || !formData.region || !formData.cost || !formData.usageHours) {
      setFeedback({ type: 'error', message: 'Please fill all required fields' })
      return
    }

    const result = await upload({
      ...formData,
      cost: parseFloat(formData.cost),
      usageHours: parseFloat(formData.usageHours),
    })

    if (result.success) {
      setFeedback({ type: 'success', message: 'Billing data uploaded successfully!' })
      setFormData({
        provider: 'aws',
        service: '',
        region: '',
        cost: '',
        usageHours: '',
        date: new Date().toISOString().split('T')[0],
      })
      return
    }

    setFeedback({ type: 'error', message: result.error || 'Failed to upload billing data' })
  }

  const handleCsvSubmit = async (e) => {
    e.preventDefault()
    setFeedback(null)

    if (!csvFile) {
      setFeedback({ type: 'error', message: 'Please select a CSV file' })
      return
    }

    setCsvLoading(true)
    try {
      const formDataObj = new FormData()
      formDataObj.append('file', csvFile)

      const response = await apiPostForm('/billing/upload', formDataObj)

      if (response.success) {
        setFeedback({
          type: 'success',
          message: `CSV uploaded successfully! ${response.data?.processedRecords || 0} records processed.`,
        })
        setCsvFile(null)
        const fileInput = document.getElementById('csv-file-input')
        if (fileInput) fileInput.value = ''
        return
      }

      setFeedback({ type: 'error', message: response.message || 'Failed to upload CSV' })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to upload CSV' })
    } finally {
      setCsvLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Upload Billing Data</h2>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUploadMode('single')}
          className={`px-4 py-2 font-pixel text-xs border-2 transition ${
            uploadMode === 'single'
              ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
              : 'bg-pixel-darker text-pixel-teal border-pixel-teal hover:opacity-80'
          }`}
        >
          Single Record
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('csv')}
          className={`px-4 py-2 font-pixel text-xs border-2 transition ${
            uploadMode === 'csv'
              ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
              : 'bg-pixel-darker text-pixel-teal border-pixel-teal hover:opacity-80'
          }`}
        >
          Upload CSV
        </button>
      </div>

      {uploadMode === 'single' && (
        <form onSubmit={handleSingleSubmit} className="app-card max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-pixel mb-2">Cloud Provider</label>
            <select name="provider" value={formData.provider} onChange={handleChange} className="app-input">
              <option value="aws">AWS</option>
              <option value="gcp">Google Cloud</option>
              <option value="azure">Azure</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Service *</label>
            <input
              type="text"
              name="service"
              placeholder="e.g., EC2, S3, RDS"
              value={formData.service}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Region *</label>
            <input
              type="text"
              name="region"
              placeholder="e.g., us-east-1"
              value={formData.region}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Daily Cost ($) *</label>
            <input
              type="number"
              name="cost"
              placeholder="0.00"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Usage Hours *</label>
            <input
              type="number"
              name="usageHours"
              placeholder="24"
              step="0.5"
              value={formData.usageHours}
              onChange={handleChange}
              required
              className="app-input"
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="app-input" />
          </div>

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

          <button type="submit" disabled={loading} className="app-btn-primary">
            {loading ? 'Uploading...' : 'Upload Billing Data'}
          </button>
        </form>
      )}

      {uploadMode === 'csv' && (
        <form onSubmit={handleCsvSubmit} className="app-card max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-pixel mb-2">Select CSV File *</label>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              required
              className="app-input"
            />
            {csvFile && <p className="text-xs font-pixel opacity-70 mt-2">Selected: {csvFile.name}</p>}
          </div>

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

          <button type="submit" disabled={csvLoading || !csvFile} className="app-btn-primary">
            {csvLoading ? 'Uploading...' : 'Upload CSV File'}
          </button>

          <div className="p-3 bg-pixel-purple/30 border border-pixel-coral text-xs font-mono">
            💡 Pro-Tip: To upload and analyze **Excel (.xlsx)** or **PDF** statements, head to the{' '}
            <a href="/ai-insights" className="text-pixel-teal hover:underline font-pixel text-[10px]">
              AI Cost Insights
            </a>{' '}
            page to analyze them directly with Gemini AI!
          </div>
        </form>
      )}

      <div className="app-card max-w-2xl bg-pixel-purple border-pixel-coral">
        <h3 className="font-pixel mb-3">CSV Format Guide</h3>
        <p className="text-sm font-pixel opacity-80 mb-3">
          Your CSV file should have the following columns (header row required):
        </p>
        <div className="bg-pixel-black p-3 border border-pixel-teal text-xs font-pixel mb-3 overflow-x-auto">
          <code>provider,service,region,cost,usageHours,date</code>
        </div>
        <p className="text-sm font-pixel opacity-80 mb-3">Example:</p>
        <div className="bg-pixel-black p-3 border border-pixel-teal text-xs font-pixel overflow-x-auto">
          <code>
            aws,EC2,us-east-1,250,24,2026-03-04
            <br />
            aws,S3,us-east-1,40,0,2026-03-04
            <br />
            gcp,Compute Engine,us-central1,120,24,2026-03-04
          </code>
        </div>
        <p className="text-sm font-pixel opacity-80 mt-3">
          Supported providers: AWS, GCP, Azure
          <br />
          Service names must match your provider naming conventions
        </p>
      </div>
    </div>
  )
}
