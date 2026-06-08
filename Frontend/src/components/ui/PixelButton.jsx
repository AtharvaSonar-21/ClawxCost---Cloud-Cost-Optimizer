import React from 'react'
import { Link } from 'react-router-dom'

const variants = {
  teal: 'bg-pixel-cyan text-black border-black shadow-px hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
  coral:
    'bg-pixel-coral text-white border-black shadow-px hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
  purple:
    'bg-pixel-violet text-white border-black shadow-px hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
  outline:
    'bg-transparent text-pixel-cyan border-pixel-cyan shadow-[3px_3px_0_#22d3ee] hover:bg-pixel-cyan hover:text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
  dark: 'bg-pixel-mid text-white border-black shadow-px hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none',
}

const sizes = {
  sm: 'text-[8px] py-2 px-3',
  md: 'text-[9px] py-[10px] px-4',
  lg: 'text-[11px] py-4 px-6',
}

export default function PixelButton({ variant = 'teal', size = 'md', className = '', href, children, ...rest }) {
  const base =
    'font-pixel uppercase tracking-wide border-[3px] transition-all duration-100 inline-block cursor-pointer'
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (!href) {
    return (
      <button className={cls} {...rest}>
        {children}
      </button>
    )
  }

  const isInternalRoute = /^\/(?!\/)/.test(href)
  if (isInternalRoute) {
    return (
      <Link to={href} className={cls} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} className={cls} {...rest}>
      {children}
    </a>
  )
}
