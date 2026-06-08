import React from 'react'

export default function PixelLoader({ message = 'Loading System...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-6 min-h-[250px] ${className}`}>
      {/* 3x3 Animated Pixel Grid Loader */}
      <div className="grid grid-cols-3 gap-2 w-16 h-16 relative">
        <div className="bg-pixel-cyan border-2 border-black shadow-[2px_2px_0_#000] animate-pulse"></div>
        <div className="bg-pixel-coral border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.15s]"></div>
        <div className="bg-pixel-purple border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.3s]"></div>
        <div className="bg-pixel-purple border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.45s]"></div>
        <div className="bg-pixel-cyan border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.6s]"></div>
        <div className="bg-pixel-coral border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.75s]"></div>
        <div className="bg-pixel-coral border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:0.9s]"></div>
        <div className="bg-pixel-purple border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:1.05s]"></div>
        <div className="bg-pixel-cyan border-2 border-black shadow-[2px_2px_0_#000] animate-pulse [animation-delay:1.2s]"></div>
      </div>
      
      {/* Animated Text message */}
      <div className="font-pixel text-[10px] uppercase text-pixel-cyan tracking-wider animate-pulse flex items-center gap-1">
        <span>{message}</span>
        <span className="animate-bounce">.</span>
        <span className="animate-bounce [animation-delay:0.2s]">.</span>
        <span className="animate-bounce [animation-delay:0.4s]">.</span>
      </div>
    </div>
  )
}
