'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeaponChart } from '@/components/dashboard/weapon-chart';

interface PlayerPageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const { id: playerId } = use(params);

  const { data: playerStats, isLoading } = useQuery({
    queryKey: ['playerStats', playerId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${playerId}/stats`);
      return res.json();
    },
  });

  if (isLoading || !playerStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading player profile...</div>
      </div>
    );
  }

  const { profile, weaponStats, gameHistory, achievements } = playerStats;

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Player not found</div>
      </div>
    );
  }

  const calculateKD = (kills: number, deaths: number) => {
    if (deaths === 0) return kills.toFixed(2);
    return (kills / deaths).toFixed(2);
  };

  const unlockedAchievements = achievements?.filter((a: any) => a.unlocked) || [];
  const totalAchievements = achievements?.length || 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Player Header */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center text-4xl font-bold">
              {profile.gamertag?.[0] || '?'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{profile.gamertag}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="text-orange-400 border-orange-400/50">
                  {profile.service_tag}
                </Badge>
                <span className="text-sm text-zinc-500">
                  Member since {new Date(profile.member_since).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Progress
                  value={(unlockedAchievements.length / totalAchievements) * 100}
                  className="flex-1 h-2"
                />
                <span className="text-sm text-zinc-400">
                  {unlockedAchievements.length}/{totalAchievements} achievements
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="K/D Ratio"
          value={calculateKD(profile.total_kills || 0, profile.total_deaths || 0)}
          subtitle={`${profile.total_kills || 0}K / ${profile.total_deaths || 0}D`}
        />
        <StatCard
          title="Win Rate"
          value={`${profile.win_percentage || 0}%`}
          subtitle={`${profile.games_won || 0} of ${profile.total_games || 0} games`}
        />
        <StatCard
          title="Total Headshots"
          value={profile.total_headshots || 0}
        />
        <StatCard
          title="Best Kill Streak"
          value={profile.highest_kill_streak || 0}
        />
      </div>

      {/* Weapon Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        <WeaponChart stats={weaponStats || []} />

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Career Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Total Kills</span>
              <span className="font-bold text-green-500">{profile.total_kills || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Total Deaths</span>
              <span className="font-bold text-red-500">{profile.total_deaths || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Total Assists</span>
              <span className="font-bold text-blue-400">{profile.total_assists || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Games Played</span>
              <span className="font-bold">{profile.total_games || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400">Time Played</span>
              <span className="font-bold">
                {Math.floor((profile.total_playtime_seconds || 0) / 3600)}h{' '}
                {Math.floor(((profile.total_playtime_seconds || 0) % 3600) / 60)}m
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Games */}
      {gameHistory && gameHistory.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Recent Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameHistory.map((game: any) => (
                <Link
                  key={game.game_id}
                  href={`/games/${game.game_id}`}
                  className="block p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {game.team_color && (
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: game.team_color }}
                        />
                      )}
                      <div>
                        <span className="font-medium">{game.map_name}</span>
                        <span className="text-sm text-zinc-500 ml-2">
                          {game.game_type_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge
                        variant="outline"
                        className={
                          game.won
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-red-500/20 text-red-400 border-red-500/50'
                        }
                      >
                        {game.won ? 'Victory' : 'Defeat'}
                      </Badge>
                      <div className="text-right">
                        <div className="font-mono">
                          <span className="text-green-500">{game.kills}</span>
                          <span className="text-zinc-500"> / </span>
                          <span className="text-red-500">{game.deaths}</span>
                        </div>
                        <div className="text-xs text-zinc-500">
                          K/D: {game.kd_ratio}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-orange-500">Achievements</span>
            <span className="text-sm font-normal text-zinc-500">
              {unlockedAchievements.length} / {totalAchievements} unlocked
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievements?.slice(0, 12).map((achievement: any) => (
              <div
                key={achievement.achievement_id}
                className={`p-3 rounded-lg transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-orange-900/30 to-zinc-900 border border-orange-500/30'
                    : 'bg-zinc-800/30 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                        : 'bg-zinc-700'
                    }`}
                  >
                    {achievement.unlocked ? '🏆' : '🔒'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{achievement.achievement_name}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {achievements?.length > 12 && (
            <p className="text-sm text-zinc-500 mt-4 text-center">
              +{achievements.length - 12} more achievements
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Link href="/leaderboard">
          <Button variant="outline">View Leaderboard</Button>
        </Link>
        <Link href="/dashboard">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
