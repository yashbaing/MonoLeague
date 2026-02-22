import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import type { Player } from '@/data/mockPlayers';
import type { Match } from '@/data/mockMatches';
import { useTeamSubmission } from '@/hooks/useTeamSubmission';
import { useContest } from '@/hooks/useContest';
import { useLastTx } from '@/contexts/LastTxContext';
import { useScorecard } from '@/hooks/useScorecard';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { TeamArena } from '@/components/TeamArena';
import { PlayerPredictionModal } from '@/components/PlayerPredictionModal';
import { UserVsComputer } from '@/components/UserVsComputer';
import { TeamScoreBreakdown } from '@/components/TeamScoreBreakdown';
import { COMPUTER_TEAM_MATCH2 } from '@/data/computerTeam';

const ROLE_ORDER: Player['role'][] = ['WK', 'BAT', 'AR', 'BOWL'];

function parseTxError(msg: string): string {
  if (!msg) return 'Unknown error';
  if (msg.includes('insufficient funds')) return 'Insufficient MON for entry fee and gas. Get testnet MON from faucet.monad.xyz';
  if (msg.includes('user rejected') || msg.includes('User denied')) return 'Transaction was rejected';
  if (msg.includes('wrong network') || msg.includes('Chain')) return 'Switch to Monad Testnet';
  if (msg.includes('Invalid player') || msg.includes('Budget exceeded') || msg.includes('Need at least')) return msg;
  if (msg.includes('execution reverted')) return msg.replace('execution reverted: ', '') || msg;
  return msg.length > 80 ? msg.slice(0, 80) + '...' : msg;
}
const MONAD_CHAIN_ID = 10143;
const EXPLORER = 'https://testnet.monadexplorer.com';

function selectionScore(avgFantasy: number, last3Avg: number, poolAvg: number): number {
  if (poolAvg <= 0) return 50;
  const combined = last3Avg * 0.6 + avgFantasy * 0.4;
  const ratio = combined / poolAvg;
  return Math.min(100, Math.round(50 + (ratio - 1) * 50));
}
function predictionLabel(score: number): string {
  return score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'Risky';
}

interface TeamBuilderProps {
  match: Match;
  players: Player[];
  contestAddress?: `0x${string}`;
  /** True while contest for this match is being resolved (e.g. factory not deployed). */
  isLoadingContest?: boolean;
}

export function TeamBuilder({ match, players, contestAddress, isLoadingContest: isLoadingContestProp }: TeamBuilderProps) {
  const isLoadingContest = isLoadingContestProp ?? contestAddress === undefined;
  const noContestOnTestnet = !isLoadingContest && contestAddress === undefined;
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== MONAD_CHAIN_ID;
  const { entryFeeWei } = useContest(contestAddress);
  const { joinContest, hash, isPending, isSuccess, hasHash, isConfirming, error } =
    useTeamSubmission(contestAddress, entryFeeWei);
  const { setLastTx } = useLastTx();
  const { data: scorecard } = useScorecard(match.id);
  const { data: playerStats } = usePlayerStats(match.id);
  const [localError, setLocalError] = useState<string | null>(null);
  const [predictionModalPlayer, setPredictionModalPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (hash) setLastTx(hash, MONAD_CHAIN_ID);
  }, [hash, setLastTx]);
  const [selected, setSelected] = useState<number[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [viceCaptainId, setViceCaptainId] = useState<number | null>(null);
  const [activeRole, setActiveRole] = useState<Player['role'] | null>(null);

  const budget = 100;
  const usedBudget = selected.reduce(
    (sum, id) => sum + (players.find((p) => p.id === id)?.credit ?? 0),
    0
  );
  const remaining = budget - usedBudget;
  const canAdd = selected.length < 11 && remaining >= 0;

  const togglePlayer = (p: Player) => {
    if (selected.includes(p.id)) {
      setSelected((s) => s.filter((id) => id !== p.id));
      if (captainId === p.id) setCaptainId(null);
      if (viceCaptainId === p.id) setViceCaptainId(null);
    } else if (selected.length < 11 && remaining >= p.credit) {
      setSelected((s) => [...s, p.id]);
    }
  };

  const roleCounts = ROLE_ORDER.reduce((acc, r) => {
    acc[r] = selected.filter(
      (id) => players.find((p) => p.id === id)?.role === r
    ).length;
    return acc;
  }, {} as Record<Player['role'], number>);

  const isValid =
    selected.length === 11 &&
    roleCounts.WK >= 1 &&
    roleCounts.BAT >= 1 &&
    roleCounts.AR >= 1 &&
    roleCounts.BOWL >= 1 &&
    captainId != null &&
    viceCaptainId != null &&
    captainId !== viceCaptainId;

  const selectedPlayers = selected
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const byRole = ROLE_ORDER.reduce((acc, role) => {
    acc[role] = players.filter((p) => p.role === role);
    return acc;
  }, {} as Record<Player['role'], Player[]>);

  return (
    <div className="space-y-8">
      {/* Budget bar */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-slate-400">Budget</span>
          <span
            className={
              remaining < 0 ? 'text-red-400' : 'text-emerald-400'
            }
          >
            {remaining} / 100
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all ${
              remaining < 0 ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, (usedBudget / budget) * 100))}%`,
            }}
          />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {selected.length} / 11 players · 1 WK, 1–8 BAT, 1–8 AR, 1–8 BOWL
        </p>
      </div>

      {/* Team Arena - field view */}
      {selectedPlayers.length > 0 && (
        <TeamArena
          players={selectedPlayers}
          captainId={captainId}
          viceCaptainId={viceCaptainId}
          onRemove={(p) => togglePlayer(p)}
        />
      )}

      {/* Selected team with C/VC */}
      {selectedPlayers.length > 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
          <h3 className="mb-4 font-semibold text-white">Your Team</h3>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2"
              >
                <span className="text-white">{p.name}</span>
                <span className="text-xs text-slate-500">({p.credit})</span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      setCaptainId(captainId === p.id ? null : p.id)
                    }
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      captainId === p.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    C
                  </button>
                  <button
                    onClick={() =>
                      setViceCaptainId(
                        viceCaptainId === p.id ? null : p.id
                      )
                    }
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      viceCaptainId === p.id
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    VC
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player picker by role */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Select Players</h3>
        <div className="flex gap-2">
          {ROLE_ORDER.map((role) => (
            <button
              key={role}
              onClick={() =>
                setActiveRole(activeRole === role ? null : role)
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeRole === role || activeRole === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(activeRole ? byRole[activeRole] : players).map((p) => {
            const isSelected = selected.includes(p.id);
            const disabled =
              !isSelected &&
              (selected.length >= 11 || remaining < p.credit);

            return (
              <div
                key={p.id}
                className={`relative flex items-center justify-between rounded-lg border p-4 text-left transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : disabled
                      ? 'border-slate-800 bg-slate-900/30 text-slate-600'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                <button
                  type="button"
                  onClick={() => togglePlayer(p)}
                  disabled={disabled}
                  className="flex flex-1 items-center justify-between text-left"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">{p.name}</p>
                      {match.id === 2 && playerStats?.length && (() => {
                        const stat = playerStats.find((s) => s.id === p.id);
                        if (!stat) return null;
                        const poolAvg = playerStats.reduce((s, x) => s + x.avgFantasy, 0) / playerStats.length;
                        const score = selectionScore(stat.avgFantasy, stat.last3Avg, poolAvg);
                        const label = predictionLabel(score);
                        return (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              score >= 70 ? 'bg-emerald-500/25 text-emerald-400' : score >= 50 ? 'bg-amber-500/25 text-amber-400' : 'bg-red-500/25 text-red-400'
                            }`}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-slate-500">
                      {p.role} · {p.credit} cr
                    </p>
                  </div>
                  {isSelected && (
                    <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">
                      Selected
                    </span>
                  )}
                </button>
                {match.id === 2 && playerStats?.length && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPredictionModalPlayer(p);
                    }}
                    className="ml-2 rounded p-1.5 text-slate-500 hover:bg-slate-700 hover:text-emerald-400"
                    title="View prediction & past performance"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {predictionModalPlayer && (
          <PlayerPredictionModal
            player={predictionModalPlayer}
            stats={playerStats?.find((s) => s.id === predictionModalPlayer.id) ?? null}
            allStats={playerStats ?? []}
            onClose={() => setPredictionModalPlayer(null)}
          />
        )}
      </div>

      {/* You vs Computer + both score breakdowns — only after tx success (match 2) */}
      {match.id === 2 && scorecard?.length && isSuccess && (
        <>
          <UserVsComputer
            scorecard={scorecard}
            userTeam={{
              playerIds: selected,
              captainId: captainId ?? 0,
              viceCaptainId: viceCaptainId ?? 0,
            }}
            computerTeam={COMPUTER_TEAM_MATCH2}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TeamScoreBreakdown
              title="Your team"
              scorecard={scorecard}
              playerIds={selected}
              captainId={captainId ?? 0}
              viceCaptainId={viceCaptainId ?? 0}
            />
            <TeamScoreBreakdown
              title="Computer team"
              scorecard={scorecard}
              playerIds={[...COMPUTER_TEAM_MATCH2.playerIds]}
              captainId={COMPUTER_TEAM_MATCH2.captainId}
              viceCaptainId={COMPUTER_TEAM_MATCH2.viceCaptainId}
            />
          </div>
        </>
      )}

      {/* Submit */}
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
        {hasHash && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs">
            {isSuccess ? (
              <>
                <span className="text-white font-medium">Team submitted successfully!</span>
                <a
                  href={`${EXPLORER}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  View tx →
                </a>
                <Link
                  to={`/match/${match.id}/contest/${match.id}`}
                  className="text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Contest & Leaderboard →
                </Link>
              </>
            ) : (
              <>
                <span className="text-white">
                  {isConfirming ? 'Confirming...' : 'Submitted.'}
                </span>
                <a
                  href={`${EXPLORER}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  View on explorer →
                </a>
              </>
            )}
          </div>
        )}
        {(error || localError) && (
          <div className="mb-4 rounded-lg bg-red-500/20 p-3 text-sm text-red-400">
            <p className="font-medium">Transaction failed</p>
            <p className="mt-1">{parseTxError((error?.message ?? localError) ?? '')}</p>
            {isWrongChain && (
              <button
                onClick={() => switchChain?.({ chainId: MONAD_CHAIN_ID })}
                className="mt-2 rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-500"
              >
                Switch to Monad Testnet
              </button>
            )}
          </div>
        )}
        {noContestOnTestnet && (
          <p className="mb-4 rounded-lg bg-amber-500/20 p-3 text-sm text-amber-400">
            No contest on testnet for this match. Run deploy & seed to create contests.
          </p>
        )}
        <p className="mb-4 text-sm text-slate-400">
          {isLoadingContest
            ? 'Loading contest...'
            : noContestOnTestnet
              ? 'Create a contest for this match (deploy & seed) to join.'
              : isPending
              ? 'Check your wallet — confirm the transaction popup.'
              : isValid
                ? 'Team ready. Click Join Contest to pay entry fee and submit.'
                : 'Select 11 players, assign Captain (C) and Vice-Captain (VC).'}
        </p>
        {isWrongChain && !error && (
          <button
            onClick={() => switchChain?.({ chainId: MONAD_CHAIN_ID })}
            className="mb-4 w-full rounded-lg bg-amber-600 px-6 py-3 font-medium text-white transition hover:bg-amber-500"
          >
            Switch to Monad Testnet
          </button>
        )}
        {!isConnected && contestAddress && isValid && (
          <p className="mb-4 text-sm text-amber-400">
            Connect your wallet to join this contest.
          </p>
        )}
        <button
          disabled={
            !isValid ||
            isPending ||
            isLoadingContest ||
            !contestAddress ||
            !isConnected ||
            isWrongChain
          }
          onClick={async () => {
            if (!isValid || captainId == null || viceCaptainId == null || !contestAddress) return;
            setLocalError(null);
            try {
              const txHash = await joinContest(selected, captainId, viceCaptainId);
              if (txHash) setLastTx(txHash, MONAD_CHAIN_ID);
            } catch (err) {
              setLocalError(err instanceof Error ? err.message : String(err));
            }
          }}
          className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Confirm in wallet...' : 'Join Contest (0.001 MON)'}
        </button>
        {isPending && (
          <p className="mt-2 text-center text-xs text-amber-400">
            If no popup appeared, check your wallet extension or mobile app.
          </p>
        )}
      </div>
    </div>
  );
}
