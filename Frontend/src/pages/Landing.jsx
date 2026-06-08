import React, { useEffect } from 'react'
import Navbar        from '@/components/layout/Navbar'
import Footer        from '@/components/layout/Footer'
import Hero          from '@/components/sections/Hero'
import MarqueeStrip  from '@/components/sections/MarqueeStrip'
import Providers     from '@/components/sections/Providers'
import Services      from '@/components/sections/Services'
import HowItWorks    from '@/components/sections/HowItWorks'
import AnomalyDemo   from '@/components/sections/AnomalyDemo'
import CaseStudies   from '@/components/sections/CaseStudies'
import AISection     from '@/components/sections/AISection'
import Pricing       from '@/components/sections/Pricing'
import FAQ           from '@/components/sections/FAQ'
import CTA           from '@/components/sections/CTA'
import PixelDivider  from '@/components/ui/PixelDivider'
import useReveal     from '@/hooks/useReveal'

export default function Landing() {
  // Activate scroll-reveal on every .reveal-ready element
  useReveal()

  return (
    <div className="min-h-screen bg-pixel-darker text-white">
      <Navbar />

      <main>
        <Hero />
        <MarqueeStrip />
        <Providers />
        <PixelDivider variant="purple" />
        <Services />
        <PixelDivider variant="teal" />
        <HowItWorks />
        <PixelDivider variant="coral" />
        <AnomalyDemo />
        <PixelDivider variant="teal" />
        <CaseStudies />
        <PixelDivider variant="purple" />
        <AISection />
        <PixelDivider variant="coral" />
        <Pricing />
        <PixelDivider variant="coral" />
        <FAQ />
        <PixelDivider variant="teal" />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
