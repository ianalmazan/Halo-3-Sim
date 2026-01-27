'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<'kills' | 'kd' | 'wins'>('kills');

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`);
      return res.json();
    },
  });

  const getRankStyle = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-zinc-300';
    if (index === 2) return 'text-orange-400';
    return 'text-zinc-500';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-orange-500">Leaderboard</h1>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Global Rankings</span>
            <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="kills">Total Kills</TabsTrigger>
                <TabsTrigger value="kd">K/D Ratio</TabsTrigger>
                <TabsTrigger value="wins">Wins</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center text-zinc-500">
              Loading leaderboard...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No players yet. Start playing to appear on the leaderboard!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400 w-16">Rank</TableHead>
                  <TableHead className="text-zinc-400">Player</TableHead>
                  <TableHead className="text-zinc-400 text-center">Kills</TableHead>
                  <TableHead className="text-zinc-400 text-center">Deaths</TableHead>
                  <TableHead className="text-zinc-400 text-center">K/D</TableHead>
                  <TableHead className="text-zinc-400 text-center">Games</TableHead>
                  <TableHead className="text-zinc-400 text-center">Wins</TableHead>
                  <TableHead className="text-zinc-400 text-center">Win %</TableHead>
                  <TableHead className="text-zinc-400 text-center">Headshots</TableHead>
                  <TableHead className="text-zinc-400 text-center">Best Streak</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((player: any, index: number) => (
                  <TableRow key={player.id} className="border-zinc-800">
                    <TableCell className={`font-bold text-lg ${getRankStyle(index)}`}>
                      {getRankIcon(index)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/players/${player.id}`}
                        className="hover:text-orange-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded flex items-center justify-center text-sm font-bold">
                            {player.gamertag?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-medium">{player.gamertag}</div>
                            <div className="text-xs text-zinc-500">{player.service_tag}</div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center font-mono text-green-500">
                      {player.total_kills}
                    </TableCell>
                    <TableCell className="text-center font-mono text-red-500">
                      {player.total_deaths}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {player.kd_ratio}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {player.total_games}
                    </TableCell>
                    <TableCell className="text-center font-mono text-blue-400">
                      {player.games_won}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {player.win_percentage}%
                    </TableCell>
                    <TableCell className="text-center font-mono text-yellow-500">
                      {player.total_headshots}
                    </TableCell>
                    <TableCell className="text-center font-mono text-purple-400">
                      {player.highest_kill_streak}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
