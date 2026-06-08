import React from 'react'
import { Link } from 'react-router-dom'

const sizes = {
  xs: 'text-[12px]',
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl md:text-3xl',
}

export default function BrandLogo({
  to = '/',
  href,
  size = 'md',
  className = '',
  withShadow = true,
}) {
  const logoClass = `inline-flex items-baseline font-pixel tracking-widest text-pixel-cyan ${
    sizes[size] || sizes.md
  } ${withShadow ? '[text-shadow:2px_2px_0_#6b21a8]' : ''} ${className}`.trim()

  const content = (
    <>
      CLAW<span className="text-pixel-coral">X</span>COST
    </>
  )

  if (href) {
    return (
      <a href={href} className={logoClass}>
        {content}
      </a>
    )
  }

  return (
    <Link to={to} className={logoClass}>
      {content}
    </Link>
  )
}
