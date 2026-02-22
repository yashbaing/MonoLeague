import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { contestAbi } from '@/contracts/abis/Contest';
import { useContest } from '@/hooks/useContest';
import { PrizesClaimSection } from './PrizesClaimSection';

const EXPLORER = 'https://testnet.monadexplorer.com';
const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000' ||
  addr === '0x0000000000000000000000000000000000000001';

function shortenAddress(addr: string) {
  if (!addr) return '0x...';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface LeaderboardProps {
  matchId: number;
  contestAddress: `0x${string}`;
}

export function Leaderboard({ contestAddress, matchId }: LeaderboardProps) {
  const { address } = useAccount();
  const { firstPrizeAmount } = useContest(contestAddress);
  const { data: leaderboard, isLoading, isError, error } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'getLeaderboard',
    query: { enabled: Boolean(contestAddress) && !isZeroAddress(contestAddress) },
  });
  const { data: entryCount } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'getEntryCount',
    query: { enabled: Boolean(contestAddress) && !isZeroAddress(contestAddress) },
  });

  // getLeaderboard can return tuple [users, points, ranks, entryIndices] or object { users, points, ranks, entryIndices }
  const usersArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[0] : (leaderboard as { users?: unknown[] }).users);
  const pointsArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[1] : (leaderboard as { points?: unknown[] }).points);
  const ranksArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[2] : (leaderboard as { ranks?: unknown[] }).ranks);
  const indicesArr = leaderboard && (Array.isArray(leaderboard) ? leaderboard[3] : (leaderboard as { entryIndices?: unknown[] }).entryIndices);

  const hasData = Array.isArray(usersArr) && usersArr.length > 0;
  const rows = hasData && pointsArr && ranksArr
    ? (usersArr as string[]).map((user, i) => ({
        rank: Number(ranksArr[i] ?? 0),
        address: (user || '').toString(),
        points: Number(pointsArr[i] ?? 0),
        entryIndex: indicesArr?.[i] != null ? Number(indicesArr[i]) : i,
      }))
    : [];

  const addrLower = address?.toLowerCase() ?? '';
  const count = entryCount != null ? Number(entryCount) : rows.length;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 overflow-hidden">
      <div className="border-b border-slate-700 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Leaderboard</h3>
            <p className="text-sm text-slate-400">
              {hasData ? `${rows.length} entries · Rankings after match` : 'Rankings after match'}
            </p>
          </div>
          {count > 0 && (
            <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs font-medium text-slate-300">
              {count} {count === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {firstPrizeAmount ? `Prizes: 1st ${firstPrizeAmount} MON · 2nd/3rd: remainder` : 'Prizes: 1st 50% · 2nd 30% · 3rd 20%'}
        </p>
      </div>

      {address && <PrizesClaimSection contestAddress={contestAddress} matchId={matchId} />}

      {isLoading ? (
        <div className="px-6 py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-400">Loading leaderboard...</p>
        </div>
      ) : isError ? (
        <div className="px-6 py-12 text-center">
          <p className="text-amber-400">Could not load leaderboard</p>
          <p className="mt-2 text-sm text-slate-500">Make sure you’re on Monad Testnet and the contest address is correct.</p>
          {error?.message && <p className="mt-1 text-xs text-slate-600">{error.message}</p>}
        </div>
      ) : !hasData ? (
        <div className="px-6 py-12 text-center">
          <p className="text-slate-400">No entries yet</p>
          <p className="mt-1 text-sm text-slate-500">Join the contest to appear here. Scores show after match is scored on-chain.</p>
        </div>
      ) : (
        <>
          <p className="px-6 pt-4 text-xs text-slate-500">
            Top 6 · Wallet addresses and points from chain (updates dynamically)
          </p>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                <th className="px-6 py-3 font-medium">Rank</th>
                <th className="px-6 py-3 font-medium">Wallet</th>
                <th className="px-6 py-3 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 6).map((row, index) => (
                <tr
                  key={`${row.address}-${row.entryIndex ?? index}`}
                  className={`border-b border-slate-800 transition ${
                    (row.address || '').toLowerCase() === addrLower
                      ? 'bg-emerald-500/10'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {row.rank === 1 && <span className="text-xl">🥇</span>}
                    {row.rank === 2 && <span className="text-xl">🥈</span>}
                    {row.rank === 3 && <span className="text-xl">🥉</span>}
                    {row.rank > 3 && row.rank}
                    {row.rank === 0 && <span className="text-slate-500">—</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-slate-300">
                    {typeof row.address === 'string' && row.address.startsWith('0x')
                      ? shortenAddress(row.address)
                      : row.address}
                    {(row.address || '').toLowerCase() === addrLower && (
                      <span className="ml-2 text-xs text-emerald-400">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-emerald-400">{row.points}</span>
                    <span className="ml-1 text-slate-500">pts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 6 && (
            <p className="px-6 py-2 text-xs text-slate-500">
              +{rows.length - 6} more entries below top 6
            </p>
          )}
          <div className="border-t border-slate-700 px-6 py-3">
            <a
              href={`${EXPLORER}/address/${contestAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-emerald-400"
            >
              View contest on explorer →
            </a>
          </div>
        </>
      )}
    </div>
  );
}
