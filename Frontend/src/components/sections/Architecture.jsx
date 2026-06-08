import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'

const LAYERS = [
  {
    label: 'FRONTEND',
    color: 'border-pixel-cyan text-pixel-cyan',
    boxes: ['React / Next.js', 'Tailwind CSS', 'Pixel Dashboard'],
  },
  {
    label: 'AUTH',
    color: 'border-pixel-lav text-pixel-lav',
    boxes: ['JWT Tokens', 'RBAC', 'Rate Limiting'],
  },
  {
    label: 'API GATEWAY',
    color: 'border-pixel-yellow text-pixel-yellow',
    boxes: ['Express.js', '16 Endpoints', 'Validation', 'Correlation IDs'],
  },
  {
    label: 'CORE SERVICES',
    color: 'border-gray-400 text-gray-400',
    boxes: ['Normalization', 'Anomaly Engine', 'Recommendations', 'Aggregation'],
  },
  {
    label: 'QUEUE SYSTEM',
    color: 'border-pixel-coral text-pixel-coral',
    boxes: ['BullMQ', 'Redis', 'Worker Service', 'Cron Jobs'],
  },
  {
    label: 'DATABASE',
    color: 'border-pixel-gcp text-pixel-gcp',
    boxes: ['MongoDB Atlas', '5 Collections', 'Compound Indexes'],
  },
  {
    label: 'AI LAYER',
    color: 'border-pixel-lav text-pixel-lav',
    boxes: ['Gemini API', 'Context Builder', 'NL Query Engine'],
  },
]

export default function Architecture() {
  return (
    <section id="architecture" className="bg-pixel-dark py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          tag="TECHNICAL ARCHITECTURE"
          tagColor="lav"
          title="PRODUCTION-GRADE SAAS STACK"
          subtitle="Built for scale from day one. Every layer is independently deployable, testable, and replaceable."
        />

        <div className="bg-pixel-darker border-[4px] border-gray-700 shadow-px-xl p-6 overflow-x-auto">
          <div className="font-pixel text-[9px] text-pixel-cyan text-center border-b-2 border-gray-700 pb-4 mb-4">
            CLAWXCOST FINAL SAAS ARCHITECTURE
          </div>

          {LAYERS.map((layer, i) => (
            <div key={layer.label}>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-pixel text-[7px] text-gray-600 w-24 text-right shrink-0">
                  {layer.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {layer.boxes.map((box, bi) => (
                    <React.Fragment key={box}>
                      {bi > 0 && <span className="font-mono text-gray-700 self-center">+</span>}
                      <span className={`font-mono text-[12px] px-3 py-2 border-[3px] ${layer.color}`}>
                        {box}
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {i < LAYERS.length - 1 && (
                <div className="text-center text-gray-700 font-mono text-sm py-1 ml-28">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
