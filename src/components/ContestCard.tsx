import { useAccount } from 'wagmi';
import { Link } from 'react-router-dom';
import { useContest } from '@/hooks/useContest';

interface ContestCardProps {
  matchId: number;
  contestAddress: `0x${string}`;
}

export function ContestCard({ matchId, contestAddress }: ContestCardProps) {
  const { address, isConnected } = useAccount();
  const {
    entryFee = '0.001',
    prizePool = '0',
    entryCount = 0,
    maxEntries = 10,
    firstPrizeAmount,
    status,
    isLoading,
  } = useContest(contestAddress);

  const spotsLabel =
    maxEntries === 0
      ? `${entryCount} entries (unlimited)`
      : `${entryCount} / ${maxEntries}`;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Join Contest</h3>
      {isLoading ? (
        <p className="text-slate-400">Loading contest...</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Entry Fee</span>
            <span className="text-white">{entryFee} MON</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Prize Pool</span>
            <span className="text-emerald-400">{prizePool} MON</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Spots</span>
            <span className="text-white">{spotsLabel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <span className="text-white">{status ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Prize Breakdown</span>
            <span className="text-white text-right">
              {firstPrizeAmount && Number(firstPrizeAmount) > 0
                ? `1st: ${firstPrizeAmount} MON · 2nd/3rd: remainder`
                : '1st: 50%, 2nd: 30%, 3rd: 20%'}
            </span>
          </div>
        </div>
      )}
      <Link
        to={`/match/${matchId}/create-team`}
        className="mt-6 block w-full rounded-lg bg-emerald-600 px-4 py-3 text-center font-medium text-white transition hover:bg-emerald-500"
      >
        {isConnected ? 'Create Team & Join' : 'Create Team to Join'}
      </Link>
      {!address && (
        <p className="mt-2 text-center text-sm text-slate-500">
          Connect your wallet to join
        </p>
      )}
    </div>
  );
}
