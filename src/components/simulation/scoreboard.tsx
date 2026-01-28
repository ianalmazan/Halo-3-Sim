'use client';

import { Card, CardContent } from '@/components/ui/card';

interface TeamScore {
  teamId: string;
  teamName: string;
  teamColor: string;
  score: number;
}

interface PlayerScore {
  id: string;
  gamertag: string;
  color: string;
  kills: number;
  deaths: number;
}

interface ScoreboardProps {
  teamScores?: TeamScore[];
  playerScores?: PlayerScore[];
  scoreToWin?: number;
  isTeamBased?: boolean;
}

export function Scoreboard({
  teamScores = [],
  playerScores = [],
  scoreToWin = 50,
  isTeamBased = true,
}: ScoreboardProps) {
  // Team-based scoreboard
  if (isTeamBased && teamScores.length > 0) {
    const sortedScores = [...teamScores].sort((a, b) => b.score - a.score);

    return (
      <div className="grid grid-cols-2 gap-4">
        {sortedScores.map((team) => (
          <Card
            key={team.teamId}
            className="overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${team.teamColor}20 0%, transparent 50%)`,
              borderColor: team.teamColor,
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.teamColor }}
                  />
                  <span className="font-semibold">{team.teamName}</span>
                </div>
                <div className="text-right">
                  <div
                    className="text-4xl font-bold"
                    style={{ color: team.teamColor }}
                  >
                    {team.score}
                  </div>
                  <div className="text-xs text-zinc-500">/ {scoreToWin}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min((team.score / scoreToWin) * 100, 100)}%`,
                      backgroundColor: team.teamColor,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // FFA individual player scoreboard
  if (!isTeamBased && playerScores.length > 0) {
    const sortedPlayers = [...playerScores].sort((a, b) => b.kills - a.kills);
    const leadingScore = sortedPlayers[0]?.kills || 0;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>FREE FOR ALL</span>
          <span>First to {scoreToWin} kills</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sortedPlayers.map((player, index) => (
            <Card
              key={player.id}
              className="overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${player.color}25 0%, transparent 60%)`,
                borderColor: index === 0 ? player.color : `${player.color}50`,
                borderWidth: index === 0 ? '2px' : '1px',
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-medium truncate text-sm">{player.gamertag}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: player.color }}
                  >
                    {player.kills}
                  </div>
                  <div className="text-xs text-zinc-500 text-right">
                    <div>D: {player.deaths}</div>
                    <div>K/D: {player.deaths > 0 ? (player.kills / player.deaths).toFixed(1) : player.kills.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.min((player.kills / scoreToWin) * 100, 100)}%`,
                        backgroundColor: player.color,
                      }}
                    />
                  </div>
                </div>
                {index === 0 && leadingScore > 0 && (
                  <div className="absolute top-1 right-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
                      1st
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No scores to display
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="py-8 text-center text-zinc-500">
        Waiting for game data...
      </CardContent>
    </Card>
  );
}
