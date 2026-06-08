import React from 'react'

/* ── Marquee items ──────────────────────────────────────────────────────── */
const ITEMS = [
  'AWS COST EXPLORER','GCP BILLING API','AZURE COST MGMT','ANOMALY DETECTION',
  'RIGHTSIZING','VENDOR CONCENTRATION','GEMINI AI INSIGHTS','REAL-TIME ALERTS',
  'BULLMQ QUEUE','JWT AUTH',
]
const DOUBLED = [...ITEMS, ...ITEMS]  // duplicate for seamless loop

export default function MarqueeStrip() {
  return (
    <div className="bg-pixel-cyan border-y-4 border-black py-3 overflow-hidden whitespace-nowrap">
      <div className="marquee-inner inline-block">
        {DOUBLED.map((item, i) => (
          <span key={i} className="font-pixel text-[10px] text-black px-8">✦ {item}</span>
        ))}
      </div>
    </div>
  )
}
