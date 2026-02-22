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
  const { data: matches } = useMatches();
  const match = matches?.find((m) => m.id === mid) ?? mockMatches.find((m) => m.id === mid);
  const { contestAddress, isLoading: isLoadingContest } = useContestForMatch(mid);
  const { data: playersFromApi } = usePlayersFromApi(mid);
  const players = usePlayers(mid, playersFromApi ?? mockPlayers[mid] ?? mockPlayers[1]);

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
