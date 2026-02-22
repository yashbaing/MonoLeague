import { MatchList } from '@/components/MatchList';

export function Home() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">
        Fantasy Cricket on Monad
      </h1>
      <p className="mb-8 max-w-2xl text-slate-400">
        Create your fantasy team, join contests, and win prizes on Monad testnet.
        Connect your wallet to get started.
      </p>
      <MatchList />
    </div>
  );
}
