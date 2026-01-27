'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeaponChart } from '@/components/dashboard/weapon-chart';
import { RecentGames } from '@/components/dashboard/recent-games';
import { AchievementGrid } from '@/components/dashboard/achievement-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });

  const { data: playerStats } = useQuery({
    queryKey: ['playerStats', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const res = await fetch(`/api/users/${selectedUserId}/stats`);
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const { data: games = [] } = useQuery({
    queryKey: ['recentGames'],
    queryFn: async () => {
      const res = await fetch('/api/games');
      return res.json();
    },
  });

  const profile = playerStats?.profile;
  const weaponStats = playerStats?.weaponStats || [];
  const achievements = playerStats?.achievements || [];

  const calculateKD = (kills: number, deaths: number) => {
    if (deaths === 0) return kills.toFixed(2);
    return (kills / deaths).toFixed(2);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Dashboard</h1>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user: any) => (
              <SelectItem key={user.id} value={user.id}>
                {user.gamertag} [{user.serviceTag}]
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedUserId ? (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">Select a player to view their stats</p>
          </CardContent>
        </Card>
      ) : profile ? (
        <>
          {/* Player Header */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center text-3xl font-bold">
                  {profile.gamertag?.[0] || '?'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile.gamertag}</h2>
                  <p className="text-zinc-500">Service Tag: {profile.service_tag}</p>
                  <p className="text-sm text-zinc-400">
                    Member since {new Date(profile.member_since).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="K/D Ratio"
              value={calculateKD(profile.total_kills || 0, profile.total_deaths || 0)}
              subtitle={`${profile.total_kills || 0} kills / ${profile.total_deaths || 0} deaths`}
            />
            <StatCard
              title="Win Rate"
              value={`${profile.win_percentage || 0}%`}
              subtitle={`${profile.games_won || 0} wins / ${profile.total_games || 0} games`}
            />
            <StatCard
              title="Headshots"
              value={profile.total_headshots || 0}
            />
            <StatCard
              title="Best Streak"
              value={profile.highest_kill_streak || 0}
              subtitle="kills without dying"
            />
          </div>

          {/* Charts and Lists */}
          <div className="grid lg:grid-cols-2 gap-6">
            <WeaponChart stats={weaponStats} />
            <AchievementGrid achievements={achievements} />
          </div>

          {/* Player Game History */}
          {playerStats?.gameHistory && playerStats.gameHistory.length > 0 && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-orange-500">Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {playerStats.gameHistory.slice(0, 5).map((game: any) => (
                    <Link
                      key={game.game_id}
                      href={`/games/${game.game_id}`}
                      className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {game.team_color && (
                            <div
                              className="w-3 h-3 rounded-full"
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
                        <div className="flex items-center gap-4">
                          <span className={game.won ? 'text-green-500' : 'text-red-500'}>
                            {game.won ? 'Victory' : 'Defeat'}
                          </span>
                          <div className="text-sm">
                            <span className="text-green-500">{game.kills}</span>
                            <span className="text-zinc-500"> / </span>
                            <span className="text-red-500">{game.deaths}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">Loading player stats...</p>
          </CardContent>
        </Card>
      )}

      {/* Recent Games (Global) */}
      <RecentGames games={games.slice(0, 10)} />
    </div>
  );
}
