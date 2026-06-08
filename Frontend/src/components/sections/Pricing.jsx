import React from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'
import PixelButton from '@/components/ui/PixelButton'

const PLANS = [
  {
    tag:     '◀ STARTER CARTRIDGE',
    name:    'SCOUT',
    price:   '$0',
    period:  '/ month — forever free',
    featured: false,
    btn:     { label: 'START FREE', variant: 'purple' },
    features: [
      { yes: true,  text: '1 cloud account'         },
      { yes: true,  text: '7-day data retention'    },
      { yes: true,  text: 'Basic anomaly detection' },
      { yes: true,  text: '3 recommendations/mo'    },
      { yes: false, text: 'No AI insights'          },
      { yes: false, text: 'No multi-cloud'          },
    ],
  },
  {
    tag:     '★ ACCELERATE CARTRIDGE',
    tagCls:  'bg-pixel-cyan text-black',
    name:    'ACCELERATE',
    price:   '$49',
    period:  '/ month per workspace',
    featured: true,
    btn:     { label: 'START TRIAL', variant: 'teal' },
    features: [
      { yes: true, text: '5 cloud accounts'          },
      { yes: true, text: '90-day data retention'     },
      { yes: true, text: 'All 3 anomaly engines'     },
      { yes: true, text: 'Unlimited recommendations' },
      { yes: true, text: 'Gemini AI insights'        },
      { yes: true, text: 'Multi-cloud analysis'      },
    ],
  },
  {
    tag:     '▶ ENTERPRISE CARTRIDGE',
    name:    'DOMINATE',
    price:   '$199',
    period:  '/ month per workspace',
    featured: false,
    btn:     { label: 'CONTACT SALES', variant: 'coral' },
    features: [
      { yes: true, text: 'Unlimited accounts'        },
      { yes: true, text: '365-day retention'         },
      { yes: true, text: 'Custom thresholds'         },
      { yes: true, text: 'Webhook alerts (Slack)'    },
      { yes: true, text: 'Advanced AI forecasting'   },
      { yes: true, text: 'SLA + Priority support'    },
    ],
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="bg-cream py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          tag="PRICING PLANS"
          tagColor="purple"
          title="PICK YOUR CARTRIDGE"
          subtitle="Start free, scale as your cloud grows. No credit card required for Starter."
          dark={false}
        />

        <div className="flex flex-wrap justify-center items-stretch sm:items-end gap-4 sm:gap-0">
          {PLANS.map((plan) => (
            <div key={plan.name}
              className={`pricing-card bg-cream border-[4px] border-black shadow-px-lg
                px-5 sm:px-7 py-8 w-full sm:w-[280px] relative sm:-mx-[2px]
                ${plan.featured
                  ? 'pricing-card-featured bg-pixel-mid text-white border-pixel-cyan shadow-px-cyan lg:-translate-y-4 z-10 sm:w-[310px]'
                  : ''
                }`}>

              {plan.featured && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2
                  font-pixel text-[7px] bg-pixel-cyan text-black
                  border-[3px] border-black px-3 py-1 whitespace-nowrap">
                  ▶ MOST POPULAR
                </div>
              )}

              <span className={`font-pixel text-[7px] px-2 py-1 border-[2px] inline-block mb-4
                ${plan.tagCls ?? 'bg-pixel-violet text-white border-black'}`}>
                {plan.tag}
              </span>

              <div className={`font-pixel text-[10px] mb-2 ${plan.featured ? 'text-gray-300' : 'text-black'}`}>
                {plan.name}
              </div>
              <div className="font-pixel text-3xl text-pixel-cyan mb-1">{plan.price}</div>
              <div className="font-mono text-[13px] text-gray-500 mb-6">{plan.period}</div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text}
                    className="flex items-center gap-2 font-mono text-[13px]
                      border-b border-black/10 pb-2">
                    <span className={`w-3.5 h-3.5 border-2 border-black shrink-0 flex items-center
                      justify-center text-[10px] ${f.yes ? 'bg-pixel-mint' : 'bg-gray-300'}`}>
                      {f.yes ? '✓' : '✗'}
                    </span>
                    <span className={plan.featured ? 'text-gray-300' : 'text-gray-700'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <PixelButton
                href="#cta"
                variant={plan.btn.variant}
                size="md"
                className="w-full text-center">
                {plan.btn.label}
              </PixelButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
