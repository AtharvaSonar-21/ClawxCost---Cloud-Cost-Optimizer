import React, { useState } from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'
import { CASES } from '@/constants/cases'

const FILTERS = [
  { id: 'all', label: 'ALL PROVIDERS' },
  { id: 'aws', label: 'AWS ONLY' },
  { id: 'azure', label: 'AZURE ONLY' },
  { id: 'gcp', label: 'GCP ONLY' },
  { id: 'multi', label: 'MULTI-CLOUD' },
]

export default function CaseStudies() {
  const [active, setActive] = useState('all')
  const safeCases = Array.isArray(CASES) ? CASES : []

  const visible = safeCases.filter(
    (c) => active === 'all' || String(c.provider || '').toLowerCase() === active
  )

  return (
    <section id="case-studies" className="bg-pixel-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="REAL RESULTS"
          tagColor="cyan"
          title="SAVINGS ACROSS EVERY PROVIDER"
          subtitle="Real optimization outcomes from the three detection and recommendation engines."
        />

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              type="button"
              className={`font-pixel text-[8px] px-4 py-3 border-[4px]
                transition-all duration-100 cursor-pointer
                ${active === f.id
                  ? 'bg-pixel-cyan text-black border-black'
                  : 'bg-pixel-darker text-gray-500 border-gray-700 hover:bg-pixel-cyan hover:text-black hover:border-black'
                }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((c) => (
            <div
              key={c.id}
              className="case-card bg-pixel-darker border-[4px] border-gray-700 p-6 reveal-ready h-full"
            >
              <span className={`font-pixel text-[7px] border-2 px-2 py-1 inline-block mb-3 ${c.labelClass}`}>
                {c.label}
              </span>
              <h3 className="font-pixel text-[9px] text-white leading-loose mb-2">{c.title}</h3>
              <p className="font-mono text-[13px] text-gray-500 leading-relaxed mb-4">{c.desc}</p>
              <div>
                <span className="font-pixel text-xl text-pixel-mint">{c.metric}</span>
                <span className="font-pixel text-[8px] text-gray-500 block mt-1">{c.metricLabel}</span>
              </div>
            </div>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="mt-4 border-2 border-pixel-coral p-4 font-pixel text-xs text-pixel-coral">
            No case studies available for this provider yet.
          </div>
        )}

      </div>
    </section>
  )
}
