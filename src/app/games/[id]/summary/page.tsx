'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface GameSummaryPageProps {
  params: Promise<{ id: string }>;
}

export default function GameSummaryPage({ params }: GameSummaryPageProps) {
  const { id: gameId } = use(params);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['gameSummary', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/games/${gameId}/summary`);
      return res.json();
    },
  });

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading summary...</div>
      </div>
    );
  }

  const { game, teamScores, scoreboard, achievements, mvp } = summary;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-500 mb-2">Game Complete</h1>
        <p className="text-zinc-400">
          {game?.map?.name} - {game?.gameType?.name}
        </p>
      </div>

      {/* Team Scores */}
      <div className="grid grid-cols-2 gap-4">
        {teamScores?.map((team: any) => (
          <Card
            key={team.teamId}
            className={`overflow-hidden ${
              game?.winningTeamId === team.teamId ? 'ring-2 ring-yellow-500' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${team.teamColor}30 0%, transparent 50%)`,
              borderColor: team.teamColor,
            }}
          >
            <CardContent className="p-6 text-center">
              {game?.winningTeamId === team.teamId && (
                <Badge className="bg-yellow-500 text-black mb-2">Winner</Badge>
              )}
              <div className="flex items-center justify-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: team.teamColor }}
                />
                <span className="text-xl font-semibold">{team.teamName}</span>
              </div>
              <div
                className="text-6xl font-bold"
                style={{ color: team.teamColor }}
              >
                {team.score}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MVP */}
      {mvp && (
        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-yellow-500 uppercase tracking-wider mb-1">
              Most Valuable Player
            </p>
            <p className="text-3xl font-bold text-yellow-400">{mvp.gamertag}</p>
            <p className="text-zinc-400">{mvp.kills} kills</p>
          </CardContent>
        </Card>
      )}

      {/* Scoreboard */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-orange-500">Final Scoreboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Rank</TableHead>
                <TableHead className="text-zinc-400">Player</TableHead>
                <TableHead className="text-zinc-400">Team</TableHead>
                <TableHead className="text-zinc-400 text-center">Kills</TableHead>
                <TableHead className="text-zinc-400 text-center">Deaths</TableHead>
                <TableHead className="text-zinc-400 text-center">K/D</TableHead>
                <TableHead className="text-zinc-400 text-center">Headshots</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoreboard?.map((player: any, index: number) => (
                <TableRow key={player.gamertag} className="border-zinc-800">
                  <TableCell className="font-mono">{index + 1}</TableCell>
                  <TableCell>
                    <span className="font-medium">{player.gamertag}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {player.team_color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: player.team_color }}
                        />
                      )}
                      <span>{player.team_name || 'None'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-green-500">
                    {player.kills}
                  </TableCell>
                  <TableCell className="text-center font-mono text-red-500">
                    {player.deaths}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {player.kd_ratio}
                  </TableCell>
                  <TableCell className="text-center font-mono text-yellow-500">
                    {player.headshots}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-orange-500">Achievements Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {achievements.map((achievement: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-800/50 rounded-lg flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <div>
                    <p className="font-medium text-sm">{achievement.achievementName}</p>
                    <p className="text-xs text-zinc-500">{achievement.gamertag}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Link href="/games/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            New Game
          </Button>
        </Link>
        <Link href="/games">
          <Button variant="outline">
            All Games
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">
            Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
