import { useParams, Link } from 'react-router-dom';
import { Leaderboard } from '@/components/Leaderboard';
import { ContestCard } from '@/components/ContestCard';
import { MatchScorecard } from '@/components/MatchScorecard';
import { MatchPredictions } from '@/components/MatchPredictions';
import { mockMatches } from '@/data/mockMatches';
import { useMatches } from '@/hooks/useMatches';
import { useContestForMatch } from '@/hooks/useContestForMatch';
import { useScorecard } from '@/hooks/useScorecard';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { resolveContestAddress } from '@/utils/contestAddress';
import { useState } from 'react';

export function ContestDetail() {
  const { matchId, contestId } = useParams<{ matchId: string; contestId: string }>();
  const mid = Number(matchId);
  const { data: matches } = useMatches();
  const match = matches?.find((m) => m.id === mid) ?? mockMatches.find((m) => m.id === mid);
  const { contestAddress: contestForMatchAddress } = useContestForMatch(mid);
  const contestAddress = resolveContestAddress(contestId, contestForMatchAddress);
  const [view, setView] = useState<'contest' | 'leaderboard' | 'scorecard' | 'predictions'>('contest');
  const { data: scorecard } = useScorecard(mid);
  const { data: playerStats, isLoading: playerStatsLoading, isError: playerStatsError } = usePlayerStats(mid);
  const showPredictions = mid === 2;

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

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setView('contest')}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            view === 'contest'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Contest
        </button>
        <button
          onClick={() => setView('leaderboard')}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            view === 'leaderboard'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Leaderboard
        </button>
        {showPredictions && (
          <button
            onClick={() => setView('predictions')}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              view === 'predictions'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Predictions
          </button>
        )}
        <button
          onClick={() => setView('scorecard')}
          className={`rounded-lg px-4 py-2 font-medium transition ${
            view === 'scorecard'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Scorecard
        </button>
      </div>

      {!contestAddress ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <p className="text-slate-400">No contest on testnet for this match.</p>
          <p className="mt-2 text-sm text-slate-500">
            Run <code className="rounded bg-slate-800 px-1">npm run deploy:seed</code> and add contract addresses.
          </p>
        </div>
      ) : (
        <>
          {view === 'contest' && (
            <ContestCard matchId={mid} contestAddress={contestAddress} />
          )}
          {view === 'leaderboard' && (
            <Leaderboard matchId={mid} contestAddress={contestAddress} />
          )}
          {view === 'predictions' && showPredictions && (
            playerStatsError ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
                <p className="text-amber-400">Could not load predictions.</p>
                <p className="mt-2 text-sm text-slate-500">Start the backend: <code className="rounded bg-slate-800 px-1">npm run backend</code> in the project root (port 3001).</p>
              </div>
            ) : playerStats?.length ? (
              <MatchPredictions
                playerStats={playerStats}
                matchTitle={`${match.teamA} vs ${match.teamB}`}
              />
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
                <p className="text-slate-400">{playerStatsLoading ? 'Loading predictions...' : 'No prediction data for this match.'}</p>
                <p className="mt-2 text-sm text-slate-500">Based on IPL 2025 past performance for MI & CSK players.</p>
              </div>
            )
          )}
          {view === 'scorecard' && (
            scorecard?.length ? (
              <MatchScorecard scorecard={scorecard} matchTitle={`${match.teamA} vs ${match.teamB} — Final`} />
            ) : (
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
                <p className="text-slate-400">No scorecard for this match yet.</p>
                <p className="mt-2 text-sm text-slate-500">Scorecard is available for Mumbai Indians vs Chennai Super Kings (match 2).</p>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
