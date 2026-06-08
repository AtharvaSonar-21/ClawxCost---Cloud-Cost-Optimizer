import React, { useState } from 'react'
import { SectionHeader } from '@/components/ui/PixelDivider'
import { FAQ_ITEMS } from '@/constants/cases'
import PixelButton from '@/components/ui/PixelButton'
import { apiPost } from '@/api/client'

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="bg-cream py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <SectionHeader
          tag="FREQUENTLY ASKED"
          tagColor="purple"
          title={
            <>
              GOT QUESTIONS?
              <br />
              WE GOT PIXELS.
            </>
          }
          dark={false}
        />

        <div>
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="border-[4px] border-black -mb-[4px] bg-cream">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full text-left font-pixel text-[9px] leading-loose px-6 py-5 flex justify-between items-center gap-4 hover:bg-black/5 transition-colors cursor-pointer text-black"
              >
                <span>{item.q}</span>
                <span className={`shrink-0 transition-transform duration-200 ${open === i ? 'rotate-90' : ''}`}>
                  ▶
                </span>
              </button>
              {open === i && (
                <div className="font-mono text-sm text-gray-800 px-6 pb-5 leading-relaxed border-t-[3px] border-gray-300">
                  <div className="pt-4">{item.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTA() {
  const [email, setEmail] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Client-side basic validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatusMsg('Please enter a valid company email address.')
      setIsError(true)
      return
    }

    setSubmitting(true)
    setStatusMsg('')
    setIsError(false)

    try {
      const response = await apiPost('/auth/early-access', { email: email.trim() })
      setSubmitting(false)
      
      if (response.success) {
        setStatusMsg(response.data?.message || 'Access requested successfully! We will email you shortly.')
        setEmail('')
        setIsError(false)
      } else {
        setStatusMsg(response.message || 'Failed to submit request.')
        setIsError(true)
      }
    } catch (err) {
      setSubmitting(false)
      setStatusMsg('Connection error. Please try again.')
      setIsError(true)
    }
  }

  return (
    <section id="cta" className="bg-pixel-dark py-24 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-pixel-darker border-[4px] border-pixel-cyan shadow-px-cyan p-12">
          <div className="text-4xl mb-4 text-pixel-cyan animate-bounce">$</div>
          <h2 className="font-pixel text-[14px] sm:text-2xl leading-loose text-white mb-3">
            STOP OVERPAYING.
            <br />
            START CLAWXCOST.
          </h2>
          <p className="font-mono text-gray-500 text-base mb-8">
            Join 200+ engineering teams who stopped guessing and started saving. Free tier forever.
            No credit card required.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@company.com"
              className="pixel-input flex-1 bg-gray-900 border-[4px] border-pixel-cyan text-white font-mono text-sm px-4 py-3.5 min-w-0 placeholder-gray-600 focus:outline-none"
              required
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3.5 bg-pixel-teal text-pixel-darker border-[4px] border-pixel-cyan font-mono text-xs font-bold tracking-wider hover:opacity-85 disabled:opacity-50 shrink-0 whitespace-nowrap active:translate-y-px transition-all cursor-pointer"
            >
              {submitting ? 'SENDING...' : 'GET EARLY ACCESS'}
            </button>
          </form>

          {statusMsg && (
            <div className={`mt-4 p-3 border-2 font-mono text-xs max-w-lg mx-auto text-center ${
              isError 
                ? 'border-pixel-coral bg-pixel-coral/10 text-pixel-coral shadow-[0_0_8px_rgba(244,63,94,0.15)]' 
                : 'border-pixel-teal bg-pixel-teal/10 text-pixel-teal shadow-[0_0_8px_rgba(34,211,238,0.15)]'
            }`}>
              {statusMsg}
            </div>
          )}

          <p className="font-mono text-[12px] text-gray-600 mt-4">
            SCOUT PLAN FREE FOREVER - NO CREDIT CARD - CANCEL ANYTIME
          </p>
        </div>
      </div>
    </section>
  )
}

export default FAQ
