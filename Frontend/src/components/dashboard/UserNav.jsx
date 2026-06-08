import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import BrandLogo from '@/components/ui/BrandLogo'
import { useState } from 'react'

export default function UserNav({ currentSection, setCurrentSection }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'cloud', label: 'Cloud Connect' },
    { id: 'upload', label: 'Upload Billing' },
    { id: 'budget', label: 'Budgets' },
    { id: 'estimate', label: 'Cost Estimator' },
    { id: 'profile', label: 'Profile Settings' },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  // Generate fallback avatar initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CC'

  return (
    <aside className="w-full md:w-64 bg-pixel-darker border-b-4 md:border-b-0 md:border-r-4 border-pixel-teal md:min-h-screen flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-3 md:p-4 border-b-4 border-pixel-teal bg-pixel-black flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <BrandLogo to="/" size="sm" className="block" />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden font-pixel text-[10px] text-pixel-teal border-2 border-pixel-teal px-2 py-1 flex-shrink-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
        <p className="text-[10px] font-pixel text-pixel-coral uppercase mt-2 opacity-75">User Panel</p>
      </div>

      {/* Dynamic Profile Widget */}
      <div className="p-3 border-b-2 border-pixel-teal/20 bg-pixel-black/30 flex items-center gap-3 flex-shrink-0">
        <div className="flex-shrink-0">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="Avatar"
              className="w-10 h-10 border-2 border-pixel-teal object-cover image-rendering-pixelated"
            />
          ) : (
            <div className="w-10 h-10 bg-pixel-purple border-2 border-pixel-teal flex items-center justify-center font-pixel text-xs text-white uppercase">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold font-pixel text-pixel-teal truncate">{user?.name || 'User'}</p>
          <p className="text-[10px] font-mono opacity-60 truncate">{user?.email || ''}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${mobileOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentSection(item.id)
                setMobileOpen(false)
              }}
              className={`w-full px-3 py-2 font-pixel text-[11px] md:text-xs border-2 transition-all duration-150 flex items-center gap-2 ${
                currentSection === item.id
                  ? 'bg-pixel-teal text-pixel-darker border-pixel-teal'
                  : 'bg-pixel-black text-pixel-teal border-pixel-teal hover:bg-pixel-teal hover:text-pixel-darker'
              }`}
            >
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t-4 border-pixel-teal bg-pixel-black p-3 ${mobileOpen ? 'block' : 'hidden'} md:block flex-shrink-0`}>
        <div className="space-y-2 text-[10px]">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-2 py-1 font-pixel text-pixel-coral border-2 border-pixel-coral text-center hover:bg-pixel-coral hover:text-pixel-darker transition-all"
          >
            Home
          </Link>
          <button
            onClick={() => {
              handleLogout()
              setMobileOpen(false)
            }}
            className="w-full px-2 py-1 font-pixel text-pixel-coral border-2 border-pixel-coral hover:bg-pixel-coral hover:text-pixel-darker transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
