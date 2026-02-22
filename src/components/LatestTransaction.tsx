import { useLastTx } from '@/contexts/LastTxContext';

function shortenHash(hash: string) {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

export function LatestTransaction() {
  const { lastTx, explorerUrl } = useLastTx();

  if (!lastTx?.hash) return null;

  return (
    <a
      href={explorerUrl(lastTx.hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-emerald-600/50 hover:text-emerald-400"
      title="View latest transaction on explorer"
    >
      <span className="text-slate-500">Latest tx:</span>
      <span className="font-mono">{shortenHash(lastTx.hash)}</span>
      <span className="text-slate-500">→</span>
    </a>
  );
}
