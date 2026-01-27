'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface KillRecorderProps {
  players: Player[];
  weapons: Weapon[];
  onRecordKill: (data: {
    killerId: string;
    victimId: string;
    weaponId: string;
    isHeadshot: boolean;
    isMelee: boolean;
    isAssassination: boolean;
    isGrenade: boolean;
  }) => void;
  isSubmitting?: boolean;
}

export function KillRecorder({
  players,
  weapons,
  onRecordKill,
  isSubmitting = false,
}: KillRecorderProps) {
  const [killerId, setKillerId] = useState('');
  const [victimId, setVictimId] = useState('');
  const [weaponId, setWeaponId] = useState('');
  const [isHeadshot, setIsHeadshot] = useState(false);
  const [isMelee, setIsMelee] = useState(false);
  const [isAssassination, setIsAssassination] = useState(false);
  const [isGrenade, setIsGrenade] = useState(false);

  const handleSubmit = () => {
    if (!killerId || !victimId || !weaponId) return;
    if (killerId === victimId) return;

    onRecordKill({
      killerId,
      victimId,
      weaponId,
      isHeadshot,
      isMelee,
      isAssassination,
      isGrenade,
    });

    // Reset form (keep weapon selection for convenience)
    setKillerId('');
    setVictimId('');
    setIsHeadshot(false);
    setIsMelee(false);
    setIsAssassination(false);
    setIsGrenade(false);
  };

  const weaponsByCategory = weapons.reduce((acc, weapon) => {
    if (!acc[weapon.category]) acc[weapon.category] = [];
    acc[weapon.category].push(weapon);
    return acc;
  }, {} as Record<string, Weapon[]>);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-orange-500">Record Kill Event</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2 block">Killer</Label>
            <Select value={killerId} onValueChange={setKillerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select killer" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    <div className="flex items-center gap-2">
                      {player.teamColor && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: player.teamColor }}
                        />
                      )}
                      {player.gamertag}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Weapon</Label>
            <Select value={weaponId} onValueChange={setWeaponId}>
              <SelectTrigger>
                <SelectValue placeholder="Select weapon" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(weaponsByCategory).map(([category, categoryWeapons]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase">
                      {category}
                    </div>
                    {categoryWeapons.map((weapon) => (
                      <SelectItem key={weapon.id} value={weapon.id}>
                        {weapon.name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Victim</Label>
            <Select value={victimId} onValueChange={setVictimId}>
              <SelectTrigger>
                <SelectValue placeholder="Select victim" />
              </SelectTrigger>
              <SelectContent>
                {players
                  .filter((p) => p.id !== killerId)
                  .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      <div className="flex items-center gap-2">
                        {player.teamColor && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: player.teamColor }}
                          />
                        )}
                        {player.gamertag}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="headshot"
              checked={isHeadshot}
              onCheckedChange={(checked) => setIsHeadshot(checked === true)}
            />
            <Label htmlFor="headshot" className="cursor-pointer">
              Headshot
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="melee"
              checked={isMelee}
              onCheckedChange={(checked) => setIsMelee(checked === true)}
            />
            <Label htmlFor="melee" className="cursor-pointer">
              Melee
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="assassination"
              checked={isAssassination}
              onCheckedChange={(checked) => setIsAssassination(checked === true)}
            />
            <Label htmlFor="assassination" className="cursor-pointer">
              Assassination
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="grenade"
              checked={isGrenade}
              onCheckedChange={(checked) => setIsGrenade(checked === true)}
            />
            <Label htmlFor="grenade" className="cursor-pointer">
              Grenade
            </Label>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!killerId || !victimId || !weaponId || killerId === victimId || isSubmitting}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isSubmitting ? 'Recording...' : 'Record Kill'}
        </Button>
      </CardContent>
    </Card>
  );
}
