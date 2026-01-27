'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeaponStat {
  weapon_name: string;
  kills: number;
}

interface WeaponChartProps {
  stats: WeaponStat[];
}

export function WeaponChart({ stats }: WeaponChartProps) {
  const maxKills = Math.max(...stats.map((s) => s.kills), 1);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-orange-500">Weapon Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.length === 0 ? (
            <p className="text-sm text-zinc-500">No weapon data yet</p>
          ) : (
            stats.slice(0, 10).map((stat) => (
              <div key={stat.weapon_name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{stat.weapon_name}</span>
                  <span className="text-zinc-500">{stat.kills} kills</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all"
                    style={{ width: `${(stat.kills / maxKills) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
