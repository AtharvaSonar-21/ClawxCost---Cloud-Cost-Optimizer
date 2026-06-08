import React from 'react'

/** Pixel-art FinOps robot mascot — pure SVG, no raster images needed */
export default function RobotMascot({ className = 'w-44 h-44' }) {
  return (
    <svg
      className={`animate-bob ${className}`}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Antenna */}
      <rect x="86" y="4"  width="8"  height="4" fill="#22d3ee" />
      <rect x="82" y="8"  width="16" height="4" fill="#22d3ee" />
      <rect x="78" y="12" width="24" height="4" fill="#22d3ee" />
      <rect x="82" y="16" width="16" height="4" fill="white" fillOpacity=".3" />

      {/* Head outer */}
      <rect x="40" y="20" width="100" height="72" fill="#1a0a2e" />
      <rect x="36" y="24" width="108" height="64" fill="#22d3ee" />
      <rect x="40" y="28" width="100" height="60" fill="#0d0618" />
      <rect x="44" y="32" width="92"  height="52" fill="#1a0a2e" />

      {/* Left eye */}
      <rect x="52" y="40" width="28" height="20" fill="#22d3ee" />
      <rect x="56" y="44" width="20" height="12" fill="#0d0618" />
      <rect x="60" y="46" width="8"  height="8"  fill="#22d3ee" />
      <rect x="64" y="44" width="4"  height="4"  fill="white" fillOpacity=".6" />

      {/* Right eye */}
      <rect x="100" y="40" width="28" height="20" fill="#22d3ee" />
      <rect x="104" y="44" width="20" height="12" fill="#0d0618" />
      <rect x="108" y="46" width="8"  height="8"  fill="#22d3ee" />
      <rect x="112" y="44" width="4"  height="4"  fill="white" fillOpacity=".6" />

      {/* Mouth display */}
      <rect x="52" y="68" width="76" height="8" fill="#22d3ee" fillOpacity=".2" />
      <rect x="52" y="68" width="20" height="8" fill="#22d3ee" />
      <rect x="76" y="68" width="4"  height="8" fill="#22d3ee" />
      <rect x="84" y="68" width="8"  height="8" fill="#22d3ee" />
      <rect x="96" y="68" width="12" height="8" fill="#22d3ee" />

      {/* Body outer */}
      <rect x="28"  y="96" width="124" height="72" fill="#1a0a2e" />
      <rect x="32"  y="100" width="116" height="64" fill="#22d3ee" />
      <rect x="36"  y="104" width="108" height="56" fill="#0d0618" />

      {/* Chest display */}
      <rect x="44"  y="108" width="92" height="40" fill="#1a0a2e" />
      <rect x="48"  y="112" width="84" height="32" fill="#000" />

      {/* Chest bar chart */}
      <rect x="52"  y="136" width="8" height="4"  fill="#22d3ee" />
      <rect x="62"  y="132" width="8" height="8"  fill="#22d3ee" />
      <rect x="72"  y="124" width="8" height="16" fill="#22d3ee" />
      <rect x="82"  y="120" width="8" height="20" fill="#f43f5e" />
      <rect x="92"  y="128" width="8" height="12" fill="#22d3ee" />
      <rect x="102" y="116" width="8" height="24" fill="#fef08a" />
      <rect x="112" y="130" width="8" height="10" fill="#22d3ee" />
      <rect x="52"  y="140" width="68" height="2"  fill="#333" />

      {/* Left arm */}
      <rect x="4"   y="100" width="24" height="56" fill="#22d3ee" />
      <rect x="8"   y="104" width="16" height="48" fill="#0891b2" />
      <rect x="0"   y="148" width="12" height="8"  fill="#22d3ee" />

      {/* Right arm */}
      <rect x="152" y="100" width="24" height="56" fill="#22d3ee" />
      <rect x="156" y="104" width="16" height="48" fill="#0891b2" />
      <rect x="168" y="148" width="12" height="8"  fill="#22d3ee" />

      {/* Legs */}
      <rect x="44"  y="168" width="36" height="12" fill="#0891b2" />
      <rect x="100" y="168" width="36" height="12" fill="#0891b2" />
      <rect x="44"  y="176" width="36" height="4"  fill="#22d3ee" fillOpacity=".4" />
      <rect x="100" y="176" width="36" height="4"  fill="#22d3ee" fillOpacity=".4" />
    </svg>
  )
}
