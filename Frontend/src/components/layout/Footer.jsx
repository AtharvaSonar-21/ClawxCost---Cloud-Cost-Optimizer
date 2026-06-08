import React from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/ui/BrandLogo'

const cols = [
  {
    heading: 'PRODUCT',
    links: [
      { label: 'Features', href: '#services' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Case Studies', href: '#case-studies' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    heading: 'PLATFORM',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Sign Up', href: '/signup' },
      { label: 'User Dashboard', href: '/dashboard/user' },
      { label: 'Admin Dashboard', href: '/dashboard/admin' },
    ],
  },
  {
    heading: 'PROVIDERS',
    items: ['Amazon Web Services', 'Microsoft Azure', 'Google Cloud', 'Multi-Cloud'],
  },
]

const badges = ['SOC2 READY', 'GDPR OK', 'AES-256', 'MONGODB', 'BUILT WITH LOVE']

export default function Footer() {
  const FooterLink = ({ href, children }) => {
    const isInternalRoute = /^\/(?!\/)/.test(href)
    if (isInternalRoute) {
      return (
        <Link to={href} className="font-mono text-[13px] text-gray-500 hover:text-pixel-cyan transition-colors">
          {children}
        </Link>
      )
    }
    return (
      <a href={href} className="font-mono text-[13px] text-gray-500 hover:text-pixel-cyan transition-colors">
        {children}
      </a>
    )
  }

  return (
    <footer className="bg-pixel-darker border-t-4 border-gray-800 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-8 md:gap-12 justify-between">
          <div className="w-full sm:max-w-[280px]">
            <div className="mb-3">
              <BrandLogo href="#hero" size="sm" />
            </div>
            <p className="font-mono text-[13px] text-gray-500 leading-relaxed">
              Hand-crafted pixel-by-pixel by developers who once spent $4,200 on an unchecked database node. We built this so you don't repeat our mistakes.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <h4 className="font-pixel text-[8px] text-pixel-cyan mb-4">{col.heading}</h4>
              <ul className="space-y-2">
                {col.links
                  ? col.links.map((l) => (
                      <li key={l.label}>
                        <FooterLink href={l.href}>{l.label}</FooterLink>
                      </li>
                    ))
                  : col.items?.map((item) => (
                      <li key={item} className="font-mono text-[13px] text-gray-500">
                        {item}
                      </li>
                    ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t-2 border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[12px] text-gray-600">(c) 2026 CLAWXCOST. PIXEL PERFECT FINOPS.</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b} className="font-pixel text-[6px] px-2 py-1 border-2 border-gray-700 text-gray-600">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
