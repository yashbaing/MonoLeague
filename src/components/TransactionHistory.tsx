import { useState, useRef, useEffect } from 'react';
import { useLastTx } from '@/contexts/LastTxContext';

function shortenHash(hash: string) {
  if (!hash || hash.length < 10) return hash;
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return 'Just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString();
}

export function TransactionHistory() {
  const { allTxs, explorerUrl } = useLastTx();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700/80 hover:text-white"
      >
        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
        {allTxs.length > 0 && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
            {allTxs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-80 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/30 backdrop-blur">
          <div className="border-b border-slate-700/80 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Transactions</h3>
            <p className="mt-0.5 text-xs text-slate-400">Join contest on Monad Testnet</p>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {allTxs.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No transactions yet</p>
            ) : (
              <ul className="space-y-0.5">
                {allTxs.map((tx) => (
                  <li key={tx.hash}>
                    <a
                      href={explorerUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-slate-800/80"
                    >
                      <span className="font-mono text-slate-300">
                        {shortenHash(tx.hash)}
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatTime(tx.timestamp)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
