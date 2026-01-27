'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Map {
  id: string;
  name: string;
  description: string | null;
  maxPlayers: number;
}

interface MapSelectorProps {
  maps: Map[];
  selectedMapId: string | null;
  onSelect: (mapId: string) => void;
}

export function MapSelector({ maps, selectedMapId, onSelect }: MapSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {maps.map((map) => (
        <Card
          key={map.id}
          className={cn(
            'cursor-pointer transition-all hover:scale-105',
            selectedMapId === map.id
              ? 'ring-2 ring-orange-500 bg-orange-950/30'
              : 'hover:bg-zinc-800/50'
          )}
          onClick={() => onSelect(map.id)}
        >
          <CardContent className="p-4">
            <div className="aspect-video bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-md mb-2 flex items-center justify-center">
              <span className="text-2xl font-bold text-zinc-500">
                {map.name[0]}
              </span>
            </div>
            <h3 className="font-semibold text-sm">{map.name}</h3>
            <p className="text-xs text-zinc-500">Max {map.maxPlayers} players</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
