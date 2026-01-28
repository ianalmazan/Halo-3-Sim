'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Player {
  id: string;
  gamertag: string;
  teamColor?: string;
}

interface ArcadePlayerSelectProps {
  players: Player[];
  selectedPlayerId: string;
  onSelect: (playerId: string) => void;
  label?: string;
}

export function ArcadePlayerSelect({
  players,
  selectedPlayerId,
  onSelect,
  label = 'CONTROLLED SPARTAN',
}: ArcadePlayerSelectProps) {
  const selectedPlayer = players.find((p) => p.id === selectedPlayerId);

  return (
    <div className="relative">
      {/* Label with bracket decoration */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cyan-400/60 font-mono text-xs">[</span>
        <span className="text-cyan-400 font-mono text-xs tracking-wider">{label}</span>
        <span className="text-cyan-400/60 font-mono text-xs">]</span>
      </div>

      {/* Panel background */}
      <div className="relative bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-cyan-500/5 rounded-lg" />

        <Select value={selectedPlayerId} onValueChange={onSelect}>
          <SelectTrigger className="bg-transparent border-none text-white focus:ring-cyan-500/50">
            <SelectValue placeholder="Select your Spartan">
              {selectedPlayer && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white/30"
                    style={{ backgroundColor: selectedPlayer.teamColor || '#06B6D4' }}
                  />
                  <span className="font-mono">{selectedPlayer.gamertag}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-900/95 border-cyan-500/30">
            {players.map((player) => (
              <SelectItem
                key={player.id}
                value={player.id}
                className="focus:bg-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: player.teamColor || '#06B6D4' }}
                  />
                  <span className="font-mono">{player.gamertag}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status indicator */}
        {selectedPlayer && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400/80 font-mono">ACTIVE</span>
          </div>
        )}
      </div>
    </div>
  );
}
