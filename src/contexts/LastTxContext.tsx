import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'dream11_txHistory';
const EXPLORER = 'https://testnet.monadexplorer.com';
const MAX_HISTORY = 50;

export type TxEntry = { hash: string; chainId: number; timestamp: number };

const LEGACY_KEY = 'dream11_lastTx';

function saveStored(txs: TxEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(txs.slice(0, MAX_HISTORY)));
}

function loadStored(): TxEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const v = JSON.parse(raw) as TxEntry[];
      return Array.isArray(v) ? v.slice(0, MAX_HISTORY) : [];
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const v = JSON.parse(legacy) as { hash?: string; chainId?: number };
      if (v?.hash) {
        const migrated: TxEntry[] = [{ hash: v.hash, chainId: v.chainId ?? 10143, timestamp: Date.now() }];
        localStorage.removeItem(LEGACY_KEY);
        saveStored(migrated);
        return migrated;
      }
    }
    return [];
  } catch {
    return [];
  }
}

const LastTxContext = createContext<{
  lastTx: TxEntry | null;
  allTxs: TxEntry[];
  setLastTx: (hash: string | null, chainId?: number) => void;
  explorerUrl: (hash: string) => string;
} | null>(null);

export function LastTxProvider({ children }: { children: React.ReactNode }) {
  const [allTxs, setAllTxs] = useState<TxEntry[]>(loadStored);

  const setLastTx = useCallback((hash: string | null, chainId = 10143) => {
    if (!hash) return;
    const entry: TxEntry = { hash, chainId, timestamp: Date.now() };
    setAllTxs((prev) => {
      const next = [entry, ...prev.filter((t) => t.hash !== hash)].slice(0, MAX_HISTORY);
      saveStored(next);
      return next;
    });
  }, []);

  const lastTx = allTxs[0] ?? null;
  const explorerUrl = useCallback((hash: string) => `${EXPLORER}/tx/${hash}`, []);

  const value = useMemo(
    () => ({ lastTx, allTxs, setLastTx, explorerUrl }),
    [lastTx, allTxs, setLastTx, explorerUrl]
  );

  return (
    <LastTxContext.Provider value={value}>
      {children}
    </LastTxContext.Provider>
  );
}

export function useLastTx() {
  const ctx = useContext(LastTxContext);
  if (!ctx) throw new Error('useLastTx must be used within LastTxProvider');
  return ctx;
}
