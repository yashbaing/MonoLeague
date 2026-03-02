import { Link } from 'react-router-dom';
import { useMatches } from '@/hooks/useMatches';
import { getMatchStatus, hasMlPredictions, type MatchStatus } from '@/utils/matchStatus';
import type { Match } from '@/data/mockMatches';

function MatchCard({ match }: { match: Match }) {
  const status = getMatchStatus(match);
  const showMl = hasMlPredictions(match.id);

  return (
    <div
      className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 transition hover:border-emerald-500/50 hover:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-medium text-white">
              {match.teamA} vs {match.teamB}
            </p>
            <StatusBadge status={status} />
            {showMl && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400">
                ML Prediction
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">{match.venue}</p>
          <p className="mt-1 text-xs text-slate-500">
            {new Date(match.startTime).toLocaleString()} ·{' '}
            <span className="capitalize">{match.sport}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
  );
}

function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        Live
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-400">
        Upcoming
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-600/30 px-2 py-0.5 text-xs font-medium text-slate-500">
      Past
    </span>
  );
}

function MatchSection({ title, matches }: { title: string; matches: Match[] }) {
  if (matches.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

export function MatchList() {
  const { data: matches = [] } = useMatches();

  const live = matches.filter((m) => getMatchStatus(m) === 'live');
  const upcoming = matches.filter((m) => getMatchStatus(m) === 'upcoming');
  const past = matches.filter((m) => getMatchStatus(m) === 'past');

  return (
    <div className="space-y-8">
      <MatchSection title="Live" matches={live} />
      <MatchSection title="Upcoming" matches={upcoming} />
      <MatchSection title="Past" matches={past} />
      {matches.length === 0 && (
        <p className="text-slate-500">No matches at the moment.</p>
      )}
    </div>
  );
}
