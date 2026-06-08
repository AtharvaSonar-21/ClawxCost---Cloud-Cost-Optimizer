import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/api/client";

export default function CloudConnections() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncingId, setSyncingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [connections, setConnections] = useState([]);
  const [form, setForm] = useState({
    provider: "gcp",
    accountName: "",
    accountId: "",
    projectId: "",
    serviceAccountJson: "",
  });

  const loadConnections = async () => {
    setLoading(true);
    setError("");
    const response = await apiGet("/cloud/connections");
    if (!response.success) {
      setError(response.message || "Failed to load cloud connections");
      setLoading(false);
      return;
    }
    setConnections(response.data?.connections || []);
    setLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      provider: form.provider,
      accountName: form.accountName.trim(),
      accountId: form.accountId.trim(),
      projectId: form.projectId.trim() || null,
      serviceAccountJson: form.serviceAccountJson.trim(),
    };

    const response = await apiPost("/cloud/connect", payload);
    setSubmitting(false);

    if (!response.success) {
      setError(response.message || "Failed to link cloud account");
      return;
    }

    setSuccess("Cloud account linked successfully.");
    setForm({
      provider: "gcp",
      accountName: "",
      accountId: "",
      projectId: "",
      serviceAccountJson: "",
    });
    await loadConnections();
  };

  const handleDisconnect = async (id) => {
    setError("");
    setSuccess("");
    const response = await apiDelete(`/cloud/connections/${id}`);
    if (!response.success) {
      setError(response.message || "Failed to disconnect cloud account");
      return;
    }
    setSuccess("Cloud account disconnected.");
    await loadConnections();
  };

  const handleSync = async (id) => {
    setError("");
    setSuccess("");
    setSyncingId(id);
    const response = await apiPost(`/cloud/connections/${id}/sync`, {});
    setSyncingId("");
    if (!response.success) {
      setError(response.message || "Failed to sync cloud account");
      return;
    }
    setSuccess(response.data?.message || "Cloud account sync completed.");
    await loadConnections();
  };

  return (
    <div className="space-y-6">
      <h2 className="app-section-title">Cloud Account Linking</h2>

      <form onSubmit={handleConnect} className="app-card space-y-4">
        <p className="app-subheading">
          Link and validate your GCP billing account. Service account JSON is used for one-time
          validation and is not persisted by this app.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            name="provider"
            value={form.provider}
            onChange={handleChange}
            className="app-input"
          >
            <option value="gcp">Google Cloud Platform</option>
            <option value="aws" disabled>Amazon Web Services (Coming Soon)</option>
            <option value="azure" disabled>Microsoft Azure (Coming Soon)</option>
          </select>

          <input
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            placeholder="Account display name"
            className="app-input"
            required
          />

          <input
            name="accountId"
            value={form.accountId}
            onChange={handleChange}
            placeholder="Billing account ID (e.g., 01A2B3-45C6D7-89E0F1)"
            className="app-input"
            required
          />

          <input
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            placeholder="Project ID (optional)"
            className="app-input"
          />
        </div>

        <textarea
          name="serviceAccountJson"
          value={form.serviceAccountJson}
          onChange={handleChange}
          placeholder='Paste GCP service account JSON (requires cloud-billing read permissions)'
          className="app-input min-h-[140px]"
          required
        />

        <p className="font-pixel text-[10px] opacity-70">
          Currently only GCP validated linking is supported. Sync refreshes analytics from ingested
          billing data.
        </p>

        <button type="submit" disabled={submitting} className="app-btn-primary">
          {submitting ? "Linking..." : "Link Cloud Account"}
        </button>
      </form>

      {error && <div className="p-3 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel text-xs">{error}</div>}
      {success && <div className="p-3 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs">{success}</div>}

      <div className="app-card space-y-3">
        <h3 className="text-xl font-pixel">Linked Accounts</h3>
        {loading ? (
          <p className="font-pixel text-sm opacity-70">Loading...</p>
        ) : connections.length === 0 ? (
          <p className="font-pixel text-sm opacity-70">No cloud accounts linked yet.</p>
        ) : (
          <div className="space-y-2">
            {connections.map((conn) => (
              <div
                key={conn._id}
                className="border-2 border-pixel-teal p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div className="font-pixel text-xs space-y-1">
                  <p>
                    <span className="opacity-70">Provider:</span>{" "}
                    {String(conn.provider || "").toUpperCase()}
                  </p>
                  <p>
                    <span className="opacity-70">Account:</span> {conn.accountName}
                  </p>
                  <p>
                    <span className="opacity-70">ID:</span> {conn.accountId}
                  </p>
                  {conn.projectId && (
                    <p>
                      <span className="opacity-70">Project:</span> {conn.projectId}
                    </p>
                  )}
                  <p>
                    <span className="opacity-70">Last Sync:</span>{" "}
                    {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString() : "Never"}
                  </p>
                  {conn.metadata?.lastSyncMessage && (
                    <p className="opacity-70">{conn.metadata.lastSyncMessage}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleSync(conn._id)}
                    disabled={syncingId === conn._id}
                    className="px-3 py-2 border-2 border-pixel-teal bg-pixel-teal text-pixel-darker font-pixel text-xs hover:opacity-80 disabled:opacity-50"
                  >
                    {syncingId === conn._id ? "Syncing..." : "Sync Now"}
                  </button>
                  <button
                    onClick={() => handleDisconnect(conn._id)}
                    className="px-3 py-2 border-2 border-pixel-coral bg-pixel-coral text-pixel-darker font-pixel text-xs hover:opacity-80"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
