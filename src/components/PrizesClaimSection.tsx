import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract, useReadContracts, useWriteContract } from 'wagmi';
import { contestAbi } from '@/contracts/abis/Contest';
import { useContest } from '@/hooks/useContest';
import { useLastTx } from '@/contexts/LastTxContext';
import { Link } from 'react-router-dom';

const EXPLORER = 'https://testnet.monadexplorer.com';
const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000' ||
  addr === '0x0000000000000000000000000000000000000001';

function prizeLabel(rank: number, firstPrizeAmount: string | undefined): string {
  if (rank === 1) return firstPrizeAmount ? `${firstPrizeAmount} MON` : '50% of pool';
  if (rank === 2) return '2nd place share';
  if (rank === 3) return '3rd place share';
  return '';
}

export interface PrizesClaimSectionProps {
  contestAddress: `0x${string}`;
  matchLabel?: string;
  matchId?: number;
  /** If true, show as a compact card (e.g. on Prizes page). If false, no extra wrapper. */
  asCard?: boolean;
}

export function PrizesClaimSection({
  contestAddress,
  matchLabel,
  matchId,
  asCard = false,
}: PrizesClaimSectionProps) {
  const { address } = useAccount();
  const { status, firstPrizeAmount } = useContest(contestAddress);
  const { data: leaderboard } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'getLeaderboard',
    query: { enabled: Boolean(contestAddress) && !isZeroAddress(contestAddress) },
  });

  const usersArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[0] : (leaderboard as { users?: unknown[] }).users);
  const pointsArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[1] : (leaderboard as { points?: unknown[] }).points);
  const ranksArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[2] : (leaderboard as { ranks?: unknown[] }).ranks);
  const indicesArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[3] : (leaderboard as { entryIndices?: unknown[] }).entryIndices);

  const hasData = Array.isArray(usersArr) && usersArr.length > 0;
  const rows = hasData && pointsArr && ranksArr
    ? (usersArr as string[]).map((user, i) => ({
        rank: Number(ranksArr[i] ?? 0),
        address: (user || '').toString(),
        entryIndex: indicesArr?.[i] != null ? Number(indicesArr[i]) : i,
      }))
    : [];

  const addrLower = address?.toLowerCase() ?? '';
  const myEntries = address ? rows.filter((r) => (r.address || '').toLowerCase() === addrLower) : [];
  const myWinningEntries = myEntries.filter((r) => r.rank >= 1 && r.rank <= 3);

  const entryContracts = myWinningEntries.map((e) => ({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'entries' as const,
    args: [BigInt(e.entryIndex)] as const,
  }));
  const { data: entryResults } = useReadContracts({
    contracts: entryContracts,
    query: { enabled: entryContracts.length > 0 },
  });

  const claimedByEntryIndex = new Map<number, boolean>();
  if (entryResults) {
    entryResults.forEach((res, i) => {
      if (res.status === 'success' && res.result && myWinningEntries[i]) {
        claimedByEntryIndex.set(myWinningEntries[i].entryIndex, Boolean(res.result[6]));
      }
    });
  }

  const [lastClaimed, setLastClaimed] = useState<{ amount: string; entryIndex: number } | null>(null);
  const {
    writeContract: claimPrize,
    isPending: isClaimPending,
    data: claimTxHash,
    isSuccess: isClaimSuccess,
  } = useWriteContract();

  const isCompleted = status === 'Completed';
  const showWinSuccess = isClaimSuccess && claimTxHash && lastClaimed;
  const { setLastTx } = useLastTx();

  useEffect(() => {
    if (isClaimSuccess && claimTxHash) {
      setLastTx(claimTxHash, 10143);
    }
  }, [isClaimSuccess, claimTxHash, setLastTx]);

  const handleClaim = (entry: { entryIndex: number; rank: number }) => {
    const amount = prizeLabel(entry.rank, firstPrizeAmount);
    setLastClaimed({ amount, entryIndex: entry.entryIndex });
    claimPrize({
      address: contestAddress,
      abi: contestAbi,
      functionName: 'claimPrize',
      args: [BigInt(entry.entryIndex)],
    });
  };

  const content = (
    <>
      {(matchLabel || matchId != null) && (
        <p className="mb-2 text-xs text-slate-500">
          {matchLabel ?? `Match ${matchId}`}
        </p>
      )}
      {showWinSuccess && (
        <div className="mb-4 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4">
          <p className="font-semibold text-emerald-400">You won!</p>
          <p className="mt-1 text-sm text-white">
            {lastClaimed!.amount} has been sent to your wallet.
          </p>
          <a
            href={`${EXPLORER}/tx/${claimTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-sky-400 hover:underline"
          >
            View winning transaction →
          </a>
        </div>
      )}
      {!address ? (
        <p className="text-sm text-slate-400">Connect your wallet to see your winnings and claim.</p>
      ) : myEntries.length === 0 ? (
        <p className="text-sm text-slate-400">
          You have no entries in this contest.{' '}
          {matchId != null && (
            <Link to={`/match/${matchId}/create-team`} className="text-emerald-400 hover:underline">
              Join from Create Team
            </Link>
          )}
        </p>
      ) : myWinningEntries.length === 0 ? (
        <p className="text-sm text-slate-400">
          You have {myEntries.length} {myEntries.length === 1 ? 'entry' : 'entries'}. Top 3 win prizes. Ranks appear after the match is scored.
        </p>
      ) : (
        <>
          <div className="mb-2 rounded bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-400">
            You're a winner! You placed in the top 3. Claim your prize below — it will be sent to your wallet.
          </div>
          <p className="mt-1 text-xs text-slate-400">Claim your prize to receive MON in your wallet.</p>
          <ul className="mt-3 space-y-2">
            {myWinningEntries.map((entry) => {
              const claimed = claimedByEntryIndex.get(entry.entryIndex);
              return (
                <li key={entry.entryIndex} className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-800/60 px-3 py-2">
                  <span className="font-medium text-white">
                    Rank #{entry.rank} · {prizeLabel(entry.rank, firstPrizeAmount)}
                  </span>
                  {!isCompleted ? (
                    <span className="text-sm text-amber-400/90">Claim when contest is completed</span>
                  ) : claimed ? (
                    <span className="text-sm text-emerald-400">Claimed ✓ — check your wallet</span>
                  ) : (
                    <button
                      type="button"
                      disabled={isClaimPending}
                      onClick={() => handleClaim(entry)}
                      className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50"
                    >
                      {isClaimPending ? 'Claiming...' : 'Claim prize'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );

  if (asCard) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
        <h4 className="text-sm font-semibold text-white">Prizes & claim</h4>
        <div className="mt-3">{content}</div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-700 bg-slate-800/40 px-6 py-4">
      <h4 className="text-sm font-semibold text-white">Prizes & claim</h4>
      <div className="mt-2">{content}</div>
    </div>
  );
}
