'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KillRecorder } from '@/components/simulation/kill-recorder';
import { KillFeed } from '@/components/simulation/kill-feed';
import { Scoreboard } from '@/components/simulation/scoreboard';
import { PlayerStatsTable } from '@/components/simulation/player-stats-table';
import { TeamAssignment } from '@/components/game/team-assignment';
import { ArcadeMode } from '@/components/simulation/arcade-mode';
import { Gamepad2, FileText } from 'lucide-react';

interface GamePageProps {
  params: Promise<{ id: string }>;
}

type PlayMode = 'form' | 'arcade';

export default function GamePage({ params }: GamePageProps) {
  const { id: gameId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [playMode, setPlayMode] = useState<PlayMode>('form');

  const { data: game, isLoading } = useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/games/${gameId}`);
      return res.json();
    },
    refetchInterval: 3000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['gameEvents', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/games/${gameId}/events`);
      return res.json();
    },
    refetchInterval: 2000,
  });

  const { data: weapons = [] } = useQuery({
    queryKey: ['weapons'],
    queryFn: async () => {
      const res = await fetch('/api/weapons');
      return res.json();
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      return res.json();
    },
  });

  const recordKillMutation = useMutation({
    mutationFn: async (data: {
      killerId: string;
      victimId: string;
      weaponId: string;
      isHeadshot: boolean;
      isMelee: boolean;
      isAssassination: boolean;
      isGrenade: boolean;
    }) => {
      const res = await fetch(`/api/games/${gameId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
      queryClient.invalidateQueries({ queryKey: ['gameEvents', gameId] });
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });

  const endGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      return res.json();
    },
    onSuccess: () => {
      router.push(`/games/${gameId}/summary`);
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string | null }) => {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_player', userId, teamId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game', gameId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading game...</div>
      </div>
    );
  }

  if (!game || game.error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error: {game?.error || 'Game not found'}</div>
      </div>
    );
  }

  const isTeamBased = game.gameType?.isTeamBased ?? true;

  const players = (game.players || []).map((gp: any) => ({
    id: gp.user?.id || gp.userId,
    gamertag: gp.user?.gamertag || 'Unknown',
    teamName: gp.team?.name,
    teamColor: gp.team?.color,
    teamId: gp.teamId,
  }));

  const teamScores = (game.teamScores || []).map((ts: any) => ({
    teamId: ts.teamId,
    teamName: ts.teamName || teams.find((t: any) => t.id === ts.teamId)?.name || 'Unknown',
    teamColor: ts.teamColor || teams.find((t: any) => t.id === ts.teamId)?.color || '#fff',
    score: ts.score,
  }));

  const playerStats = (game.playerStats || []).map((ps: any) => {
    const player = players.find((p: any) => p.id === ps.userId);
    return {
      id: ps.userId,
      gamertag: ps.gamertag || player?.gamertag || 'Unknown',
      kills: ps.kills,
      deaths: ps.deaths,
      headshots: ps.headshots,
      teamColor: player?.teamColor,
    };
  });

  // For FFA scoreboard, create player scores from playerStats
  const playerScores = playerStats.map((ps: any) => {
    const player = players.find((p: any) => p.gamertag === ps.gamertag);
    return {
      id: player?.id || ps.id,
      gamertag: ps.gamertag,
      color: player?.teamColor || ps.teamColor || '#06B6D4',
      kills: ps.kills,
      deaths: ps.deaths,
    };
  });

  const assignedPlayers = (game.players || []).map((gp: any) => ({
    userId: gp.userId,
    teamId: gp.teamId,
  }));

  const handleAssignPlayer = async (userId: string, teamId: string | null) => {
    await addPlayerMutation.mutateAsync({ userId, teamId });
  };

  const handleRemovePlayer = () => {
    // Not implemented - would need API support
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-orange-500">{game.map?.name}</h1>
            <Badge
              variant="outline"
              className={
                game.status === 'in_progress'
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  : game.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                  : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50'
              }
            >
              {game.status?.replace('_', ' ')}
            </Badge>
            {!isTeamBased && (
              <Badge variant="secondary" className="text-cyan-400">
                FFA
              </Badge>
            )}
          </div>
          <p className="text-zinc-500">{game.gameType?.name}</p>
        </div>
        <div className="flex gap-2">
          {game.status === 'setup' && (
            <Button
              onClick={() => startGameMutation.mutate()}
              disabled={players.length < 2 || startGameMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Game
            </Button>
          )}
          {game.status === 'in_progress' && (
            <Button
              onClick={() => endGameMutation.mutate()}
              disabled={endGameMutation.isPending}
              variant="destructive"
            >
              End Game
            </Button>
          )}
          {game.status === 'completed' && (
            <Button
              onClick={() => router.push(`/games/${gameId}/summary`)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              View Summary
            </Button>
          )}
        </div>
      </div>

      {game.status === 'setup' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {isTeamBased ? 'Add Players to Teams' : 'Add Players'}
              {!isTeamBased && (
                <Badge variant="secondary" className="text-cyan-400">
                  Free For All
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamAssignment
              users={users}
              teams={teams}
              assignedPlayers={assignedPlayers}
              onAssign={handleAssignPlayer}
              onRemove={handleRemovePlayer}
              isTeamBased={isTeamBased}
            />
          </CardContent>
        </Card>
      )}

      {game.status === 'in_progress' && (
        <>
          {/* Mode toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={playMode === 'form' ? 'default' : 'outline'}
              onClick={() => setPlayMode('form')}
              className={playMode === 'form' ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Form Mode
            </Button>
            <Button
              variant={playMode === 'arcade' ? 'default' : 'outline'}
              onClick={() => setPlayMode('arcade')}
              className={playMode === 'arcade' ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Play Mode
            </Button>
          </div>

          {playMode === 'arcade' ? (
            /* Arcade Mode */
            <ArcadeMode
              players={players}
              weapons={weapons}
              teamScores={teamScores}
              playerStats={playerStats}
              scoreToWin={game.gameType?.scoreToWin || 50}
              isTeamBased={isTeamBased}
              onRecordKill={(data) => recordKillMutation.mutate(data)}
              isSubmitting={recordKillMutation.isPending}
            />
          ) : (
            /* Form Mode */
            <>
              {/* Scoreboard - handles both team and FFA */}
              <Scoreboard
                teamScores={isTeamBased ? teamScores : undefined}
                playerScores={!isTeamBased ? playerScores : undefined}
                scoreToWin={game.gameType?.scoreToWin}
                isTeamBased={isTeamBased}
              />

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {players.length > 0 && weapons.length > 0 ? (
                    <KillRecorder
                      players={players}
                      weapons={weapons}
                      onRecordKill={(data) => recordKillMutation.mutate(data)}
                      isSubmitting={recordKillMutation.isPending}
                    />
                  ) : (
                    <Card className="bg-zinc-900/50 border-zinc-800">
                      <CardContent className="py-8 text-center text-zinc-500">
                        Loading game data...
                      </CardContent>
                    </Card>
                  )}
                  <KillFeed events={events} />
                </div>

                <div>
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-orange-500">Player Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PlayerStatsTable stats={playerStats} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {game.status === 'completed' && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-2xl font-bold mb-4">Game Completed!</p>
            {isTeamBased && game.winningTeam ? (
              <p
                className="text-xl"
                style={{ color: game.winningTeam.color }}
              >
                {game.winningTeam.name} wins!
              </p>
            ) : !isTeamBased && playerStats.length > 0 ? (
              <p className="text-xl text-cyan-400">
                {[...playerStats].sort((a: any, b: any) => b.kills - a.kills)[0]?.gamertag} wins!
              </p>
            ) : null}
            <Button
              onClick={() => router.push(`/games/${gameId}/summary`)}
              className="mt-6 bg-orange-600 hover:bg-orange-700"
            >
              View Full Summary
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
