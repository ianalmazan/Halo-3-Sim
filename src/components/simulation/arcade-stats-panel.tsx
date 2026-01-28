'use client';

interface TeamScore {
  teamId: string;
  teamName: string;
  teamColor: string;
  score: number;
}

interface ArcadeStatsPanelProps {
  kills: number;
  deaths: number;
  headshots: number;
  teamScores?: TeamScore[];
  scoreToWin: number;
  currentTeamId?: string;
  isTeamBased?: boolean;
}

export function ArcadeStatsPanel({
  kills,
  deaths,
  headshots,
  teamScores = [],
  scoreToWin,
  currentTeamId,
  isTeamBased = true,
}: ArcadeStatsPanelProps) {
  const kdRatio = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
  const currentTeam = teamScores.find((t) => t.teamId === currentTeamId);
  const leadingTeam = [...teamScores].sort((a, b) => b.score - a.score)[0];
  const leadingScore = isTeamBased
    ? (leadingTeam?.score || 0)
    : kills;
  const progressPercent = Math.min((leadingScore / scoreToWin) * 100, 100);

  return (
    <div className="relative">
      {/* Panel background */}
      <div className="bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
        <div className="absolute inset-0 bg-cyan-500/5 rounded-lg pointer-events-none" />

        <div className="relative z-10">
          {/* Player stats row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatBox label="KILLS" value={kills} color="#14B8A6" />
            <StatBox label="DEATHS" value={deaths} color="#EF4444" />
            <StatBox label="K/D" value={kdRatio} color="#8B5CF6" />
            <StatBox label="HEADSHOTS" value={headshots} color="#F97316" />
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-3" />

          {/* Team scores or progress */}
          {isTeamBased && teamScores.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>TEAM SCORES</span>
                <span>GOAL: {scoreToWin}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {teamScores.slice(0, 2).map((team) => {
                  const isCurrentTeam = team.teamId === currentTeamId;
                  const isLeading = team.teamId === leadingTeam?.teamId;
                  return (
                    <div
                      key={team.teamId}
                      className="relative p-2 rounded border"
                      style={{
                        borderColor: isCurrentTeam ? team.teamColor : `${team.teamColor}50`,
                        backgroundColor: `${team.teamColor}10`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: team.teamColor }}
                          />
                          <span className="text-xs font-mono text-zinc-300">
                            {team.teamName.replace(' Team', '')}
                          </span>
                        </div>
                        <span
                          className="text-lg font-bold font-mono"
                          style={{ color: team.teamColor }}
                        >
                          {team.score}
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(team.score / scoreToWin) * 100}%`,
                            backgroundColor: team.teamColor,
                          }}
                        />
                      </div>
                      {isLeading && team.score > 0 && (
                        <div className="absolute -top-1 -right-1 text-[10px] px-1 py-0.5 bg-yellow-500/20 text-yellow-400 rounded font-mono">
                          LEAD
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>PROGRESS TO VICTORY</span>
                <span>{kills} / {scoreToWin}</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full transition-all duration-300 bg-gradient-to-r from-cyan-600 to-cyan-400"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* Glow effect */}
                <div
                  className="absolute top-0 h-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'linear-gradient(to right, transparent, rgba(6, 182, 212, 0.5))',
                    filter: 'blur(4px)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Status text */}
          <div className="mt-3 text-center">
            <div className="text-xs font-mono text-zinc-500 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>COMBAT STATUS: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div
        className="text-2xl font-bold font-mono transition-all"
        style={{ color, textShadow: `0 0 10px ${color}40` }}
      >
        {value}
      </div>
      <div className="text-[10px] font-mono text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}
