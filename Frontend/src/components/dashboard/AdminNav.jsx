import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import BrandLogo from '@/components/ui/BrandLogo'
import { useState } from 'react'

export default function AdminNav({ currentSection, setCurrentSection, pendingLeadsCount = 0 }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Platform Overview', code: 'OVW' },
    { id: 'upload', label: 'Ingest Billing', code: 'ING' },
    { id: 'system', label: 'System Settings', code: 'SYS' },
    { id: 'profile', label: 'Profile Settings', code: 'PRF' },
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
            className="md:hidden font-mono text-xs text-pixel-teal border-2 border-pixel-teal px-2 py-1 flex-shrink-0 hover:bg-pixel-teal/10 active:translate-y-px transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? '[✕]' : '[☰]'}
          </button>
        </div>
        <p className="text-[11px] font-mono text-pixel-cyan uppercase mt-2 tracking-wider font-bold">
          ADMIN SECURITY PANEL
        </p>
      </div>

      {/* Professional Profile Widget */}
      <div className="p-3 border-b-2 border-pixel-teal/20 bg-pixel-black/35 flex items-center gap-3 flex-shrink-0">
        <div className="flex-shrink-0">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="Avatar"
              className="w-10 h-10 border-2 border-pixel-teal object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-pixel-purple border-2 border-pixel-teal flex items-center justify-center font-mono text-sm text-white font-bold">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold font-mono text-pixel-teal truncate">{user?.name || 'Administrator'}</p>
          <p className="text-[10px] font-mono text-gray-400 truncate mt-0.5">{user?.email || ''}</p>
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
              className={`w-full px-3 py-2 font-mono text-xs border-2 transition-all duration-150 flex items-center justify-between gap-2 ${
                currentSection === item.id
                  ? 'bg-pixel-teal text-pixel-darker border-pixel-teal font-bold shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                  : 'bg-pixel-black text-pixel-teal border-pixel-teal hover:bg-pixel-teal/15 hover:text-pixel-teal'
              }`}
            >
              <span className="truncate flex items-center gap-1.5">
                {item.label}
                {item.id === 'home' && pendingLeadsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-pixel-coral border border-black text-white font-bold animate-[pulse_1.5s_infinite] shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                    {pendingLeadsCount} NEW
                  </span>
                )}
              </span>
              <span className="text-[9px] opacity-60 font-bold">[{item.code}]</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t-4 border-pixel-teal bg-pixel-black p-3 ${mobileOpen ? 'block' : 'hidden'} md:block flex-shrink-0`}>
        <div className="space-y-2 text-xs">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-2 py-1.5 font-mono text-pixel-teal border-2 border-pixel-teal text-center hover:bg-pixel-teal hover:text-pixel-darker transition-all font-bold"
          >
            RETURN HOME
          </Link>
          <button
            onClick={() => {
              handleLogout()
              setMobileOpen(false)
            }}
            className="w-full px-2 py-1.5 font-mono text-pixel-teal border-2 border-pixel-teal hover:bg-pixel-teal hover:text-pixel-darker transition-all font-bold"
          >
            SECURE LOGOUT
          </button>
        </div>
      </div>
    </aside>
  )
}
