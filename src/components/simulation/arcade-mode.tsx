'use client';

import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArcadeHud } from './arcade-hud';
import { ArcadePlayerSelect } from './arcade-player-select';
import { ArcadeWeaponGrid } from './arcade-weapon-grid';
import { ArcadeTargetGrid } from './arcade-target-grid';
import { ArcadeStatsPanel } from './arcade-stats-panel';

interface Player {
  id: string;
  gamertag: string;
  teamName?: string;
  teamColor?: string;
}

interface Weapon {
  id: string;
  name: string;
  category: string;
}

interface TeamScore {
  teamId: string;
  teamName: string;
  teamColor: string;
  score: number;
}

interface PlayerStats {
  gamertag: string;
  kills: number;
  deaths: number;
  headshots: number;
  teamColor?: string;
}

interface ArcadeModeProps {
  players: Player[];
  weapons: Weapon[];
  teamScores: TeamScore[];
  playerStats: PlayerStats[];
  scoreToWin: number;
  isTeamBased: boolean;
  onRecordKill: (data: {
    killerId: string;
    victimId: string;
    weaponId: string;
    isHeadshot: boolean;
    isMelee: boolean;
    isAssassination: boolean;
    isGrenade: boolean;
  }) => void;
  isSubmitting: boolean;
}

export function ArcadeMode({
  players,
  weapons,
  teamScores,
  playerStats,
  scoreToWin,
  isTeamBased,
  onRecordKill,
  isSubmitting,
}: ArcadeModeProps) {
  const [controlledPlayerId, setControlledPlayerId] = useState<string>('');
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('');
  const [isHeadshot, setIsHeadshot] = useState(false);
  const [isMelee, setIsMelee] = useState(false);
  const [isAssassination, setIsAssassination] = useState(false);
  const [isGrenade, setIsGrenade] = useState(false);
  const [lastKilledId, setLastKilledId] = useState<string | undefined>();
  const [showKillConfirm, setShowKillConfirm] = useState(false);

  // Initialize controlled player from localStorage or first player
  useEffect(() => {
    const stored = localStorage.getItem('arcade_controlled_player');
    if (stored && players.find((p) => p.id === stored)) {
      setControlledPlayerId(stored);
    } else if (players.length > 0) {
      setControlledPlayerId(players[0].id);
    }
  }, [players]);

  // Initialize weapon from localStorage or first weapon
  useEffect(() => {
    const stored = localStorage.getItem('arcade_selected_weapon');
    if (stored && weapons.find((w) => w.id === stored)) {
      setSelectedWeaponId(stored);
    } else if (weapons.length > 0) {
      setSelectedWeaponId(weapons[0].id);
    }
  }, [weapons]);

  // Save controlled player to localStorage
  const handlePlayerSelect = (playerId: string) => {
    setControlledPlayerId(playerId);
    localStorage.setItem('arcade_controlled_player', playerId);
  };

  // Save weapon to localStorage
  const handleWeaponSelect = (weaponId: string) => {
    setSelectedWeaponId(weaponId);
    localStorage.setItem('arcade_selected_weapon', weaponId);
  };

  const handleTargetClick = (victimId: string) => {
    if (!controlledPlayerId || !selectedWeaponId || isSubmitting) return;

    onRecordKill({
      killerId: controlledPlayerId,
      victimId,
      weaponId: selectedWeaponId,
      isHeadshot,
      isMelee,
      isAssassination,
      isGrenade,
    });

    // Show kill confirmation
    setLastKilledId(victimId);
    setShowKillConfirm(true);
    setTimeout(() => {
      setLastKilledId(undefined);
      setShowKillConfirm(false);
    }, 1000);

    // Reset modifiers after kill
    setIsHeadshot(false);
    setIsMelee(false);
    setIsAssassination(false);
    setIsGrenade(false);
  };

  const controlledPlayer = players.find((p) => p.id === controlledPlayerId);
  const currentPlayerStats = playerStats.find(
    (ps) => ps.gamertag === controlledPlayer?.gamertag
  ) || { kills: 0, deaths: 0, headshots: 0 };

  const currentTeamId = players.find((p) => p.id === controlledPlayerId)?.teamColor
    ? teamScores.find((t) => t.teamColor === controlledPlayer?.teamColor)?.teamId
    : undefined;

  return (
    <ArcadeHud>
      {/* Kill confirmation flash */}
      {showKillConfirm && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-orange-500/10 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-orange-400 font-mono text-xl font-bold animate-bounce">
              TARGET ELIMINATED
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left panel - Player select & Kill modifiers */}
        <div className="col-span-3 space-y-4">
          <ArcadePlayerSelect
            players={players}
            selectedPlayerId={controlledPlayerId}
            onSelect={handlePlayerSelect}
          />

          {/* Kill modifiers */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyan-400/60 font-mono text-xs">[</span>
              <span className="text-cyan-400 font-mono text-xs tracking-wider">KILL TYPE</span>
              <span className="text-cyan-400/60 font-mono text-xs">]</span>
            </div>
            <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 space-y-3">
              <div className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none" />

              <ModifierCheckbox
                id="arcade-headshot"
                checked={isHeadshot}
                onChange={setIsHeadshot}
                label="Headshot"
                color="#F97316"
              />
              <ModifierCheckbox
                id="arcade-melee"
                checked={isMelee}
                onChange={setIsMelee}
                label="Melee"
                color="#8B5CF6"
              />
              <ModifierCheckbox
                id="arcade-assassination"
                checked={isAssassination}
                onChange={setIsAssassination}
                label="Assassination"
                color="#EF4444"
              />
              <ModifierCheckbox
                id="arcade-grenade"
                checked={isGrenade}
                onChange={setIsGrenade}
                label="Grenade"
                color="#14B8A6"
              />
            </div>
          </div>
        </div>

        {/* Center panel - Target grid */}
        <div className="col-span-6">
          <ArcadeTargetGrid
            players={players}
            currentPlayerId={controlledPlayerId}
            onTargetClick={handleTargetClick}
            isSubmitting={isSubmitting}
            lastKilledId={lastKilledId}
          />
        </div>

        {/* Right panel - Weapons */}
        <div className="col-span-3">
          <ArcadeWeaponGrid
            weapons={weapons}
            selectedWeaponId={selectedWeaponId}
            onSelect={handleWeaponSelect}
          />
        </div>
      </div>

      {/* Bottom panel - Stats */}
      <div className="mt-4">
        <ArcadeStatsPanel
          kills={currentPlayerStats.kills}
          deaths={currentPlayerStats.deaths}
          headshots={currentPlayerStats.headshots}
          teamScores={teamScores}
          scoreToWin={scoreToWin}
          currentTeamId={currentTeamId}
          isTeamBased={isTeamBased}
        />
      </div>
    </ArcadeHud>
  );
}

function ModifierCheckbox({
  id,
  checked,
  onChange,
  label,
  color,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center space-x-2 relative z-10">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(c === true)}
        className="border-zinc-600 data-[state=checked]:border-transparent"
        style={{
          backgroundColor: checked ? color : undefined,
          borderColor: checked ? color : undefined,
        }}
      />
      <Label
        htmlFor={id}
        className="cursor-pointer font-mono text-sm"
        style={{ color: checked ? color : '#a1a1aa' }}
      >
        {label}
      </Label>
      {checked && (
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse ml-auto"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}
