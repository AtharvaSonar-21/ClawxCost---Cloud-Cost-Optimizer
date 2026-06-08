import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'
import { SERVICES } from '@/constants/services'

/* ── Pixel SVG icons per service ────────────────────────────────────────── */
function ServiceIcon({ id }) {
  const icons = {
    billing: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="8"  y="16" width="40" height="24" fill="#000"/>
        <rect x="12" y="20" width="32" height="16" fill="#16a34a"/>
        <rect x="12" y="20" width="8"  height="4"  fill="#4ade80"/>
        <rect x="22" y="24" width="8"  height="8"  fill="#4ade80"/>
        <rect x="32" y="20" width="12" height="4"  fill="#4ade80"/>
        <rect x="20" y="40" width="16" height="4"  fill="#000"/>
        <rect x="16" y="44" width="24" height="4"  fill="#000"/>
      </svg>
    ),
    trends: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="8"  y="8"  width="8" height="40" fill="#000"/>
        <rect x="12" y="12" width="4" height="32" fill="#db2777"/>
        <rect x="20" y="20" width="8" height="20" fill="#000"/>
        <rect x="24" y="24" width="4" height="16" fill="#f472b6"/>
        <rect x="32" y="12" width="8" height="28" fill="#000"/>
        <rect x="36" y="16" width="4" height="24" fill="#db2777"/>
        <rect x="44" y="28" width="8" height="12" fill="#000"/>
        <rect x="48" y="32" width="4" height="8"  fill="#f43f5e"/>
        <rect x="8"  y="48" width="44" height="4" fill="#000"/>
      </svg>
    ),
    anomaly: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="16" y="4"  width="24" height="4"  fill="#000"/>
        <rect x="12" y="8"  width="32" height="4"  fill="#000"/>
        <rect x="8"  y="12" width="40" height="24" fill="#000"/>
        <rect x="12" y="16" width="32" height="16" fill="#ca8a04"/>
        <rect x="16" y="18" width="6"  height="6"  fill="#fef08a"/>
        <rect x="26" y="18" width="6"  height="6"  fill="#fef08a"/>
        <rect x="16" y="26" width="22" height="3"  fill="#fef08a"/>
        <rect x="8"  y="36" width="40" height="4"  fill="#000"/>
        <rect x="16" y="44" width="24" height="4"  fill="#000"/>
      </svg>
    ),
    cloud: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="8"  y="24" width="40" height="20" fill="#000"/>
        <rect x="12" y="28" width="32" height="12" fill="#0369a1"/>
        <rect x="16" y="8"  width="24" height="16" fill="#000"/>
        <rect x="20" y="12" width="16" height="8"  fill="#0ea5e9"/>
        <rect x="20" y="20" width="16" height="4"  fill="#38bdf8"/>
        <rect x="16" y="32" width="8"  height="4"  fill="#7dd3fc"/>
        <rect x="28" y="30" width="12" height="6"  fill="#0ea5e9"/>
        <rect x="16" y="44" width="24" height="4"  fill="#000"/>
      </svg>
    ),
    ai: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="20" y="4"  width="16" height="8"  fill="#000"/>
        <rect x="16" y="12" width="24" height="4"  fill="#7c3aed"/>
        <rect x="12" y="16" width="32" height="28" fill="#000"/>
        <rect x="16" y="20" width="24" height="20" fill="#6d28d9"/>
        <rect x="20" y="22" width="4"  height="4"  fill="#c4b5fd"/>
        <rect x="28" y="22" width="4"  height="4"  fill="#c4b5fd"/>
        <rect x="20" y="30" width="16" height="3"  fill="#c4b5fd"/>
        <rect x="20" y="34" width="12" height="3"  fill="#a78bfa"/>
        <rect x="12" y="44" width="32" height="4"  fill="#000"/>
        <rect x="16" y="48" width="24" height="4"  fill="#7c3aed"/>
      </svg>
    ),
    optimize: (
      <svg viewBox="0 0 56 56" fill="none">
        <rect x="4"  y="16" width="48" height="24" fill="#000"/>
        <rect x="8"  y="20" width="40" height="16" fill="#0f766e"/>
        <rect x="12" y="22" width="12" height="12" fill="#2dd4bf"/>
        <rect x="28" y="24" width="16" height="4"  fill="#ccfbf1"/>
        <rect x="28" y="30" width="12" height="4"  fill="#99f6e4"/>
        <rect x="16" y="40" width="24" height="4"  fill="#000"/>
        <rect x="20" y="44" width="16" height="4"  fill="#0f766e"/>
      </svg>
    ),
  }
  return (
    <div className="w-14 h-14 mb-4">{icons[id] ?? null}</div>
  )
}

export default function Services() {
  return (
    <section id="services" className="bg-cream py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="PLATFORM FEATURES"
          tagColor="purple"
          title={<>EVERYTHING YOU NEED TO<br />TAME YOUR CLOUD BILL</>}
          subtitle="Six production-grade engines working together to normalize, analyze, detect and optimize your multi-cloud spending."
          dark={false}
        />

        {/* 3 × 2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((svc) => (
            <div key={svc.id}
              className={`service-card ${svc.color} border-[4px] border-black
                -m-[2px] p-7 cursor-pointer relative z-[1]`}>
              <ServiceIcon id={svc.icon} />
              <h3 className="font-pixel text-[10px] text-black leading-loose mb-3">
                {svc.title}
              </h3>
              <p className="font-mono text-[13px] text-gray-700 leading-relaxed">
                {svc.desc}
              </p>
              <span className="inline-block mt-4 font-pixel text-[7px]
                bg-black text-white px-2 py-1">
                {svc.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
