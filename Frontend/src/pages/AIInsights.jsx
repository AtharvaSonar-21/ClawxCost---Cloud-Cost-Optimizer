import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ChatInterface from '@/components/ai/ChatInterface';
import BillingContext from '@/components/ai/BillingContext';
import { apiGet, apiPost, apiPostForm } from '@/api/client';

export default function AIInsights() {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [costContext, setCostContext] = useState({});
  const [geminiConfigured, setGeminiConfigured] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [providerHint, setProviderHint] = useState('auto');
  const [uploading, setUploading] = useState(false);
  const starsRef = useRef(null);

  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div');
      s.style.cssText = `
        position: absolute;
        width: 4px; height: 4px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: ${Math.random() > 0.6 ? '#22d3ee' : Math.random() > 0.5 ? '#c4b5fd' : '#fff'};
        animation: twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 3}s;
        pointer-events: none;
        opacity: 0.65;
      `;
      container.appendChild(s);
    }
    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const checkGemini = async () => {
      try {
        const response = await apiGet('/admin/config/gemini-key-configured');
        setGeminiConfigured(Boolean(response.success && response.data?.configured));
      } catch (err) {
        console.error('Failed to check Gemini config:', err);
        setGeminiConfigured(false);
      }
    };

    checkGemini();
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;

      try {
        const response = await apiGet('/ai-insights/history');
        if (response.success) {
          setMessages(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };

    loadHistory();
  }, [token]);

  // Load cost context from backend aggregates
  useEffect(() => {
    const loadCostContext = async () => {
      if (!token) return;

      try {
        const response = await apiGet('/analytics/cost-summary');
        if (response.success) {
          const summary = response.data?.costSummary || response.data || {};
          
          // Fetch incidents count
          const incidentsRes = await apiGet('/incidents');
          const activeIncidents = Array.isArray(incidentsRes.data)
            ? incidentsRes.data.filter((i) => i.status === 'active').length
            : Array.isArray(incidentsRes.data?.incidents)
            ? incidentsRes.data.incidents.filter((i) => i.status === 'active').length
            : 0;

          // Fetch recommendations count
          const recsRes = await apiGet('/recommendations');
          const pendingRecommendations = Array.isArray(recsRes.data)
            ? recsRes.data.filter((r) => r.status === 'active').length
            : Array.isArray(recsRes.data?.recommendations)
            ? recsRes.data.recommendations.filter((r) => r.status === 'active').length
            : 0;

          setCostContext({
            totalCost: summary.totalCost || 0,
            costByProvider: summary.costByProvider || {},
            costByServiceType: summary.costByServiceType || {},
            activeIncidents,
            pendingRecommendations,
          });
        }
      } catch (err) {
        console.error('Failed to load cost context:', err);
      }
    };

    loadCostContext();
  }, [token]);

  const handleSendMessage = async (message, context) => {
    if (geminiConfigured === false) {
      setError('AI features are not configured for this environment.');
      return;
    }

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost('/ai-insights/chat', {
        message,
        context,
      });

      if (response.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.message,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setError(response.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeFile = async () => {
    if (geminiConfigured === false) {
      setError('AI features are not configured for this environment.');
      return;
    }

    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError(null);

    const userMessage = {
      role: 'user',
      content: `Uploaded file for AI analysis: ${selectedFile.name}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('provider', providerHint);

    const response = await apiPostForm('/ai-insights/analyze-file', formData);
    setUploading(false);

    if (response.success) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.data.message,
        },
      ]);
      setSelectedFile(null);
      return;
    }

    setError(response.message || 'Failed to analyze file');
  };

  return (
    <div className="app-page bg-pixel-darkest relative overflow-hidden bg-pixel-grid min-h-screen">
      <div ref={starsRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="app-shell max-w-7xl relative z-10 w-full">
        <div className="mb-4">
          <Link
            to={user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user'}
            className="inline-block px-4 py-2 border-2 border-pixel-teal text-pixel-teal font-pixel text-xs hover:bg-pixel-teal hover:text-pixel-darker transition"
          >
            Back to Dashboard
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="app-heading mb-2">AI Cost Insights</h1>
          <p className="app-subheading">
            Ask questions about your cloud costs and get AI-powered insights
          </p>
        </div>

        {geminiConfigured === false && (
          <div className="mb-6 p-4 bg-pixel-coral text-pixel-darker border-2 border-pixel-coral font-pixel">
            <p className="font-bold mb-2">AI Features Not Configured</p>
            <p className="text-sm">
              The administrator needs to configure the Gemini API key for AI insights to work.
              Please contact your administrator.
            </p>
          </div>
        )}

        <div className="app-card mb-4 bg-pixel-black">
          <h3 className="font-pixel text-sm mb-3">Upload Billing File (JSON, PDF, Excel, Image)</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={providerHint}
              onChange={(e) => setProviderHint(e.target.value)}
              className="px-3 py-2 bg-pixel-darker border-2 border-pixel-teal font-pixel text-xs"
            >
              <option value="auto">Auto Detect Provider</option>
              <option value="aws">AWS</option>
              <option value="gcp">GCP/GCS</option>
              <option value="azure">Azure</option>
            </select>

            <input
              type="file"
              accept=".json,.pdf,.xlsx,.xls,image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="md:col-span-2 px-2 py-2 bg-pixel-darker border-2 border-pixel-teal font-pixel text-xs"
            />

            <button
              onClick={handleAnalyzeFile}
              disabled={geminiConfigured === false || uploading || !selectedFile}
              className="px-4 py-2 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs disabled:opacity-50"
            >
              {uploading ? 'Analyzing...' : 'Analyze File'}
            </button>
          </div>
          {selectedFile && (
            <p className="mt-2 text-xs font-pixel opacity-70">Selected: {selectedFile.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 flex flex-col min-h-[60vh] h-[62vh] sm:h-[65vh] lg:h-[70vh]">
            <ChatInterface
              messages={messages}
              loading={loading}
              error={error}
              onSendMessage={handleSendMessage}
              costContext={costContext}
              disabled={geminiConfigured === false}
            />
          </div>

          <div className="lg:col-span-1 overflow-y-auto lg:max-h-[70vh]">
            <BillingContext />
          </div>
        </div>

        <div className="mt-8 p-6 bg-pixel-purple border-2 border-pixel-coral">
          <h3 className="font-pixel text-lg mb-3">What can I ask?</h3>
          <ul className="space-y-2 font-pixel text-sm opacity-80">
            <li>Ask about your cost breakdown by provider or service type</li>
            <li>Get recommendations on how to optimize your spending</li>
            <li>Understand cost trends and anomalies</li>
            <li>Learn about cloud cost best practices</li>
            <li>Identify cost reduction opportunities</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
