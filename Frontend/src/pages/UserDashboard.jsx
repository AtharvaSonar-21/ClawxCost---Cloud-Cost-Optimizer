import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import UserNav from '@/components/dashboard/UserNav'
import CostSummary from '@/components/dashboard/CostSummary'
import TrendsChart from '@/components/dashboard/TrendsChart'
import IncidentsList from '@/components/dashboard/IncidentsList'
import RecommendationsList from '@/components/dashboard/RecommendationsList'
import CloudConnections from '@/components/dashboard/CloudConnections'
import BillingUpload from '@/components/dashboard/BillingUpload'
import BudgetAlerts from '@/components/dashboard/BudgetAlerts'
import CostEstimator from '@/components/dashboard/CostEstimator'
import ProfileSettings from '@/components/dashboard/ProfileSettings'
import { useGetCostSummary, useGetIncidents, useGetRecommendations } from '@/services/dataFetching'

const VALID_SECTIONS = new Set([
  'home',
  'analytics',
  'incidents',
  'recommendations',
  'cloud',
  'upload',
  'budget',
  'estimate',
  'profile',
])

export default function UserDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSection = searchParams.get('section')
  const [currentSection, setCurrentSection] = useState(
    initialSection && VALID_SECTIONS.has(initialSection) ? initialSection : 'home'
  )
  const starsRef = useRef(null)

  useEffect(() => {
    const urlSection = searchParams.get('section')
    if (urlSection && VALID_SECTIONS.has(urlSection) && urlSection !== currentSection) {
      setCurrentSection(urlSection)
    }
  }, [searchParams, currentSection])

  useEffect(() => {
    const container = starsRef.current
    if (!container) return
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div')
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
        return <DashboardHome />
      case 'analytics':
        return (
          <div className="space-y-8">
            <h2 className="app-section-title">Analytics & Trends</h2>
            <CostSummary />
            <TrendsChart />
          </div>
        )
      case 'incidents':
        return <IncidentsList />
      case 'recommendations':
        return <RecommendationsList />
      case 'cloud':
        return <CloudConnections />
      case 'upload':
        return <BillingUpload />
      case 'budget':
        return <BudgetAlerts />
      case 'estimate':
        return <CostEstimator />
      case 'profile':
        return <ProfileSettings />
      default:
        return <DashboardHome />
    }
  }

  return (
    <div className="app-page flex flex-col md:flex-row bg-pixel-darkest relative overflow-hidden">
      <UserNav currentSection={currentSection} setCurrentSection={handleSectionChange} />
      <main className="flex-1 overflow-auto relative bg-pixel-grid min-h-screen">
        <div ref={starsRef} className="absolute inset-0 pointer-events-none z-0" />
        <div className="app-shell max-w-6xl relative z-10">
          {renderSection()}
        </div>
      </main>
    </div>
  )
}

function DashboardHome() {
  const { data: costSummary, loading: costLoading } = useGetCostSummary()
  const { data: incidents, loading: incidentsLoading } = useGetIncidents()
  const { data: recommendations, loading: recsLoading } = useGetRecommendations()

  return (
    <div className="space-y-8">
      <h1 className="app-section-title">Your Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-pixel-purple p-6 border-2 border-pixel-coral">
          <p className="text-sm font-pixel opacity-80">Total Cost</p>
          <p className="text-3xl font-pixel mt-2">
            {costLoading ? '...' : `$${costSummary?.totalCost?.toFixed(2) || 0}`}
          </p>
        </div>

        <div className="bg-pixel-teal p-6 border-2 border-pixel-coral">
          <p className="text-sm font-pixel opacity-80">Active Incidents</p>
          <p className="text-3xl font-pixel mt-2">
            {incidentsLoading ? '...' : incidents?.filter((i) => i.status === 'active').length || 0}
          </p>
        </div>

        <div className="bg-pixel-coral p-6 border-2 border-pixel-purple text-pixel-darker">
          <p className="text-sm font-pixel opacity-80">Available Recommendations</p>
          <p className="text-3xl font-pixel mt-2">
            {recsLoading ? '...' : recommendations?.filter((r) => r.status === 'active').length || 0}
          </p>
        </div>
      </div>

      <div className="border-2 border-pixel-teal p-6">
        <h2 className="text-2xl font-pixel mb-4">Your View</h2>
        <p className="mb-4">You have access to view:</p>
        <ul className="space-y-2 font-pixel text-sm">
          <li>Cloud cost analytics and summaries</li>
          <li>Cost trends and spending patterns</li>
          <li>Detected incidents and anomalies</li>
          <li>Optimization recommendations (view only)</li>
          <li>Pre-deployment cost estimation</li>
          <li>Budget thresholds and proactive alerts</li>
          <li>AI cost insights assistant</li>
        </ul>
        <div className="mt-6">
          <Link
            to="/ai-insights"
            className="inline-block px-4 py-2 bg-pixel-teal text-pixel-darker border-2 border-pixel-teal font-pixel text-xs hover:opacity-80"
          >
            Open AI Insights
          </Link>
        </div>
      </div>
    </div>
  )
}
