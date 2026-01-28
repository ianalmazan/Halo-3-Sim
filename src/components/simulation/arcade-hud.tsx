'use client';

import { ReactNode } from 'react';

interface ArcadeHudProps {
  children: ReactNode;
}

export function ArcadeHud({ children }: ArcadeHudProps) {
  return (
    <div className="relative min-h-[600px] bg-gradient-to-b from-[#0a0a0f] via-[#0f1420] to-[#0a0a0f] rounded-lg overflow-hidden">
      {/* Scan line overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.1) 2px, rgba(6, 182, 212, 0.1) 4px)',
          }}
        />
        <div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-scan"
          style={{
            animation: 'scan 4s linear infinite',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-500/60 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-cyan-500/60 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-cyan-500/60 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-cyan-500/60 rounded-br-lg" />

      {/* Inner corner decorations */}
      <div className="absolute top-6 left-6 w-2 h-2 bg-cyan-500/40 rounded-full" />
      <div className="absolute top-6 right-6 w-2 h-2 bg-cyan-500/40 rounded-full" />
      <div className="absolute bottom-6 left-6 w-2 h-2 bg-cyan-500/40 rounded-full" />
      <div className="absolute bottom-6 right-6 w-2 h-2 bg-cyan-500/40 rounded-full" />

      {/* Top status bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-xs text-cyan-400/80 font-mono tracking-wider">COMBAT VISOR ACTIVE</span>
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>

      {/* Content area */}
      <div className="relative z-20 p-8 pt-12">
        {children}
      </div>

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%)',
        }}
      />

      {/* CSS for scan animation */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: -2px;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
