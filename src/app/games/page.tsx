'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Game {
  id: string;
  status: string;
  map_name: string;
  game_type_name: string;
  winning_team_name: string | null;
  winning_team_color: string | null;
  player_count: number;
  created_at: string;
}

export default function GamesPage() {
  const { data: games = [], isLoading } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: async () => {
      const res = await fetch('/api/games');
      return res.json();
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-500">Games</h1>
        <Link href="/games/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Create New Game
          </Button>
        </Link>
      </div>

      {games.length === 0 ? (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500 mb-4">No games yet. Create your first game!</p>
            <Link href="/games/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Create Game
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/80 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg flex items-center justify-center text-2xl font-bold text-zinc-500">
                        {game.map_name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{game.map_name}</h3>
                        <p className="text-sm text-zinc-500">
                          {game.game_type_name} - {game.player_count} players
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(game.status)}>
                        {game.status.replace('_', ' ')}
                      </Badge>
                      {game.winning_team_name && (
                        <p
                          className="text-sm font-medium mt-1"
                          style={{ color: game.winning_team_color || '#fff' }}
                        >
                          {game.winning_team_name} won
                        </p>
                      )}
                      <p className="text-xs text-zinc-500 mt-1">
                        {formatDate(game.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
