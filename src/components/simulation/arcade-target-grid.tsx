'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Crosshair } from 'lucide-react';

interface Player {
  id: string;
  gamertag: string;
  teamColor?: string;
}

interface ArcadeTargetGridProps {
  players: Player[];
  currentPlayerId: string;
  onTargetClick: (victimId: string) => void;
  isSubmitting: boolean;
  lastKilledId?: string;
}

export function ArcadeTargetGrid({
  players,
  currentPlayerId,
  onTargetClick,
  isSubmitting,
  lastKilledId,
}: ArcadeTargetGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter out the current player
  const targets = players.filter((p) => p.id !== currentPlayerId);

  return (
    <div className="relative">
      {/* Label */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-cyan-400/60 font-mono text-xs">[</span>
        <span className="text-cyan-400 font-mono text-xs tracking-wider">TARGET ACQUISITION</span>
        <span className="text-cyan-400/60 font-mono text-xs">]</span>
      </div>

      {/* Crosshair center decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border border-cyan-500/20 rounded-full" />
          <div className="absolute inset-2 border border-cyan-500/30 rounded-full" />
          <div className="absolute top-1/2 left-0 w-3 h-[1px] bg-cyan-500/40" />
          <div className="absolute top-1/2 right-0 w-3 h-[1px] bg-cyan-500/40" />
          <div className="absolute left-1/2 top-0 h-3 w-[1px] bg-cyan-500/40" />
          <div className="absolute left-1/2 bottom-0 h-3 w-[1px] bg-cyan-500/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-500/60" />
          </div>
        </div>
      </div>

      {/* Target grid */}
      <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 min-h-[300px]">
        <div className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none" />

        {targets.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-sm">
            NO TARGETS AVAILABLE
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-20">
            {targets.map((target) => {
              const isHovered = hoveredId === target.id;
              const wasJustKilled = lastKilledId === target.id;
              const color = target.teamColor || '#DC2626';

              return (
                <button
                  key={target.id}
                  onClick={() => onTargetClick(target.id)}
                  onMouseEnter={() => setHoveredId(target.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  disabled={isSubmitting}
                  className={cn(
                    'relative group p-4 rounded-lg transition-all duration-200',
                    'border-2 hover:scale-105 active:scale-95',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isHovered ? 'bg-opacity-30' : 'bg-black/60',
                    wasJustKilled && 'animate-pulse'
                  )}
                  style={{
                    borderColor: isHovered ? color : `${color}50`,
                    backgroundColor: isHovered ? `${color}20` : undefined,
                    boxShadow: isHovered ? `0 0 20px ${color}40` : undefined,
                  }}
                >
                  {/* Target indicator */}
                  <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Crosshair className="w-4 h-4 text-red-500" />
                  </div>

                  {/* Player color indicator */}
                  <div className="flex items-center justify-center mb-2">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full border-2 transition-all',
                        isHovered && 'scale-110'
                      )}
                      style={{
                        backgroundColor: color,
                        borderColor: isHovered ? 'white' : `${color}80`,
                        boxShadow: isHovered ? `0 0 10px ${color}` : undefined,
                      }}
                    />
                  </div>

                  {/* Gamertag */}
                  <div className="text-center">
                    <div
                      className="font-mono text-sm font-medium truncate"
                      style={{ color: isHovered ? 'white' : color }}
                    >
                      {target.gamertag}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-1">
                      {isHovered ? 'CLICK TO ELIMINATE' : 'HOSTILE'}
                    </div>
                  </div>

                  {/* Scan effect on hover */}
                  {isHovered && (
                    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
                      <div
                        className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"
                        style={{
                          animation: 'targetScan 1s linear infinite',
                        }}
                      />
                    </div>
                  )}

                  {/* Kill flash effect */}
                  {wasJustKilled && (
                    <div className="absolute inset-0 bg-orange-500/30 rounded-lg animate-ping pointer-events-none" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center mt-3 text-xs text-zinc-500 font-mono">
        SELECT TARGET TO REGISTER ELIMINATION
      </div>

      <style jsx>{`
        @keyframes targetScan {
          0% { top: -1px; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
