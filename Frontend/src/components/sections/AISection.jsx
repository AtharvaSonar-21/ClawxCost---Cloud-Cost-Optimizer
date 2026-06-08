import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'

export default function AISection() {
  return (
    <section id="ai" className="bg-pixel-darker py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          tag="GEMINI AI LAYER"
          tagColor="green"
          title={<>ASK YOUR CLOUD DATA<br />ANYTHING</>}
          subtitle="Natural language queries powered by Gemini. AI enhances — never replaces — your rules-based detection."
        />

        {/* AI Terminal */}
        <div className="bg-black border-[4px] border-pixel-cyan shadow-px-purple overflow-hidden">
          <div className="bg-pixel-cyan border-b-[4px] border-black px-4 py-2.5
            flex items-center gap-2 font-pixel text-[9px] text-black">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="4" y="0" width="8" height="4" fill="#000"/>
              <rect x="2" y="4" width="12" height="8" fill="#000"/>
              <rect x="4" y="6" width="4" height="4" fill="#22d3ee"/>
              <rect x="10" y="6" width="4" height="4" fill="#22d3ee"/>
            </svg>
            CLAWXCOST AI — GEMINI POWERED INSIGHTS TERMINAL
          </div>

          <div className="p-5 space-y-4">
            {/* User message */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-pixel text-[7px] text-gray-600">YOU</span>
              <div className="bg-pixel-violet border-[3px] border-purple-400
                px-4 py-2.5 font-mono text-[13px] text-white max-w-[80%]">
                Why did my AWS costs increase 2.4x this week?
              </div>
            </div>

            {/* Bot reply */}
            <div className="flex flex-col items-start gap-1">
              <span className="font-pixel text-[7px] text-gray-600">CLAWXCOST AI</span>
              <div className="bg-gray-900 border-[3px] border-pixel-cyan
                px-4 py-2.5 font-mono text-[13px] text-pixel-cyan max-w-[90%] leading-relaxed">
                ▸ Analyzed 7-day trend for AWS/compute/us-east-1<br /><br />
                Your EC2 costs increased from $70/day avg to $168/day on Tuesday.
                Correlates with auto-scaling event (4→12 instances at 3pm UTC) with
                no matching traffic spike in CloudFront.<br /><br />
                Likely cause: misconfigured scaling policy threshold.<br />
                Conservative estimate: <strong>$1,395/mo savings</strong> with m5.large reserved instances.
                <span className="cursor-blink" />
              </div>
            </div>

            {/* Second user */}
            <div className="flex flex-col items-end gap-1">
              <span className="font-pixel text-[7px] text-gray-600">YOU</span>
              <div className="bg-pixel-violet border-[3px] border-purple-400
                px-4 py-2.5 font-mono text-[13px] text-white max-w-[80%]">
                What will my cloud bill look like next month?
              </div>
            </div>

            {/* Second bot */}
            <div className="flex flex-col items-start gap-1">
              <span className="font-pixel text-[7px] text-gray-600">CLAWXCOST AI</span>
              <div className="bg-gray-900 border-[3px] border-pixel-cyan
                px-4 py-2.5 font-mono text-[13px] text-pixel-cyan max-w-[90%] leading-relaxed">
                ▸ 30-day forecast based on current trends...<br /><br />
                Without action: <span className="text-pixel-coral font-bold">$14,200 (+15%)</span><br />
                With recommendations applied: <span className="text-pixel-mint font-bold">$11,800 (-4%)</span><br /><br />
                Top savings opportunities queued in /recommendations
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 mt-2">
              {[
                { n: '3',      l: 'ACTIVE INCIDENTS'  },
                { n: '$2,400', l: 'POTENTIAL SAVINGS'  },
                { n: '98%',    l: 'DETECTION CONFIDENCE' },
              ].map((m) => (
                <div key={m.l} className="border-2 border-gray-800 p-2.5 text-center -mx-[1px]">
                  <span className="font-pixel text-sm text-pixel-mint block">{m.n}</span>
                  <span className="font-mono text-[11px] text-gray-500 block mt-1">{m.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
