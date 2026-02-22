import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { monadTestnet } from './chains';

// Get a free projectId at https://cloud.walletconnect.com - required for WalletConnect
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

export const config = getDefaultConfig({
  appName: 'Dream 11 Monad',
  projectId,
  chains: [monadTestnet],
  ssr: false,
});
