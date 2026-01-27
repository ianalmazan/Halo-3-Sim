'use client';

import { Card, CardContent } from '@/components/ui/card';

interface TeamScore {
  teamId: string;
  teamName: string;
  teamColor: string;
  score: number;
}

interface ScoreboardProps {
  teamScores: TeamScore[];
  scoreToWin?: number;
}

export function Scoreboard({ teamScores, scoreToWin = 50 }: ScoreboardProps) {
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
