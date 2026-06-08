import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'

const RULES = [
  {
    title: 'RULE 1: COST SPIKE DETECTION',
    desc: 'Deviation = todayCost / rolling7DayAvg ≥ 2.0',
    example: '$250 today ÷ $100 avg = 2.5x SPIKE DETECTED',
    exampleColor: 'text-pixel-cyan',
    badge: 'HIGH',
    badgeCls: 'bg-pixel-coral text-white shadow-px-sm',
  },
  {
    title: 'RULE 2: SERVICE DOMINANCE RISK',
    desc: 'ServiceType % of total ≥ 60%',
    example: 'Compute $9,200 / Total $12,200 = 75% → RISK',
    exampleColor: 'text-pixel-yellow',
    badge: 'MEDIUM',
    badgeCls: 'bg-pixel-yellow text-black shadow-px-sm',
  },
  {
    title: 'RULE 3: VENDOR CONCENTRATION RISK',
    desc: 'Provider % of total ≥ 80%',
    example: 'AWS $10,000 / Total $12,000 = 83% → CRITICAL',
    exampleColor: 'text-pixel-coral',
    badge: 'CRITICAL',
    badgeCls: 'bg-pixel-violet text-white shadow-px-sm',
  },
]

// Bar heights as % of chart area (80px)  — last bar is the spike
const BARS = [50, 48, 52, 49, 53, 50, 51, 80]
const LABELS = ['D1','D2','D3','D4','D5','D6','D7','D8!']

export default function AnomalyDemo() {
  return (
    <section id="anomaly" className="bg-cream py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          tag="DETECTION ENGINE"
          tagColor="purple"
          title={<>CATCH ANOMALIES BEFORE<br />THEY BECOME DISASTERS</>}
          subtitle="Three detection rules fire in parallel on every billing event. Zero configuration required."
          dark={false}
        />

        {/* Terminal window */}
        <div className="bg-pixel-darker border-[4px] border-black shadow-px-xl overflow-hidden">

          {/* Terminal bar */}
          <div className="bg-gray-800 border-b-[4px] border-black px-4 py-2
            flex items-center gap-2">
            <span className="w-3 h-3 bg-pixel-coral  border-2 border-black inline-block" />
            <span className="w-3 h-3 bg-pixel-yellow border-2 border-black inline-block" />
            <span className="w-3 h-3 bg-pixel-mint   border-2 border-black inline-block" />
            <span className="font-mono text-[13px] text-gray-400 ml-2">
              CLAWXCOST ANOMALY ENGINE v1.0.0 — LIVE FEED
            </span>
          </div>

          <div className="p-6 space-y-3">

            {/* Rules */}
            {RULES.map((r) => (
              <div key={r.title}
                className="border-[3px] border-gray-700 p-4 flex flex-col sm:flex-row
                  sm:items-center gap-3 justify-between">
                <div className="flex-1">
                  <div className="font-pixel text-[9px] text-pixel-cyan mb-1">{r.title}</div>
                  <div className="font-mono text-[13px] text-gray-400">
                    {r.desc}<br />
                    <strong className={r.exampleColor}>{r.example}</strong>
                  </div>
                </div>
                <span className={`font-pixel text-[8px] px-2.5 py-1.5 border-[3px]
                  border-black shrink-0 ${r.badgeCls}`}>
                  {r.badge}
                </span>
              </div>
            ))}

            {/* Spike chart */}
            <div className="border-[3px] border-gray-700 p-4 bg-pixel-darkest mt-2">
              <div className="font-pixel text-[8px] text-gray-500 mb-3">
                ▸ AWS / COMPUTE / US-EAST-1 — 8-DAY COST VIEW (USD)
              </div>
              <div className="flex items-end gap-2 h-20">
                {BARS.map((h, i) => {
                  const isSpike = i === BARS.length - 1
                  return (
                    <div key={i}
                      className={`flex-1 border-2 min-w-[20px]
                        ${isSpike
                          ? 'bg-pixel-coral border-pixel-coral animate-spike'
                          : 'bg-pixel-teal  border-pixel-cyan'}`}
                      style={{ height: `${h}px` }}
                    />
                  )
                })}
              </div>
              <div className="flex gap-2 mt-1.5">
                {LABELS.map((l, i) => (
                  <div key={l}
                    className={`flex-1 text-center font-mono text-[10px]
                      ${i === LABELS.length - 1 ? 'text-pixel-coral' : 'text-gray-600'}`}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
