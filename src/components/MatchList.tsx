import { Link } from 'react-router-dom';
import { useMatches } from '@/hooks/useMatches';

export function MatchList() {
  const { data: matches = [] } = useMatches();
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Upcoming Matches</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {matches.map((match) => (
          <div
            key={match.id}
            className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-medium text-white">
                  {match.teamA} vs {match.teamB}
                </p>
                <p className="mt-1 text-sm text-slate-400">{match.venue}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(match.startTime).toLocaleString()} ·{' '}
                  <span className="capitalize">{match.sport}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/match/${match.id}/contest/${match.id}`}
                  className="rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:bg-slate-600"
                >
                  View Contest
                </Link>
                <Link
                  to={`/match/${match.id}/create-team`}
                  className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm text-emerald-400 transition hover:bg-emerald-500/30"
                >
                  Create Team
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
