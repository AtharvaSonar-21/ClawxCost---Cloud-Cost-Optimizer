import React from 'react'

const PROVIDERS = [
  { name: 'AMAZON WEB SERVICES', dot: '#f97316', hoverCls: 'hover:border-pixel-aws hover:text-pixel-aws' },
  { name: 'MICROSOFT AZURE',     dot: '#3b82f6', hoverCls: 'hover:border-pixel-azure hover:text-pixel-azure' },
  { name: 'GOOGLE CLOUD',        dot: '#4ade80', hoverCls: 'hover:border-pixel-gcp hover:text-pixel-gcp' },
  { name: 'MORE COMING SOON',    dot: '#555',    hoverCls: 'opacity-50 cursor-default' },
]

export default function Providers() {
  return (
    <section className="bg-pixel-darker py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center items-center gap-4">
          {PROVIDERS.map((p) => (
            <div key={p.name}
              className={`provider-chip font-pixel text-[10px] text-gray-500
                border-[3px] border-gray-700 px-5 py-3 flex items-center gap-3
                transition-all duration-200 ${p.hoverCls}`}>
              <span className="w-3 h-3 border-2 border-current inline-block shrink-0"
                style={{ background: p.dot, borderColor: p.dot }} />
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
