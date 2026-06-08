import React, { useState, useEffect } from 'react'
import PixelButton from '@/components/ui/PixelButton'
import BrandLogo from '@/components/ui/BrandLogo'

const links = [
  { label: 'FEATURES', href: '#services' },
  { label: 'HOW IT WORKS', href: '#how-it-works' },
  { label: 'CASES', href: '#case-studies' },
  { label: 'PRICING', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] bg-pixel-darker
      border-b-4 border-pixel-cyan transition-shadow duration-200
      ${scrolled ? 'shadow-[0_4px_0_#000]' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <BrandLogo href="#hero" size="sm" className="shrink-0" />

        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-[13px] text-gray-400 hover:text-pixel-cyan transition-colors duration-150"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <PixelButton href="/signup" variant="teal" size="sm">
            Register
          </PixelButton>
          <PixelButton href="/login" variant="outline" size="sm">
            Login
          </PixelButton>
        </div>

        <button
          className="md:hidden font-pixel text-[10px] text-pixel-cyan border-2 border-pixel-cyan px-3 py-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? 'X' : 'MENU'}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-pixel-darker border-t-4 border-pixel-cyan px-4 pb-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block font-mono text-sm text-gray-400 py-3 border-b border-gray-800
                hover:text-pixel-cyan transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4">
            <div className="flex gap-2">
              <PixelButton href="/signup" variant="teal" size="sm" onClick={() => setOpen(false)}>
                Register
              </PixelButton>
              <PixelButton href="/login" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Login
              </PixelButton>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
