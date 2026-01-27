'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapSelector } from '@/components/game/map-selector';
import { TeamAssignment } from '@/components/game/team-assignment';

interface GameMap {
  id: string;
  name: string;
  description: string | null;
  maxPlayers: number;
}

interface GameType {
  id: string;
  name: string;
  description: string | null;
  isTeamBased: boolean;
  scoreToWin: number;
}

interface User {
  id: string;
  gamertag: string;
  serviceTag: string;
}

interface Team {
  id: string;
  name: string;
  color: string;
}

export default function NewGamePage() {
  const router = useRouter();
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedGameTypeId, setSelectedGameTypeId] = useState<string>('');
  const [assignedPlayers, setAssignedPlayers] = useState<
    { userId: string; teamId: string }[]
  >([]);
  const [createdGameId, setCreatedGameId] = useState<string | null>(null);

  const { data: maps = [] } = useQuery<GameMap[]>({
    queryKey: ['maps'],
    queryFn: async () => {
      const res = await fetch('/api/maps');
      return res.json();
    },
  });

  const { data: gameTypes = [] } = useQuery<GameType[]>({
    queryKey: ['gameTypes'],
    queryFn: async () => {
      const res = await fetch('/api/game-types');
      return res.json();
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      return res.json();
    },
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch('/api/teams');
      return res.json();
    },
  });

  const createGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: selectedMapId,
          gameTypeId: selectedGameTypeId,
        }),
      });
      return res.json();
    },
    onSuccess: (game) => {
      setCreatedGameId(game.id);
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async ({ userId, teamId }: { userId: string; teamId: string }) => {
      const res = await fetch(`/api/games/${createdGameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_player', userId, teamId }),
      });
      return res.json();
    },
  });

  const startGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/games/${createdGameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      return res.json();
    },
    onSuccess: () => {
      router.push(`/games/${createdGameId}`);
    },
  });

  const handleAssignPlayer = async (userId: string, teamId: string) => {
    if (createdGameId) {
      await addPlayerMutation.mutateAsync({ userId, teamId });
      setAssignedPlayers((prev) => [...prev, { userId, teamId }]);
    }
  };

  const handleRemovePlayer = (userId: string) => {
    setAssignedPlayers((prev) => prev.filter((p) => p.userId !== userId));
  };

  const handleCreateGame = async () => {
    if (selectedMapId && selectedGameTypeId) {
      await createGameMutation.mutateAsync();
    }
  };

  const handleStartGame = async () => {
    if (assignedPlayers.length >= 2) {
      await startGameMutation.mutateAsync();
    }
  };

  const selectedGameType = gameTypes.find((gt) => gt.id === selectedGameTypeId);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-500">Create New Game</h1>

      {!createdGameId ? (
        <>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Game Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedGameTypeId} onValueChange={setSelectedGameTypeId}>
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select game type" />
                </SelectTrigger>
                <SelectContent>
                  {gameTypes.map((gt) => (
                    <SelectItem key={gt.id} value={gt.id}>
                      <div>
                        <span className="font-medium">{gt.name}</span>
                        <span className="text-xs text-zinc-500 ml-2">
                          (Score to win: {gt.scoreToWin})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGameType && (
                <p className="text-sm text-zinc-500 mt-2">
                  {selectedGameType.description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Select Map</CardTitle>
            </CardHeader>
            <CardContent>
              <MapSelector
                maps={maps}
                selectedMapId={selectedMapId}
                onSelect={setSelectedMapId}
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleCreateGame}
            disabled={!selectedMapId || !selectedGameTypeId || createGameMutation.isPending}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {createGameMutation.isPending ? 'Creating...' : 'Create Game & Add Players'}
          </Button>
        </>
      ) : (
        <>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle>Assign Players to Teams</CardTitle>
            </CardHeader>
            <CardContent>
              <TeamAssignment
                users={users}
                teams={teams}
                assignedPlayers={assignedPlayers}
                onAssign={handleAssignPlayer}
                onRemove={handleRemovePlayer}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/games/${createdGameId}`)}
              className="flex-1"
            >
              Continue to Game (Setup Mode)
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={assignedPlayers.length < 2 || startGameMutation.isPending}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {startGameMutation.isPending ? 'Starting...' : 'Start Game'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
