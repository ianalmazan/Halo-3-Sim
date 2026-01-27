'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

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

interface RecentGamesProps {
  games: Game[];
}

export function RecentGames({ games }: RecentGamesProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-orange-500">Recent Games</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {games.length === 0 ? (
            <p className="text-sm text-zinc-500">No games played yet</p>
          ) : (
            games.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{game.map_name}</div>
                    <div className="text-sm text-zinc-500">
                      {game.game_type_name} - {game.player_count} players
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={getStatusColor(game.status)}
                    >
                      {game.status.replace('_', ' ')}
                    </Badge>
                    {game.winning_team_name && (
                      <div
                        className="text-sm mt-1 font-medium"
                        style={{ color: game.winning_team_color || '#fff' }}
                      >
                        {game.winning_team_name} won
                      </div>
                    )}
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatDate(game.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
