import React from 'react'

/* ── PixelBadge ────────────────────────────────────────────────────────── */
export function PixelBadge({ children, color = 'teal', className = '' }) {
  const colors = {
    teal:   'bg-pixel-teal   text-white border-black shadow-px-sm',
    cyan:   'bg-pixel-cyan   text-black border-black shadow-px-sm',
    coral:  'bg-pixel-coral  text-white border-black shadow-px-sm',
    purple: 'bg-pixel-violet text-white border-black shadow-px-sm',
    yellow: 'bg-pixel-yellow text-black border-black shadow-px-sm',
    mint:   'bg-pixel-mint   text-black border-black shadow-px-sm',
    pink:   'bg-pixel-pink   text-black border-black shadow-px-sm',
    aws:    'bg-pixel-aws    text-white border-black shadow-px-sm',
    azure:  'bg-pixel-azure  text-white border-black shadow-px-sm',
    gcp:    'bg-pixel-gcp    text-black border-black shadow-px-sm',
  }
  return (
    <span className={`font-pixel text-[7px] px-2 py-1 border-[3px] inline-block
      ${colors[color] || colors.teal} ${className}`}>
      {children}
    </span>
  )
}

/* ── SectionTag (small labelling tag above section titles) ─────────────── */
export function SectionTag({ children, color = 'cyan', className = '' }) {
  const colors = {
    cyan:   'border-pixel-cyan   text-pixel-cyan   bg-pixel-cyan/10',
    purple: 'border-pixel-violet text-pixel-violet bg-pixel-violet/10',
    coral:  'border-pixel-coral  text-pixel-coral  bg-pixel-coral/10',
    green:  'border-pixel-gcp    text-pixel-gcp    bg-pixel-gcp/10',
    lav:    'border-pixel-lav    text-pixel-lav    bg-pixel-lav/10',
  }
  return (
    <span className={`font-pixel text-[9px] px-3 py-1.5 border-2 tracking-widest inline-block
      ${colors[color] || colors.cyan} ${className}`}>
      ▸ {children}
    </span>
  )
}

/* ── SectionHeader ─────────────────────────────────────────────────────── */
export function SectionHeader({ tag, tagColor, title, subtitle, dark = true, className = '' }) {
  return (
    <div className={`text-center mb-12 ${className}`}>
      {tag && <SectionTag color={tagColor}>{tag}</SectionTag>}
      <h2 className={`font-pixel text-[14px] sm:text-xl md:text-2xl leading-loose mt-3 mb-3
        ${dark ? 'text-white text-shadow-pixel' : 'text-black'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-mono text-base max-w-xl mx-auto leading-relaxed
          ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ── PixelDivider ──────────────────────────────────────────────────────── */
export default function PixelDivider({ variant = 'teal' }) {
  const cls = {
    teal:   'pixel-divider',
    purple: 'pixel-divider-purple',
    coral:  'pixel-divider-coral',
  }
  return <div className={cls[variant] || cls.teal} />
}
