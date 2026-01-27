'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface KillEvent {
  id: string;
  killer_gamertag: string;
  killer_team_color: string | null;
  victim_gamertag: string;
  victim_team_color: string | null;
  weapon_name: string;
  is_headshot: boolean;
  is_melee: boolean;
  is_assassination: boolean;
  is_grenade: boolean;
  created_at: string;
}

interface KillFeedProps {
  events: KillEvent[];
}

export function KillFeed({ events }: KillFeedProps) {
  const getKillBadges = (event: KillEvent) => {
    const badges = [];
    if (event.is_headshot) badges.push('Headshot');
    if (event.is_assassination) badges.push('Assassination');
    if (event.is_melee) badges.push('Melee');
    if (event.is_grenade) badges.push('Grenade');
    return badges;
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
      <div className="p-3 border-b border-zinc-800">
        <h3 className="font-semibold text-orange-500">Kill Feed</h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="p-2 space-y-1">
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500 p-2 text-center">
              No kills yet. Record some events!
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded text-sm"
              >
                <span
                  className="font-medium"
                  style={{ color: event.killer_team_color || '#fff' }}
                >
                  {event.killer_gamertag}
                </span>
                <span className="text-zinc-500">[{event.weapon_name}]</span>
                <span
                  className="font-medium"
                  style={{ color: event.victim_team_color || '#fff' }}
                >
                  {event.victim_gamertag}
                </span>
                {getKillBadges(event).map((badge) => (
                  <Badge
                    key={badge}
                    variant="outline"
                    className="text-xs text-yellow-500 border-yellow-500/50"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
