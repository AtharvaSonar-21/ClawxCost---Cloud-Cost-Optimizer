import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'

const STEPS = [
  { num: '01', label: 'INGEST',    desc: 'POST /billing receives raw cloud data from AWS, GCP, Azure APIs'       },
  { num: '02', label: 'NORMALIZE', desc: 'EC2 → compute, S3 → storage, CDN → network. Cross-cloud standard.'     },
  { num: '03', label: 'ANALYZE',   desc: 'Real-time cost aggregation, trend detection, and pattern analysis.'     },
  { num: '04', label: 'DETECT',    desc: 'Multi-rule anomaly engine identifies cost spikes and risks.'           },
  { num: '05', label: 'RECOMMEND', desc: 'Optimization engine generates savings opportunities with estimates.'      },
  { num: '06', label: 'INSIGHTS',  desc: 'AI layer synthesizes data into actionable, plain-English recommendations.'    },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-pixel-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Pipeline */}
        <SectionHeader
          tag="WORKFLOWS"
          tagColor="teal"
          title="HOW CLAWXCOST WORKS"
          subtitle="From raw billing data to intelligent cost optimization in minutes. Fully automated. Real-time insights."
        />

        <div className="flex flex-wrap justify-center gap-3 sm:gap-0">
          {STEPS.map((s, i) => (
            <div key={s.num}
              className="bg-pixel-darker border-[4px] border-pixel-teal
                w-full sm:w-[220px] lg:w-[180px] px-4 py-5 text-center relative sm:-mx-[2px]
                first:ml-0 last:mr-0 hover:border-pixel-cyan transition-colors duration-300
                reveal-ready">
              <span className="font-pixel text-2xl text-pixel-teal block mb-1">{s.num}</span>
              <div className="font-pixel text-[8px] text-white leading-loose mb-1">{s.label}</div>
              <div className="font-mono text-[11px] text-gray-400 leading-snug">{s.desc}</div>
              {i < STEPS.length - 1 && (
                <span className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2
                  text-pixel-teal text-sm z-10 font-mono">▶</span>
              )}
            </div>
          ))}
        </div>

        {/* Value Props - Improved HCI */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-pixel-darker border-2 border-pixel-teal p-6 reveal-ready hover:border-pixel-cyan transition-colors duration-300">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-pixel text-sm text-white mb-2">Real-Time Detection</h4>
            <p className="font-mono text-xs text-gray-400">Anomalies detected instantly. Alerts triggered before costs spiral out of control.</p>
          </div>

          <div className="bg-pixel-darker border-2 border-pixel-coral p-6 reveal-ready hover:border-pixel-teal transition-colors duration-300">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-pixel text-sm text-white mb-2">Actionable Intelligence</h4>
            <p className="font-mono text-xs text-gray-400">AI-powered recommendations with estimated monthly savings. Easy to understand. Ready to implement.</p>
          </div>

          <div className="bg-pixel-darker border-2 border-pixel-cyan p-6 reveal-ready hover:border-pixel-coral transition-colors duration-300">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-pixel text-sm text-white mb-2">Multi-Cloud Control</h4>
            <p className="font-mono text-xs text-gray-400">Unified view across AWS, GCP, and Azure. Compare costs and optimize all at once.</p>
          </div>
        </div>

      </div>
    </section>
  )
}
