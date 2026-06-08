/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Core palette ──────────────────────────────────────────
        pixel: {
          dark:    '#0d0618',
          darker:  '#060310',
          mid:     '#1a0a2e',
          purple:  '#6b21a8',
          violet:  '#7c3aed',
          teal:    '#0891b2',
          cyan:    '#22d3ee',
          coral:   '#f43f5e',
          // pastels (service cards)
          mint:    '#a7f3d0',
          pink:    '#fbcfe8',
          yellow:  '#fef08a',
          blue:    '#bae6fd',
          lav:     '#c4b5fd',
          sage:    '#99f6e4',
          // provider colours
          aws:     '#f97316',
          azure:   '#3b82f6',
          gcp:     '#4ade80',
        },
        cream: '#f5f0e8',
      },
      fontFamily: {
        pixel:  ['"Press Start 2P"', 'monospace'],
        vt:     ['"VT323"', 'monospace'],
        mono:   ['"Share Tech Mono"', 'monospace', 'ui-monospace'],
      },
      boxShadow: {
        // Pixel / retro drop-shadows
        'px':    '4px 4px 0 #000',
        'px-sm': '3px 3px 0 #000',
        'px-lg': '6px 6px 0 #000',
        'px-xl': '8px 8px 0 #000',
        'px-cyan':   '6px 6px 0 #22d3ee',
        'px-purple': '8px 8px 0 #7c3aed',
        'px-coral':  '4px 4px 0 #f43f5e',
        'px-in':     'inset 2px 2px 0 rgba(255,255,255,0.25), 4px 4px 0 #000',
      },
      borderWidth: {
        px: '4px',
      },
      animation: {
        'bob':        'bob 2s ease-in-out infinite',
        'float':      'floatIcon 4s ease-in-out infinite',
        'twinkle':    'twinkle 2s ease-in-out infinite alternate',
        'marquee':    'marqueeScroll 22s linear infinite',
        'badge-bob':  'floatBadge 3s ease-in-out infinite',
        'spike':      'spikePulse 1s ease-in-out infinite alternate',
        'blink':      'blink 1s step-end infinite',
        'reveal':     'reveal 0.4s ease forwards',
      },
      keyframes: {
        bob: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        floatIcon: {
          '0%,100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':     { transform: 'translateY(-12px) rotate(4deg)' },
        },
        twinkle: {
          '0%':   { opacity: '0.2' },
          '100%': { opacity: '1'   },
        },
        marqueeScroll: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        floatBadge: {
          '0%,100%': { transform: 'translateY(0)'   },
          '50%':     { transform: 'translateY(-4px)' },
        },
        spikePulse: {
          '0%':   { opacity: '0.7' },
          '100%': { opacity: '1'   },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
        reveal: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
