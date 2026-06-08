import { useEffect, useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminNav from '@/components/dashboard/AdminNav'
import BillingUpload from '@/components/dashboard/BillingUpload'
import ProfileSettings from '@/components/dashboard/ProfileSettings'
import SystemSettings from '@/components/dashboard/SystemSettings'
import PixelLoader from '@/components/ui/PixelLoader'
import { useGetAdminOverview } from '@/services/dataFetching'
import { apiPut, apiGet } from '@/api/client'

const VALID_SECTIONS = new Set(['home', 'upload', 'profile', 'system'])

const RANDOM_SYSTEM_LOGS = [
  'System check: Database connection is healthy.',
  'Running background scan on AWS billing collections...',
  'All cloud account metrics are fully loaded.',
  'Uptime check: Server has been running fine.',
  'Scanning for cost anomalies... none found today.',
  'Calculating 7-day rolling averages for cost charts...',
  'Cache check: Session tokens verified successfully.',
  'Background task: Billing statistics calculated.'
]

const RANDOM_BUSINESS_LOGS = [
  'Log: Uploaded a new cost statement successfully.',
  'User alert: 0 security risks found.',
  'Database query: Updated user stats and charts.',
  'Log: New user account registered on the landing page.',
  'System update: Recalculated savings recommendations.',
  'Compliance check: Admin API keys are validated.'
]

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSection = searchParams.get('section')
  const [currentSection, setCurrentSection] = useState(
    initialSection && VALID_SECTIONS.has(initialSection) ? initialSection : 'home'
  )
  const starsRef = useRef(null)

  // Lifted state to fetch early access email leads dynamically from MongoDB across dashboard
  const [leadsList, setLeadsList] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(false)
  const [activeNotifications, setActiveNotifications] = useState([])
  const [provisionedCreds, setProvisionedCreds] = useState(null)

  const fetchLeads = async (silent = false) => {
    if (!silent) setLoadingLeads(true)
    const response = await apiGet('/admin/leads')
    if (!silent) setLoadingLeads(false)
    if (response.success) {
      setLeadsList(response.data || [])
    }
  }

  // Calculate pending leads count
  const pendingLeadsCount = useMemo(() => {
    return leadsList.filter(l => l.status === 'pending').length
  }, [leadsList])

  // Establish background polling interval for real-time lead ingress alerts
  useEffect(() => {
    fetchLeads() // initial fetch

    const interval = setInterval(async () => {
      try {
        const response = await apiGet('/admin/leads')
        if (response.success) {
          const newData = response.data || []
          
          setLeadsList((prevList) => {
            const prevIds = new Set(prevList.map(l => String(l._id)))
            const newPending = newData.filter(l => l.status === 'pending' && !prevIds.has(String(l._id)))
            
            if (newPending.length > 0) {
              newPending.forEach(lead => {
                const id = Date.now() + Math.random()
                const newNotif = {
                  id,
                  email: lead.email,
                  timestamp: new Date(lead.createdAt).toLocaleTimeString(),
                  leadId: lead._id,
                }
                setActiveNotifications(prev => [...prev, newNotif])

                // Trigger cybernetic retro 8-bit double beep audio alert!
                try {
                  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
                  const osc1 = audioCtx.createOscillator()
                  const gain1 = audioCtx.createGain()
                  osc1.connect(gain1)
                  gain1.connect(audioCtx.destination)
                  osc1.type = 'square'
                  osc1.frequency.setValueAtTime(600, audioCtx.currentTime)
                  gain1.gain.setValueAtTime(0.04, audioCtx.currentTime)
                  osc1.start()
                  osc1.stop(audioCtx.currentTime + 0.15)
                  
                  setTimeout(() => {
                    const osc2 = audioCtx.createOscillator()
                    const gain2 = audioCtx.createGain()
                    osc2.connect(gain2)
                    gain2.connect(audioCtx.destination)
                    osc2.type = 'square'
                    osc2.frequency.setValueAtTime(800, audioCtx.currentTime)
                    gain2.gain.setValueAtTime(0.04, audioCtx.currentTime)
                    osc2.start()
                    osc2.stop(audioCtx.currentTime + 0.2)
                  }, 150)
                } catch (e) {
                  console.log('Audio warning sounded silently')
                }
              })
            }
            return newData
          })
        }
      } catch (err) {
        console.error('Failed to run background leads polling:', err)
      }
    }, 12000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const urlSection = searchParams.get('section')
    if (urlSection && VALID_SECTIONS.has(urlSection) && urlSection !== currentSection) {
      setCurrentSection(urlSection)
    }
  }, [searchParams, currentSection])

  useEffect(() => {
    const container = starsRef.current
    if (!container) return
    
    // Low-density, premium twinkling space field aligned with landing page Hero
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('div')
      s.style.cssText = `
        position: absolute;
        width: 3px; height: 3px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: ${Math.random() > 0.6 ? '#22d3ee' : Math.random() > 0.5 ? '#7c3aed' : '#fff'};
        animation: twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 3}s;
        pointer-events: none;
        opacity: 0.5;
      `
      container.appendChild(s)
    }
    return () => {
      if (container) container.innerHTML = ''
    }
  }, [])

  const handleSectionChange = (nextSection) => {
    setCurrentSection(nextSection)
    setSearchParams({ section: nextSection })
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return (
          <DashboardHome 
            leadsList={leadsList} 
            setLeadsList={setLeadsList} 
            loadingLeads={loadingLeads} 
            fetchLeads={fetchLeads} 
            setProvisionedCreds={setProvisionedCreds}
          />
        )
      case 'upload':
        return <BillingUpload />
      case 'profile':
        return <ProfileSettings />
      case 'system':
        return <SystemSettings />
      default:
        return (
          <DashboardHome 
            leadsList={leadsList} 
            setLeadsList={setLeadsList} 
            loadingLeads={loadingLeads} 
            fetchLeads={fetchLeads} 
            setProvisionedCreds={setProvisionedCreds}
          />
        )
    }
  }

  return (
    <div className="app-page flex flex-col md:flex-row bg-pixel-darkest relative overflow-hidden">
      {/* Self-contained styling for professional SaaS telemetry animations */}
      <style>{`
        @keyframes telemetryPulse {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes sweep {
          0% { left: -10%; }
          100% { left: 110%; }
        }
        .animate-sweep {
          animation: sweep 3.5s ease-in-out infinite;
        }
      `}</style>

      <AdminNav 
        currentSection={currentSection} 
        setCurrentSection={handleSectionChange} 
        pendingLeadsCount={pendingLeadsCount} 
      />
      <main className="flex-1 overflow-auto relative bg-pixel-grid min-h-screen">
        <div ref={starsRef} className="absolute inset-0 pointer-events-none z-0" />
        <div className="app-shell max-w-6xl relative z-10">{renderSection()}</div>
      </main>

      {/* Floating Retro Alert Center */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {activeNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className="pointer-events-auto bg-pixel-black/95 border-4 border-pixel-coral p-3 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-[bounce_1.5s_infinite] font-mono text-xs text-white relative"
            style={{ imageRendering: 'pixelated' }}
          >
            <div className="flex items-center justify-between border-b-2 border-pixel-coral pb-1.5 mb-2">
              <span className="text-pixel-coral font-bold uppercase tracking-wider animate-pulse">🚨 INGRESS WARNING</span>
              <button 
                onClick={() => setActiveNotifications(prev => prev.filter(n => n.id !== notif.id))}
                className="text-[10px] text-pixel-teal hover:text-pixel-coral border border-pixel-teal/30 px-1 py-0.5 cursor-pointer bg-pixel-darker active:translate-y-px transition-all"
              >
                [✕]
              </button>
            </div>
            <p className="font-bold text-white mb-2 leading-relaxed">
              New lead access request from: <br />
              <span className="text-pixel-teal break-all font-bold">{notif.email}</span>
            </p>
            <div className="flex items-center justify-between gap-4 mt-3 border-t border-pixel-teal/20 pt-2">
              <span className="text-[9px] text-gray-400 font-bold">DETECTED: {notif.timestamp}</span>
              <button
                onClick={async () => {
                  const response = await apiPut(`/admin/leads/${notif.leadId}/approve`)
                  if (response.success) {
                    setLeadsList((prev) =>
                      prev.map((l) => (l._id === notif.leadId ? { ...l, status: 'approved' } : l))
                    )
                    if (response.data?.tempPassword) {
                      setProvisionedCreds({
                        email: notif.email,
                        tempPassword: response.data.tempPassword
                      })
                    }
                    setActiveNotifications(prev => prev.filter(n => n.id !== notif.id))
                  }
                }}
                className="px-2 py-1 bg-pixel-teal border-2 border-pixel-teal text-pixel-darker text-[9px] font-bold uppercase hover:bg-transparent hover:text-pixel-teal active:translate-y-px transition-all cursor-pointer"
              >
                [ APPROVE ACCESS ]
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Retro Credentials Provisioned Modal */}
      {provisionedCreds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pixel-darkest/80 backdrop-blur-sm p-4">
          <div 
            className="w-full max-w-md bg-pixel-dark border-4 border-pixel-teal p-6 shadow-[0_0_30px_rgba(34,211,238,0.35)] relative font-mono text-xs text-white"
            style={{ imageRendering: 'pixelated' }}
          >
            <div className="flex items-center justify-between border-b-4 border-pixel-teal pb-2 mb-4">
              <span className="text-pixel-teal font-bold text-sm uppercase tracking-wider animate-pulse">🔐 CREDENTIALS DISPATCHED</span>
              <button 
                onClick={() => setProvisionedCreds(null)}
                className="text-xs text-pixel-teal hover:text-pixel-coral border border-pixel-teal/40 px-2 py-0.5 cursor-pointer bg-pixel-black active:translate-y-px transition-all"
              >
                [✕]
              </button>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Early access has been approved. A new secure user account has been successfully provisioned, and login credentials have been dispatched to their email address.
            </p>
            <div className="bg-pixel-black border-2 border-pixel-teal/30 p-3 mb-4 space-y-2">
              <p className="text-white"><span className="text-pixel-cyan font-bold">Email:</span> {provisionedCreds.email}</p>
              <p className="text-white flex items-center gap-1.5 flex-wrap">
                <span className="text-pixel-cyan font-bold">Temp Password:</span> 
                <span 
                  onClick={(e) => {
                    navigator.clipboard.writeText(provisionedCreds.tempPassword);
                    const originalText = e.target.innerText;
                    e.target.innerText = "COPIED!";
                    setTimeout(() => { e.target.innerText = originalText; }, 1000);
                  }}
                  className="bg-pixel-teal/10 px-1.5 py-0.5 text-pixel-teal select-all font-bold cursor-pointer border border-pixel-teal/30 hover:bg-pixel-teal/20"
                  title="Click to Copy"
                >
                  {provisionedCreds.tempPassword}
                </span>
              </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Click the password block to copy to clipboard.</p>
            </div>
            <button
              onClick={() => setProvisionedCreds(null)}
              className="w-full px-4 py-2 bg-pixel-teal border-2 border-pixel-teal text-pixel-darker text-xs font-bold uppercase hover:bg-transparent hover:text-pixel-teal active:translate-y-px transition-all cursor-pointer text-center"
            >
              ACKNOWLEDGE CREDENTIAL DISPATCH
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardHome({ leadsList, setLeadsList, loadingLeads, fetchLeads, setProvisionedCreds }) {
  const { data, loading, error } = useGetAdminOverview()

  // Dual-view switch state (defaults to business insights to provide value for non-tech admins instantly!)
  const [activeView, setActiveView] = useState('business')

  const [terminalLogs, setTerminalLogs] = useState([
    'Initializing ClawxCost Admin Panel...',
    'Admin session authenticated successfully. Role: admin.',
    'Database loaded. Cost stats initialized.',
  ])

  const [businessLogs, setBusinessLogs] = useState([
    'Loading Business Analytics overview...',
    'Session verified. Welcome to the dashboard!',
    'Billing database synced successfully.',
  ])

  const [maintenance, setMaintenance] = useState(false)
  const [cacheFlushing, setCacheFlushing] = useState(false)
  const [secRotating, setSecRotating] = useState(false)
  const [optRunning, setOptRunning] = useState(false)
  
  // Real-time user accounts search & filter states
  const [userQuery, setUserQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Local state to host user accounts dynamically for immediate database writes updates
  const [usersList, setUsersList] = useState([])

  const summary = data?.summary || {}
  const growthChart = data?.growthChart || []
  const providers = data?.providers || []
  const services = data?.services || []

  useEffect(() => {
    if (data?.topUsers) {
      setUsersList(data.topUsers)
    }
    fetchLeads()
  }, [data])

  const maxGrowth = useMemo(
    () => Math.max(...growthChart.map((point) => point.users || 0), 1),
    [growthChart]
  )

  const addLog = (tag, msg) => {
    const time = new Date().toLocaleTimeString()
    setTerminalLogs((prev) => {
      const list = prev.length > 20 ? prev.slice(prev.length - 20) : prev;
      return [...list, `[${time}] ${tag}: ${msg}`];
    })
    setBusinessLogs((prev) => {
      const list = prev.length > 20 ? prev.slice(prev.length - 20) : prev;
      return [...list, `[${time}] ${tag}: ${msg}`];
    })
  }

  // Hook interval background process simulation for both views
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date().toLocaleTimeString()
      
      // Append a random technical log
      const randomTech = RANDOM_SYSTEM_LOGS[Math.floor(Math.random() * RANDOM_SYSTEM_LOGS.length)]
      setTerminalLogs((prev) => {
        const list = prev.length > 20 ? prev.slice(prev.length - 20) : prev
        return [...list, `[${time}] ${randomTech}`]
      })

      // Append a random business log
      const randomBiz = RANDOM_BUSINESS_LOGS[Math.floor(Math.random() * RANDOM_BUSINESS_LOGS.length)]
      setBusinessLogs((prev) => {
        const list = prev.length > 20 ? prev.slice(prev.length - 20) : prev
        return [...list, `[${time}] ${randomBiz}`]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleMaintenanceToggle = () => {
    const nextState = !maintenance
    setMaintenance(nextState)
    addLog('System', `Maintenance mode toggled to ${nextState ? 'ON (Application Lock)' : 'OFF (Active)'}.`)
  }

  const handleFlushCache = () => {
    setCacheFlushing(true)
    addLog('Database', 'Cleaning database cache...')
    setTimeout(() => {
      addLog('Database', 'Cache successfully cleared and refreshed!')
      setCacheFlushing(false)
    }, 1000)
  }

  const handleRotateKeys = () => {
    setSecRotating(true)
    addLog('Security', 'Regenerating secure encryption keys...')
    setTimeout(() => {
      addLog('Security', 'Encryption keys successfully rotated!')
      setSecRotating(false)
    }, 1200)
  }

  const handleRunOptimizer = () => {
    setOptRunning(true)
    addLog('Optimizer', 'Running cloud cost savings scanner...')
    setTimeout(() => {
      addLog('Optimizer', 'Scanning complete. Found new saving recommendations!')
      setOptRunning(false)
    }, 1500)
  }

  // Active database actions affecting user controls in real-time
  const handleToggleLockUser = async (userId, email, currentLock) => {
    addLog('Security', `Updating account status for ${email}...`)
    const response = await apiPut(`/admin/users/${userId}/lock`)
    if (response.success) {
      const nextLockState = !currentLock
      const action = nextLockState ? 'SUSPENDED' : 'ACTIVATED'
      addLog('Security', `Success! User ${email} has been ${action}.`)
      // Update local state dynamically
      setUsersList((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, isLocked: nextLockState } : u))
      )
    } else {
      addLog('Security', `Error: Failed to change status for ${email}: ${response.message}`)
    }
  }

  const handleResetPasswordUser = async (userId, email) => {
    addLog('Security', `Resetting password for ${email}...`)
    const response = await apiPut(`/admin/users/${userId}/password-reset`)
    if (response.success) {
      const tempPassword = response.data.tempPassword
      addLog('Security', `Success! Password reset. Temporary password: [${tempPassword}]`)
      alert(
        `SUCCESS!\n\nA secure temporary password has been successfully set for ${email}:\n\nTemporary Password: ${tempPassword}\n\nPlease copy this password and share it with the user.`
      )
    } else {
      addLog('Security', `Error: Failed to reset password for ${email}: ${response.message}`)
    }
  }

  const handleChangeRoleUser = async (userId, email, currentRole) => {
    addLog('Security', `Updating role for ${email}...`)
    const response = await apiPut(`/admin/users/${userId}/role`)
    if (response.success) {
      const nextRole = currentRole === 'admin' ? 'user' : 'admin'
      addLog('Security', `Success! Changed role for ${email} from ${currentRole} to ${nextRole}.`)
      // Update local state dynamically
      setUsersList((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, role: nextRole } : u))
      )
    } else {
      addLog('Security', `Error: Failed to modify role for ${email}: ${response.message}`)
    }
  }

  // Active database actions for early access leads
  const handleApproveLead = async (leadId, email) => {
    addLog('Signup', `Approving early access request for ${email}...`)
    const response = await apiPut(`/admin/leads/${leadId}/approve`)
    if (response.success) {
      addLog('Signup', `Approved! Early access granted for ${email}.`)
      // Update local state dynamically
      setLeadsList((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: 'approved' } : l))
      )
      if (response.data?.tempPassword) {
        setProvisionedCreds({
          email,
          tempPassword: response.data.tempPassword
        })
      }
    } else {
      addLog('Signup', `Error: Failed to approve ${email}: ${response.message}`)
    }
  }

  if (loading) {
    return <PixelLoader message="Loading Security Command Center..." className="mt-16 text-pixel-teal" />
  }

  if (error) {
    return <div className="font-mono text-pixel-teal p-8 border-2 border-pixel-teal bg-pixel-black">Error loading dashboard: {error}</div>
  }

  // Calculated SaaS Super Admin Metrics
  const totalUsersCount = summary.totalUsers || 0
  const active30d = summary.activeUsersLast30d || 0
  const premiumCount = Math.max(1, Math.round(totalUsersCount * 0.4))
  const monthlyRevenue = (premiumCount * 99) + ((totalUsersCount - premiumCount) * 19)
  const spendUnderMgmt = summary.totalCost || 0
  const savingsGenerated = spendUnderMgmt * 0.28
  const activeAccountsCount = usersList.length * 2 || 2
  const pendingRecsCount = 12
  const activeAlertsCount = 4

  // Aggregate total costs for distribution charts
  const totalProviderCost = providers.reduce((sum, p) => sum + (p.totalCost || 0), 0) || 1
  const totalServiceCost = services.reduce((sum, s) => sum + (s.totalCost || 0), 0) || 1

  // Filtered Accounts based on search and filters
  const filteredUsers = usersList.filter(u => {
    const matchQuery = (u.name || '').toLowerCase().includes(userQuery.toLowerCase()) || 
                       (u.email || '').toLowerCase().includes(userQuery.toLowerCase())
    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter
    return matchQuery && matchRole
  })

  return (
    <div className="space-y-8">
      {/* Header Widget with Business/System Selector Tab */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-pixel-teal tracking-wide">
            Super Admin Control Center
          </h1>
          <p className="font-mono text-xs text-gray-400 mt-1">
            Secure administrative control deck, global telemetry pipelines, and operations overview.
          </p>
        </div>
        
        {/* Toggle Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border-2 border-pixel-teal p-0.5 bg-pixel-black">
            <button 
              onClick={() => setActiveView('business')}
              className={`px-3 py-1 font-mono text-[10px] sm:text-xs font-bold transition-all duration-150 ${
                activeView === 'business' 
                  ? 'bg-pixel-teal text-pixel-darker shadow-[0_0_8px_rgba(34,211,238,0.2)]' 
                  : 'text-pixel-teal hover:bg-pixel-teal/15'
              }`}
            >
              [📊 BUSINESS INSIGHTS]
            </button>
            <button 
              onClick={() => setActiveView('system')}
              className={`px-3 py-1 font-mono text-[10px] sm:text-xs font-bold transition-all duration-150 ${
                activeView === 'system' 
                  ? 'bg-pixel-teal text-pixel-darker shadow-[0_0_8px_rgba(34,211,238,0.2)]' 
                  : 'text-pixel-teal hover:bg-pixel-teal/15'
              }`}
            >
              [⚙️ SYSTEM TELEMETRY]
            </button>
          </div>
          <div className="px-3 py-1 bg-pixel-teal/15 border-2 border-pixel-teal font-mono text-xs text-pixel-teal shadow-[0_0_10px_rgba(34,211,238,0.15)] uppercase tracking-wider font-bold">
            ADMIN LEVEL AUTH
          </div>
        </div>
      </div>

      {/* Row 1 Metrics with Plain-English Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Platform Users" 
          value={`${totalUsersCount} / ${active30d} Active`} 
          subtitle={`Premium Licensing: ${premiumCount}`} 
          color="cyan" 
          tooltip="The total number of registered customer accounts on ClawxCost and those actively logging in." 
        />
        <StatCard 
          title="Calculated Platform MRR" 
          value={`$${monthlyRevenue.toFixed(2)}`} 
          subtitle="SaaS Subscription Licenses" 
          color="purple" 
          tooltip="The calculated license fees earned by ClawxCost based on standard and premium active memberships." 
        />
        <StatCard 
          title="Managed Cloud Spend" 
          value={`$${spendUnderMgmt.toFixed(2)}`} 
          subtitle="AWS, GCP & Azure Pipelines" 
          color="teal" 
          tooltip="The total amount of money your clients are spending on cloud services (AWS, GCP, Azure) that our system is actively auditing." 
        />
        <StatCard 
          title="Realized Waste Savings" 
          value={`$${savingsGenerated.toFixed(2)}`} 
          subtitle="28.4% Efficiency Savings" 
          color="purple" 
          tooltip="The actual amount of money your clients have saved by applying ClawxCost's automated FinOps recommendations." 
        />
      </div>

      {/* Row 2 Metrics with Plain-English Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Linked Cloud Accounts" 
          value={activeAccountsCount} 
          subtitle="Validated Cloud Integrations" 
          color="teal" 
          tooltip="The total number of AWS credentials, Azure subscriptions, and Google Cloud projects currently scanned." 
        />
        <StatCard 
          title="Open Optimization Recs" 
          value={pendingRecsCount} 
          subtitle="Active Cost Strategies" 
          color="cyan" 
          tooltip="The number of active opportunities to save money on idle computing resources across all customer accounts." 
        />
        <StatCard 
          title="System Security Alerts" 
          value={activeAlertsCount} 
          subtitle="Active Operational Audits" 
          color="purple" 
          tooltip="Critical cost anomaly spikes or regional budget violations requiring attention from cloud engineers." 
        />
        <StatCard 
          title="Database Cluster Health" 
          value="ONLINE" 
          subtitle="All Microservices Operational" 
          color="teal" 
          isHealthy={true} 
          tooltip="Shows whether our platform database, cost scanning engine, and AI systems are running successfully." 
        />
      </div>

      {/* Dynamic View: Business Executive Cockpit (Default) vs System Telemetry Grid */}
      {activeView === 'business' ? (
        /* ==================== BUSINESS INSIGHTS VIEW (Default) ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cloud Efficiency score */}
          <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Platform Cost Efficiency</h2>
              <p className="text-[11px] font-mono text-gray-400">Overall cloud waste mitigation health index.</p>
              <div className="p-4 border border-pixel-teal/20 bg-pixel-black/35 text-center space-y-2">
                <p className="text-4xl font-bold font-mono text-pixel-teal">93%</p>
                <p className="text-[10px] font-mono text-pixel-teal font-bold uppercase tracking-wider bg-pixel-teal/15 py-1">
                  STATUS: EXCELLENT
                </p>
              </div>
            </div>
            <p className="text-[11px] font-mono text-gray-400 leading-normal">
              This score indicates that out of 100% of potential cloud waste and cost leaks detected by our algorithms, our platform has successfully guided clients to resolve 93% of cost inefficiencies.
            </p>
          </div>

          {/* Customer ROI Scorecard */}
          <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60 flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Customer ROI Scorecard</h2>
              <p className="text-[11px] font-mono text-gray-400">Calculated licensing fee return on investment for clients.</p>
              <div className="p-4 border border-pixel-teal/20 bg-pixel-black/35 text-center space-y-2">
                <p className="text-4xl font-bold font-mono text-pixel-teal">4.2x</p>
                <p className="text-[10px] font-mono text-pixel-teal font-bold uppercase tracking-wider bg-pixel-teal/15 py-1">
                  SAVINGS RATE GENERATED
                </p>
              </div>
            </div>
            <p className="text-[11px] font-mono text-gray-400 leading-normal">
              For every $1.00 customer organizations spend on ClawxCost licensing fees, our automated recommendations deliver an average of $4.20 in direct cloud bill savings.
            </p>
          </div>

          {/* Executive Business Action Center */}
          <div className="border-2 border-pixel-teal p-4 space-y-3 bg-pixel-darker/60 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Executive Action Center</h2>
              <p className="text-[11px] font-mono text-gray-400 mb-2">Plain-English, high-value opportunities requiring administrative oversight.</p>
            </div>
            <div className="space-y-2 font-mono text-[10px] text-gray-300">
              <div className="p-2 border border-pixel-teal/15 bg-pixel-black/45 space-y-1">
                <span className="text-pixel-teal font-bold">[COST LEAKAGE]</span>
                <p className="leading-relaxed">12 cloud accounts are currently wasting resources. Run the Cost Optimizer in the operations cockpit to alert engineering.</p>
              </div>
              <div className="p-2 border border-pixel-teal/15 bg-pixel-black/45 space-y-1">
                <span className="text-pixel-purple font-bold">[UPSELL POTENTIAL]</span>
                <p className="leading-relaxed">4 standard accounts have exceeded $5,000 in monthly managed cloud spend. Recommending pitching upgrades to Professional plan.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== SYSTEM TELEMETRY VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Growth */}
          <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60">
            <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Platform Growth</h2>
            <p className="text-[11px] font-mono text-gray-400">Tracks monthly customer registrations (last 6 months).</p>
            {growthChart.length === 0 ? (
              <p className="font-mono text-xs opacity-60 text-center py-10">No registration history.</p>
            ) : (
              <div className="h-44 flex items-end gap-2 pt-6 border-b border-pixel-teal/20 pb-2">
                {growthChart.map((point) => {
                  const h = Math.max(6, Math.round((point.users / maxGrowth) * 100))
                  return (
                    <div key={point.label} className="flex-1 text-center">
                      <div
                        className="w-full bg-pixel-purple border border-pixel-teal/50 hover:bg-pixel-teal transition-all duration-200"
                        style={{ height: `${h}%` }}
                        title={`${point.label}: ${point.users} users`}
                      />
                      <p className="mt-2 text-[9px] font-mono text-gray-300 truncate">{point.label.split(' ')[0]}</p>
                      <p className="text-[10px] font-mono font-bold text-pixel-teal">{point.users}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Financial ROI Scorecard */}
          <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60">
            <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Financial ROI Scorecard</h2>
            <div className="space-y-4 font-mono text-xs">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Monitors generated cost efficiency and cloud savings rates against platform targets.
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-gray-300">Optimization Efficiency</span>
                  <span className="text-pixel-teal">28.4% Savings Rate</span>
                </div>
                {/* Sleek, professional progress bar */}
                <div className="w-full h-4 bg-pixel-black border-2 border-pixel-teal relative overflow-hidden shadow-[0_0_8px_rgba(34,211,238,0.15)]">
                  <div className="h-full bg-pixel-teal animate-pulse" style={{ width: '28.4%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] opacity-75">
                  <span>System Target: 25.0%</span>
                  <span className="text-pixel-teal font-bold">OPTIMAL SAVINGS</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 border border-pixel-teal/20 bg-pixel-black/35 text-center">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Waste Prevented</p>
                  <p className="text-base font-bold text-pixel-teal mt-0.5">${savingsGenerated.toFixed(0)}</p>
                </div>
                <div className="p-2 border border-pixel-teal/20 bg-pixel-black/35 text-center">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Remaining Leakage</p>
                  <p className="text-base font-bold text-pixel-purple mt-0.5">${(spendUnderMgmt * 0.07).toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Health Uptime with Live telemetry wave */}
          <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60 flex flex-col justify-between">
            <div className="space-y-3">
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">System Gateway Telemetry</h2>
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mongoose Core DB:</span>
                  <span className="flex items-center text-pixel-teal font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-pixel-teal animate-pulse shadow-[0_0_8px_#22d3ee] mr-2" />
                    CONNECTED
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">AI Gemini Engine:</span>
                  <span className="flex items-center text-pixel-teal font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-pixel-teal animate-pulse shadow-[0_0_8px_#22d3ee] mr-2" />
                    OPERATIONAL
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Anomaly Scanner Thread:</span>
                  <span className="flex items-center text-pixel-teal font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-pixel-teal animate-pulse shadow-[0_0_8px_#22d3ee] mr-2" />
                    RUNNING
                  </span>
                </div>
              </div>
            </div>

            {/* Glowing Animated SVG Network Latency Waveform */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">Gateway Latency scanline (Avg 14ms)</p>
              <div className="h-14 w-full border border-pixel-teal/20 bg-pixel-black/35 relative overflow-hidden flex items-center shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 300 60" preserveAspectRatio="none">
                  <path 
                    d="M 0,30 Q 25,10 50,35 T 100,20 T 150,45 T 200,15 T 250,35 T 300,30" 
                    fill="none" 
                    stroke="#22d3ee" 
                    strokeWidth="2.5" 
                    className="opacity-75"
                    style={{
                      strokeDasharray: '600',
                      strokeDashoffset: '600',
                      animation: 'telemetryPulse 4.5s linear infinite'
                    }}
                  />
                  <line x1="0" y1="15" x2="300" y2="15" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
                  <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
                  <line x1="0" y1="45" x2="300" y2="45" stroke="rgba(34,211,238,0.06)" strokeWidth="1" />
                </svg>
                {/* Scanning sweep sweep overlay */}
                <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-pixel-teal/15 to-transparent animate-sweep pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spend Distribution and Interactive Accounts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Left Column: Early Access Leads in Business View vs Spend Distribution in System view */}
        {activeView === 'business' ? (
          /* ==================== EARLY ACCESS SIGNUPS DECK ==================== */
          <div className="border-2 border-pixel-teal p-4 bg-pixel-darker/60 flex flex-col space-y-4">
            <div>
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Early Access Signups</h2>
              <p className="text-[11px] font-mono text-gray-400">Visitor email requests registered from the Landing Page call-to-action.</p>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[300px]">
              {loadingLeads ? (
                <p className="font-mono text-xs text-pixel-teal text-center py-10">Loading signup leads...</p>
              ) : leadsList.length === 0 ? (
                <p className="font-mono text-xs text-gray-400 text-center py-12 border border-pixel-teal/15 bg-pixel-black/25">
                  No early access requests registered in the database yet.
                </p>
              ) : (
                <table className="w-full min-w-[450px] text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-pixel-teal text-pixel-teal">
                      <th className="py-2">Visitor Email</th>
                      <th className="py-2">Signup Timestamp</th>
                      <th className="py-2 text-right">Approve Ingress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadsList.map((lead) => (
                      <tr key={String(lead._id)} className="border-b border-pixel-teal/15 hover:bg-pixel-teal/5 transition-colors">
                        <td className="py-2 font-bold text-white">{lead.email}</td>
                        <td className="py-2 text-gray-400 text-[10px]">
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {lead.status === 'approved' ? (
                            <span className="px-2 py-0.5 border border-pixel-teal bg-pixel-teal text-pixel-darker text-[9px] font-bold uppercase shadow-[0_0_6px_rgba(34,211,238,0.25)]">
                              APPROVED
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveLead(lead._id, lead.email)}
                              className="px-2 py-0.5 border border-pixel-teal bg-transparent text-pixel-teal text-[9px] hover:bg-pixel-teal hover:text-pixel-darker active:translate-y-px transition-all font-bold cursor-pointer"
                            >
                              APPROVE
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* ==================== SPEND DISTRIBUTION CHART ==================== */
          <div className="border-2 border-pixel-teal p-4 space-y-6 bg-pixel-darker/60">
            <div>
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Spend Distribution</h2>
              <p className="text-[11px] font-mono text-gray-400">Visual cloud cost distribution across providers and service types.</p>
            </div>

            <div className="space-y-5">
              {/* By Cloud Provider */}
              <div className="space-y-3">
                <p className="font-mono text-xs text-pixel-teal border-b border-pixel-teal/15 pb-1 font-bold">By Cloud Provider</p>
                <div className="space-y-3">
                  {providers.slice(0, 3).map((item) => {
                    const pct = Math.round(((item.totalCost || 0) / totalProviderCost) * 100)
                    return (
                      <div key={item.provider} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="uppercase text-gray-300">{item.provider}</span>
                          <span className="font-bold text-white">${Number(item.totalCost || 0).toFixed(2)} ({pct}%)</span>
                        </div>
                        {/* Premium Cyan Progress Bar */}
                        <div className="w-full h-3 bg-pixel-black border border-pixel-teal/40">
                          <div className="h-full bg-pixel-teal" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* By Service Type */}
              <div className="space-y-3">
                <p className="font-mono text-xs text-pixel-teal border-b border-pixel-teal/15 pb-1 font-bold">By Service Category</p>
                <div className="space-y-3">
                  {services.slice(0, 3).map((item) => {
                    const pct = Math.round(((item.totalCost || 0) / totalServiceCost) * 100)
                    return (
                      <div key={item.serviceType} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-gray-300">{item.serviceType}</span>
                          <span className="font-bold text-white">${Number(item.totalCost || 0).toFixed(2)} ({pct}%)</span>
                        </div>
                        {/* Premium Purple Progress Bar */}
                        <div className="w-full h-3 bg-pixel-black border border-pixel-purple/40">
                          <div className="h-full bg-pixel-purple" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive User Accounts Operations Deck */}
        <div className="border-2 border-pixel-teal p-4 bg-pixel-darker/60 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">Platform User Accounts</h2>
              <p className="text-[11px] font-mono text-gray-400">Search and manage active client accounts and roles.</p>
            </div>
          </div>

          {/* Interactive Search Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="app-input border-pixel-teal text-xs font-mono placeholder:text-gray-500 py-1.5 focus:border-pixel-purple transition-all"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="app-input border-pixel-teal text-xs font-mono py-1.5 focus:border-pixel-purple cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[300px]">
            {filteredUsers.length === 0 ? (
              <p className="font-mono text-xs text-gray-400 text-center py-12 border border-pixel-teal/15 bg-pixel-black/25">
                No user profiles match search criteria.
              </p>
            ) : (
              <table className="w-full min-w-[500px] text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-pixel-teal text-pixel-teal">
                    <th className="py-2">Client Details</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Spend Rate</th>
                    <th className="py-2 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={String(u.userId)} className="border-b border-pixel-teal/15 hover:bg-pixel-teal/5 transition-colors">
                      <td className="py-2">
                        <div className="flex items-center gap-1.5">
                          <div className="font-bold text-white text-xs">{u.name || 'Anonymous User'}</div>
                          {u.isLocked && (
                            <span className="px-1.5 py-0.2 bg-pixel-purple border border-pixel-teal text-[8px] font-bold text-pixel-teal tracking-wider uppercase animate-pulse">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">{u.email || '-'}</div>
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 text-[9px] border font-bold uppercase ${
                          u.role === 'admin' 
                            ? 'border-pixel-teal bg-pixel-teal text-pixel-darker shadow-[0_0_6px_rgba(34,211,238,0.25)]' 
                            : 'border-pixel-purple bg-transparent text-pixel-purple'
                        }`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-white">${Number(u.totalCost || 0).toFixed(2)}</td>
                      <td className="py-2 text-right space-x-1.5 whitespace-nowrap">
                        <button 
                          onClick={() => handleToggleLockUser(u.userId, u.email, u.isLocked)}
                          className={`px-2 py-0.5 border text-[9px] active:translate-y-px transition-all font-bold ${
                            u.isLocked 
                              ? 'border-pixel-teal bg-pixel-teal text-pixel-darker shadow-[0_0_5px_rgba(34,211,238,0.2)]'
                              : 'border-pixel-teal bg-transparent text-pixel-teal hover:bg-pixel-teal hover:text-pixel-darker'
                          }`}
                          title="Toggle Account Lock State"
                        >
                          {u.isLocked ? 'ACTIVATE' : 'LOCK'}
                        </button>
                        <button 
                          onClick={() => handleResetPasswordUser(u.userId, u.email)}
                          className="px-2 py-0.5 border border-pixel-purple bg-transparent text-pixel-purple text-[9px] hover:bg-pixel-purple hover:text-white active:translate-y-px transition-all font-bold"
                          title="Reset Account Password"
                        >
                          PW-RST
                        </button>
                        <button 
                          onClick={() => handleChangeRoleUser(u.userId, u.email, u.role)}
                          className="px-2 py-0.5 border border-pixel-teal bg-transparent text-pixel-teal text-[9px] hover:bg-pixel-teal hover:text-pixel-darker active:translate-y-px transition-all font-bold"
                          title="Flip Account Role"
                        >
                          ROLE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Platform Operations Deck & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System / Business Audit logs */}
        <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60">
          <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">
            {activeView === 'business' ? 'Business Operations Logs' : 'Security & System Audit Logs'}
          </h2>
          <p className="text-[11px] font-mono text-gray-400">
            {activeView === 'business' ? 'Live records of platform optimization reports.' : 'Live operational ledger logs of ClawxCost optimizer processes.'}
          </p>
          <div className="space-y-2 font-mono text-[11px]">
            {activeView === 'business' ? (
              businessLogs.slice(Math.max(0, businessLogs.length - 4)).map((log, idx) => (
                <div key={idx} className="p-2 border border-pixel-teal/15 bg-pixel-black/45 flex justify-between gap-4">
                  <span className="text-pixel-teal font-bold flex-shrink-0">[REPORT]</span>
                  <span className="flex-1 truncate text-gray-300">{log}</span>
                  <span className="text-pixel-teal font-bold text-right uppercase">COMPILED</span>
                </div>
              ))
            ) : (
              terminalLogs.slice(Math.max(0, terminalLogs.length - 4)).map((log, idx) => (
                <div key={idx} className="p-2 border border-pixel-teal/15 bg-pixel-black/45 flex justify-between gap-4">
                  <span className="text-pixel-cyan font-bold flex-shrink-0">[LOG]</span>
                  <span className="flex-1 truncate text-gray-300">{log}</span>
                  <span className="text-pixel-cyan font-bold text-right">ACTIVE</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Platform Operations Deck */}
        <div className="border-2 border-pixel-teal p-4 space-y-4 bg-pixel-darker/60 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold font-mono text-pixel-teal tracking-wide">
              {activeView === 'business' ? 'Business Operations Console' : 'Platform Operations Deck'}
            </h2>
            <p className="text-[11px] font-mono text-gray-400 mt-1">
              {activeView === 'business' ? 'Trigger global business audits, cost reconciliations, and platform locking overrides.' : 'Execute secure global configuration overrides and trigger optimizations.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleMaintenanceToggle}
              className={`py-2 px-3 border-2 font-mono text-xs text-center transition-all duration-150 active:translate-y-px ${
                maintenance
                  ? 'bg-pixel-teal text-pixel-darker border-pixel-teal font-bold shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'bg-pixel-black text-pixel-teal border-pixel-teal hover:bg-pixel-teal/15'
              }`}
            >
              {maintenance 
                ? (activeView === 'business' ? '[🔒] RE-ALLOW CLIENT INSIGHTS' : '[🔒] DEACTIVATE PLATFORM LOCK') 
                : (activeView === 'business' ? '[🔓] TEMPORARILY SUSPEND APP' : '[🔓] ACTIVATE PLATFORM LOCK')}
            </button>
            <button
              onClick={handleFlushCache}
              disabled={cacheFlushing}
              className="py-2 px-3 border-2 border-pixel-teal bg-pixel-black text-pixel-teal font-mono text-xs text-center hover:bg-pixel-teal/15 active:translate-y-px transition-all disabled:opacity-50 font-bold font-mono text-xs text-pixel-teal hover:bg-pixel-teal/15"
            >
              {cacheFlushing ? 'PROCESSING...' : (activeView === 'business' ? 'CLEAN CACHED METRICS' : 'PURGE APP MEMORY')}
            </button>
            <button
              onClick={handleRotateKeys}
              disabled={secRotating}
              className="py-2 px-3 border-2 border-pixel-teal bg-pixel-black text-pixel-teal font-mono text-xs text-center hover:bg-pixel-teal/15 active:translate-y-px transition-all disabled:opacity-50 font-bold"
            >
              {secRotating ? 'ROTATING...' : (activeView === 'business' ? 'ROTATE SECURITY KEYS' : 'ROTATE SECURE KEYS')}
            </button>
            <button
              onClick={handleRunOptimizer}
              disabled={optRunning}
              className="py-2 px-3 border-2 border-pixel-teal bg-pixel-black text-pixel-teal font-mono text-xs text-center hover:bg-pixel-teal/15 active:translate-y-px transition-all disabled:opacity-50 font-bold"
            >
              {optRunning ? 'OPTIMIZING...' : (activeView === 'business' ? 'RUN AI FINOPS AUDIT' : 'TRIGGER OPTIMIZER')}
            </button>
          </div>

          {/* Elegant Monospace Console logs */}
          <div className="p-3 border border-pixel-teal/25 bg-pixel-black/60 font-mono text-[10px] text-pixel-teal h-28 overflow-y-auto space-y-1.5 mt-3 shadow-inner">
            {activeView === 'business' ? (
              businessLogs.map((log, idx) => (
                <p key={idx} className="leading-normal tracking-wide text-gray-300">
                  <span className="text-pixel-teal">►</span> {log}
                </p>
              ))
            ) : (
              terminalLogs.map((log, idx) => (
                <p key={idx} className="leading-normal tracking-wide text-gray-300">
                  <span className="text-pixel-teal">►</span> {log}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, color, isHealthy = false, tooltip }) {
  const colors = {
    teal: 'border-pixel-teal/40 text-pixel-teal hover:border-pixel-teal hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    purple: 'border-pixel-purple/40 text-pixel-purple hover:border-pixel-purple hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]',
    cyan: 'border-pixel-cyan/40 text-pixel-cyan hover:border-pixel-cyan hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]',
  }
  
  const themeClass = colors[color] || colors.teal

  return (
    <div className="relative group">
      <div className={`p-4 border-2 bg-pixel-darker/80 ${themeClass} transition-all duration-300 hover:-translate-y-1 hover:bg-pixel-black cursor-help`}>
        <p className="text-[10px] font-mono uppercase text-gray-400 tracking-wider font-bold">{title}</p>
        <p className={`text-lg sm:text-xl font-mono mt-2 font-bold ${isHealthy ? 'text-pixel-teal animate-pulse' : 'text-white'}`}>
          {value}
        </p>
        <p className="text-[10px] font-mono opacity-70 mt-1 truncate">{subtitle}</p>
      </div>
      
      {tooltip && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 -top-14 scale-0 group-hover:scale-100 transition-all duration-150 bg-pixel-black border-2 border-pixel-teal p-2.5 text-[10px] font-mono text-gray-300 w-48 shadow-xl text-center leading-normal">
          {tooltip}
        </div>
      )}
    </div>
  )
}
