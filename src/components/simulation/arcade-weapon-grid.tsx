'use client';

import { cn } from '@/lib/utils';

interface Weapon {
  id: string;
  name: string;
  category: string;
}

interface ArcadeWeaponGridProps {
  weapons: Weapon[];
  selectedWeaponId: string;
  onSelect: (weaponId: string) => void;
}

const categoryColors: Record<string, string> = {
  primary: '#14B8A6',     // Teal
  secondary: '#8B5CF6',   // Purple
  power: '#F97316',       // Orange
  grenade: '#EF4444',     // Red
};

const categoryOrder = ['primary', 'secondary', 'power', 'grenade'];

export function ArcadeWeaponGrid({
  weapons,
  selectedWeaponId,
  onSelect,
}: ArcadeWeaponGridProps) {
  const weaponsByCategory = weapons.reduce((acc, weapon) => {
    if (!acc[weapon.category]) acc[weapon.category] = [];
    acc[weapon.category].push(weapon);
    return acc;
  }, {} as Record<string, Weapon[]>);

  const selectedWeapon = weapons.find((w) => w.id === selectedWeaponId);

  return (
    <div className="relative">
      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-cyan-400/60 font-mono text-xs">[</span>
        <span className="text-cyan-400 font-mono text-xs tracking-wider">WEAPONS</span>
        <span className="text-cyan-400/60 font-mono text-xs">]</span>
      </div>

      {/* Panel */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3">
        <div className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none" />

        {/* Selected weapon display */}
        {selectedWeapon && (
          <div className="mb-3 p-2 bg-cyan-500/10 border border-cyan-500/30 rounded">
            <div className="text-xs text-cyan-400/60 font-mono mb-1">EQUIPPED</div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColors[selectedWeapon.category] || '#06B6D4' }}
              />
              <span className="text-white font-mono text-sm">{selectedWeapon.name}</span>
            </div>
          </div>
        )}

        {/* Weapon categories */}
        <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
          {categoryOrder.map((category) => {
            const categoryWeapons = weaponsByCategory[category];
            if (!categoryWeapons?.length) return null;

            const color = categoryColors[category] || '#06B6D4';

            return (
              <div key={category}>
                <div
                  className="text-xs font-mono uppercase mb-1.5 flex items-center gap-2"
                  style={{ color: `${color}99` }}
                >
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
                  {category}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoryWeapons.map((weapon) => {
                    const isSelected = weapon.id === selectedWeaponId;
                    return (
                      <button
                        key={weapon.id}
                        onClick={() => onSelect(weapon.id)}
                        className={cn(
                          'relative p-2 text-left text-xs font-mono rounded transition-all',
                          'border hover:border-opacity-100',
                          isSelected
                            ? 'bg-opacity-20 border-opacity-100'
                            : 'bg-black/40 border-opacity-30 hover:bg-opacity-10'
                        )}
                        style={{
                          borderColor: color,
                          backgroundColor: isSelected ? `${color}30` : undefined,
                        }}
                      >
                        <span className={isSelected ? 'text-white' : 'text-zinc-400'}>
                          {weapon.name}
                        </span>
                        {isSelected && (
                          <div
                            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
