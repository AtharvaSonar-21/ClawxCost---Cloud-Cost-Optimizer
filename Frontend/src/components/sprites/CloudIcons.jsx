import React from 'react'

/** AWS pixel sprite */
export function AWSIcon({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4"  y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="8"  y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="12" y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="4"  y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="12" y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="4"  y="12" width="4" height="4" fill="#f97316"/>
      <rect x="8"  y="12" width="4" height="4" fill="#f97316"/>
      <rect x="12" y="12" width="4" height="4" fill="#f97316"/>
      <rect x="20" y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="24" y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="20" y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="24" y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="20" y="12" width="4" height="4" fill="#f97316"/>
      <rect x="24" y="12" width="4" height="4" fill="#f97316"/>
      <rect x="32" y="4"  width="4" height="4" fill="#f97316"/>
      <rect x="32" y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="36" y="8"  width="4" height="4" fill="#f97316"/>
      <rect x="32" y="12" width="4" height="4" fill="#f97316"/>
      <rect x="8"  y="28" width="32" height="8" fill="#f97316" opacity=".6"/>
      <rect x="4"  y="32" width="40" height="8" fill="#f97316" opacity=".8"/>
    </svg>
  )
}

/** Azure pixel sprite */
export function AzureIcon({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4"  y="16" width="8"  height="8"  fill="#3b82f6"/>
      <rect x="12" y="8"  width="8"  height="8"  fill="#3b82f6"/>
      <rect x="20" y="4"  width="8"  height="12" fill="#60a5fa"/>
      <rect x="28" y="8"  width="8"  height="8"  fill="#3b82f6"/>
      <rect x="36" y="16" width="8"  height="8"  fill="#3b82f6"/>
      <rect x="4"  y="24" width="40" height="4"  fill="#93c5fd"/>
      <rect x="8"  y="28" width="32" height="4"  fill="#3b82f6"/>
      <rect x="12" y="32" width="24" height="4"  fill="#1d4ed8"/>
    </svg>
  )
}

/** GCP pixel sprite */
export function GCPIcon({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="16" y="4"  width="16" height="8"  fill="#4ade80"/>
      <rect x="8"  y="12" width="32" height="8"  fill="#4ade80"/>
      <rect x="4"  y="20" width="40" height="8"  fill="#86efac"/>
      <rect x="8"  y="12" width="8"  height="8"  fill="#fbbf24"/>
      <rect x="32" y="12" width="8"  height="8"  fill="#f87171"/>
      <rect x="4"  y="20" width="8"  height="8"  fill="#60a5fa"/>
      <rect x="36" y="20" width="8"  height="8"  fill="#4ade80"/>
      <rect x="16" y="28" width="16" height="4"  fill="#4ade80"/>
    </svg>
  )
}

/** Dollar / money pixel sprite */
export function DollarIcon({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="20" y="4"  width="8"  height="4"  fill="#fef08a"/>
      <rect x="16" y="8"  width="16" height="4"  fill="#fef08a"/>
      <rect x="12" y="12" width="24" height="4"  fill="#fef08a"/>
      <rect x="12" y="16" width="8"  height="4"  fill="#fef08a"/>
      <rect x="16" y="20" width="16" height="4"  fill="#fef08a"/>
      <rect x="20" y="24" width="16" height="4"  fill="#fef08a"/>
      <rect x="24" y="28" width="12" height="4"  fill="#fef08a"/>
      <rect x="12" y="32" width="24" height="4"  fill="#fef08a"/>
      <rect x="20" y="4"  width="4"  height="40" fill="#fef08a" opacity=".4"/>
    </svg>
  )
}

/** Bar-chart pixel sprite */
export function ChartIcon({ className = 'w-12 h-12' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <rect x="4"  y="36" width="8"  height="8"  fill="#c4b5fd"/>
      <rect x="14" y="28" width="8"  height="16" fill="#c4b5fd"/>
      <rect x="24" y="20" width="8"  height="24" fill="#a78bfa"/>
      <rect x="34" y="8"  width="8"  height="36" fill="#f43f5e"/>
      <rect x="4"  y="44" width="40" height="4"  fill="white" fillOpacity=".3"/>
    </svg>
  )
}
