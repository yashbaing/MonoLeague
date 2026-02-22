import type { PlayerPastStats } from '@/api/client';

function selectionScore(stats: PlayerPastStats, poolAvg: number): number {
  const formWeight = 0.6;
  const avgWeight = 0.4;
  const combined = stats.last3Avg * formWeight + stats.avgFantasy * avgWeight;
  if (poolAvg <= 0) return 50;
  const ratio = combined / poolAvg;
  return Math.min(100, Math.round(50 + (ratio - 1) * 50));
}

function predictedPoints(stats: PlayerPastStats): number {
  return Math.round(stats.last3Avg * 0.6 + stats.avgFantasy * 0.4);
}

function labelFromScore(score: number): string {
  return score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Risky';
}

interface MatchPredictionsProps {
  playerStats: PlayerPastStats[];
  matchTitle: string;
}

export function MatchPredictions({ playerStats, matchTitle }: MatchPredictionsProps) {
  const poolAvg =
    playerStats.length > 0
      ? playerStats.reduce((s, p) => s + p.avgFantasy, 0) / playerStats.length
      : 0;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="border-b border-slate-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white">ML-style predictions</h3>
        <p className="mt-1 text-sm text-slate-400">
          {matchTitle} — predicted points & selection score from IPL 2025 past performance
        </p>
      </div>
      <div className="p-6">
        {playerStats.length === 0 ? (
          <p className="text-slate-500">No prediction data for this match.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {playerStats.map((stats) => {
              const score = selectionScore(stats, poolAvg);
              const predicted = predictedPoints(stats);
              const label = labelFromScore(score);
              return (
                <div
                  key={stats.id}
                  className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{stats.name}</p>
                      <p className="text-xs text-slate-500">{stats.role}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        score >= 70
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : score >= 50
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-sm text-slate-500">Predicted pts</span>
                    <span className="text-lg font-bold text-emerald-400">{predicted}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>Avg {stats.avgFantasy} · Last 3: {stats.last3Avg}</span>
                    <span>{score}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
