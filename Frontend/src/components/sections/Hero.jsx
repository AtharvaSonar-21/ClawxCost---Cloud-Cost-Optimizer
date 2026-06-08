import React, { useEffect, useRef } from 'react'
import RobotMascot from '@/components/sprites/RobotMascot'
import { AWSIcon, AzureIcon, GCPIcon, DollarIcon, ChartIcon } from '@/components/sprites/CloudIcons'
import PixelButton from '@/components/ui/PixelButton'

const STATS = [
  { num: '$2.4M', label: 'SAVED FOR CLIENTS' },
  { num: '98%',   label: 'ACCURACY RATE'  },
  { num: '3',     label: 'CLOUD PROVIDERS'   },
  { num: '<60s',  label: 'FULL ANALYSIS' },
  { num: '100+',  label: 'HAPPY TEAMS'      },
]

const FLOATS = [
  { Icon: AWSIcon,    cls: 'top-[28%] left-[8%]',  delay: '0s'    },
  { Icon: AzureIcon,  cls: 'top-[18%] right-[10%]', delay: '0.8s' },
  { Icon: GCPIcon,    cls: 'top-[58%] left-[6%]',  delay: '1.6s'  },
  { Icon: DollarIcon, cls: 'top-[52%] right-[8%]', delay: '2.4s'  },
  { Icon: ChartIcon,  cls: 'top-[72%] right-[16%]',delay: '1.2s'  },
]

export default function Hero() {
  const starsRef = useRef(null)

  useEffect(() => {
    const container = starsRef.current
    if (!container) return
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div')
      s.style.cssText = `
        position:absolute;
        width:4px; height:4px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        background:${Math.random() > 0.6 ? '#22d3ee' : Math.random() > 0.5 ? '#c4b5fd' : '#fff'};
        animation:twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite alternate;
        animation-delay:${Math.random() * 3}s;
        pointer-events:none;
      `
      container.appendChild(s)
    }
    return () => { if (container) container.innerHTML = '' }
  }, [])

  return (
    <section id="hero"
      className="relative min-h-screen bg-pixel-mid flex flex-col items-center
        justify-center px-4 pt-24 pb-16 overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 bg-pixel-grid pointer-events-none" />

      {/* Stars */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

      {/* Floating cloud icons (hidden on small screens) */}
      {FLOATS.map(({ Icon, cls, delay }) => (
        <div key={cls} className={`absolute hidden lg:block ${cls}`}
          style={{ animation: `floatIcon 4s ease-in-out infinite`, animationDelay: delay }}>
          <Icon className="w-12 h-12" />
        </div>
      ))}

      {/* Robot */}
      <RobotMascot className="w-40 h-40 sm:w-48 sm:h-48 relative z-10 mb-4" />

      {/* Badge */}
      <div className="relative z-10 animate-badge-bob mb-6">
        <span className="font-pixel text-[8px] bg-pixel-teal text-white
          border-[3px] border-black shadow-px-sm px-3 py-2 inline-block tracking-widest">
          ▶ REAL-TIME CLOUD COST INTELLIGENCE
        </span>
      </div>

      {/* Headline */}
      <h1 className="relative z-10 font-pixel text-white text-shadow-pixel
        text-[18px] sm:text-3xl md:text-4xl leading-loose text-center mb-6">
        YOUR CLOUD BILL IS <span className="text-pixel-coral">TOO HIGH</span><br />
        WE CLAW IT <span className="text-pixel-cyan">BACK</span><br />
        ONE PIXEL AT A TIME
      </h1>

      {/* Subtitle - Relatable developer copy */}
      <p className="relative z-10 font-mono text-gray-300 text-center max-w-2xl
        text-sm sm:text-base leading-relaxed mb-4">
        We built ClawxCost because we got tired of surprise $3,000 AWS bills.
      </p>

      <p className="relative z-10 font-mono text-gray-300 text-center max-w-2xl
        text-sm sm:text-base leading-relaxed mb-10">
        Drop your CSV sheets, let Gemini dig up your unused testing servers, and save before your finance team notices.
      </p>

      {/* CTA row */}
      <div className="relative z-10 flex flex-wrap gap-4 justify-center mb-14">
        <PixelButton href="#cta"          variant="teal"    size="lg">▶ START FREE TRIAL</PixelButton>
        <PixelButton href="#how-it-works" variant="outline" size="lg">HOW IT WORKS</PixelButton>
      </div>

      {/* Stats bar - Improved styling for better HCI */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2">
        {STATS.map((s, i) => (
          <div key={s.label}
            className="bg-pixel-darker border-4 border-pixel-cyan px-4 sm:px-6 py-4 text-center w-full sm:w-auto
              hover:border-pixel-teal hover:bg-pixel-darker/80 transition-colors duration-300
              sm:-mx-[2px] first:ml-0">
            <span className="font-pixel text-xl text-pixel-cyan block">{s.num}</span>
            <span className="font-mono text-[11px] text-gray-400 block mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
