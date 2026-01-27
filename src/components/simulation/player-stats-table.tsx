'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PlayerStat {
  gamertag: string;
  kills: number;
  deaths: number;
  headshots: number;
  teamColor?: string;
}

interface PlayerStatsTableProps {
  stats: PlayerStat[];
}

export function PlayerStatsTable({ stats }: PlayerStatsTableProps) {
  const calculateKD = (kills: number, deaths: number) => {
    if (deaths === 0) return kills.toFixed(2);
    return (kills / deaths).toFixed(2);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400">Player</TableHead>
            <TableHead className="text-zinc-400 text-center">K</TableHead>
            <TableHead className="text-zinc-400 text-center">D</TableHead>
            <TableHead className="text-zinc-400 text-center">K/D</TableHead>
            <TableHead className="text-zinc-400 text-center">HS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500">
                No stats yet
              </TableCell>
            </TableRow>
          ) : (
            stats.map((player, index) => (
              <TableRow
                key={player.gamertag}
                className="border-zinc-800"
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-4">{index + 1}.</span>
                    {player.teamColor && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: player.teamColor }}
                      />
                    )}
                    <span className="font-medium">{player.gamertag}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono text-green-500">
                  {player.kills}
                </TableCell>
                <TableCell className="text-center font-mono text-red-500">
                  {player.deaths}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {calculateKD(player.kills, player.deaths)}
                </TableCell>
                <TableCell className="text-center font-mono text-yellow-500">
                  {player.headshots}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
