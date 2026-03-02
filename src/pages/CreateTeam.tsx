import { useParams, Link } from 'react-router-dom';
import { mockMatches } from '@/data/mockMatches';
import { mockPlayers } from '@/data/mockPlayers';
import { TeamBuilder } from '@/components/TeamBuilder';
import { usePlayers } from '@/hooks/usePlayers';
import { usePlayersFromApi } from '@/hooks/usePlayersFromApi';
import { useMatches } from '@/hooks/useMatches';
import { useContestForMatch } from '@/hooks/useContestForMatch';

export function CreateTeam() {
  const { matchId } = useParams<{ matchId: string }>();
  const mid = Number(matchId);
  const isLiveIccMatch = mid > 1_000_000;
  const { data: matches } = useMatches();
  const match = matches?.find((m) => m.id === mid) ?? mockMatches.find((m) => m.id === mid);
  const { contestAddress, isLoading: isLoadingContest } = useContestForMatch(mid);
  const { data: playersFromApi } = usePlayersFromApi(mid);
  const fallbackPlayers = isLiveIccMatch ? [] : playersFromApi ?? mockPlayers[mid] ?? mockPlayers[1];
  const players = usePlayers(mid, fallbackPlayers);

  if (!match) {
    return (
      <div>
        <p className="text-slate-400">Match not found</p>
        <Link to="/" className="mt-4 text-emerald-400 hover:underline">
          Back to matches
        </Link>
      </div>
    );
  }

  if (isLiveIccMatch && players.length === 0) {
    return (
      <div>
        <Link to="/" className="text-sm text-slate-400 hover:text-emerald-400">
          &larr; Back to matches
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">
          {match.teamA} vs {match.teamB}
        </h1>
        <p className="mt-1 text-slate-400">{match.venue}</p>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(match.startTime).toLocaleString()}
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-slate-300">
          Squads/players for live ICC matches aren’t available yet in this app. Create-team is enabled only for seeded matches.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/" className="text-sm text-slate-400 hover:text-emerald-400">
          &larr; Back to matches
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">
          {match.teamA} vs {match.teamB}
        </h1>
        <p className="mt-1 text-slate-400">{match.venue}</p>
        <p className="mt-1 text-xs text-slate-500">
          {new Date(match.startTime).toLocaleString()}
        </p>
      </div>
      <TeamBuilder
        match={match}
        players={players}
        contestAddress={contestAddress}
        isLoadingContest={isLoadingContest}
      />
    </div>
  );
}
