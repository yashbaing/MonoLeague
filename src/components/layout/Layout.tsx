import { Outlet, Link, useLocation } from 'react-router-dom';
import { WalletConnect } from '../WalletConnect';
import { TransactionHistory } from '../TransactionHistory';

const navLinks = [
  { to: '/', label: 'Matches' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/prizes', label: 'Prizes & claim' },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/98 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 transition opacity-90 hover:opacity-100"
          >
            <span className="text-xl font-bold tracking-tight text-emerald-400">
              Dream 11
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-emerald-400/90">
              Testnet
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/40 px-2 py-1.5">
            <WalletConnect />
            <div className="h-5 w-px shrink-0 bg-slate-600/80" aria-hidden />
            <TransactionHistory />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
