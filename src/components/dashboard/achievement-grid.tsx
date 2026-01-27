'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Achievement {
  achievement_name: string;
  description: string;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-orange-500">Achievements</span>
          <span className="text-sm font-normal text-zinc-500">
            {unlockedCount} / {achievements.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {achievements.slice(0, 18).map((achievement) => (
            <div
              key={achievement.achievement_name}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-2xl transition-all',
                achievement.unlocked
                  ? 'bg-gradient-to-br from-orange-600/30 to-orange-900/30 border border-orange-500/50'
                  : 'bg-zinc-800/50 opacity-40'
              )}
              title={`${achievement.achievement_name}: ${achievement.description}`}
            >
              {achievement.unlocked ? '🏆' : '🔒'}
            </div>
          ))}
        </div>
        {achievements.length > 18 && (
          <p className="text-xs text-zinc-500 mt-2 text-center">
            +{achievements.length - 18} more achievements
          </p>
        )}
      </CardContent>
    </Card>
  );
}
