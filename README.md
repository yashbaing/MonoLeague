# MonoLeague - Fantasy Cricket on Monad Testnet

A full on-chain fantasy sports web app built on Monad testnet. Create your fantasy team, join contests, and win prizes.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS
- **Wallet**: Wagmi v2, Viem, RainbowKit
- **Blockchain**: Solidity, Hardhat, Monad Testnet (Chain ID: 10143)

## Setup

### 1. Install dependencies

```bash
npm install
```

If npm install fails with ENOTEMPTY or similar, try:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. WalletConnect (optional for WalletConnect modal)

Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/) and create `.env`:

```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### 3. Run the app

```bash
npm run dev
```

### 4. Deploy contracts (Monad Testnet)

```bash
cd contracts
npm install
# Set PRIVATE_KEY in .env for deployer
npm run deploy
```

After deployment, run the seed script to add players and create a contest:

```bash
npm run seed
```

Then update `src/contracts/addresses.ts` with the addresses from `contracts/deployed-addresses.json`. The frontend will use these for live contract reads. Before deployment, it falls back to mock data.

## Project Structure

```
├── src/
│   ├── components/     # WalletConnect, MatchList, TeamBuilder, etc.
│   ├── config/         # Wagmi, chains
│   ├── contracts/      # ABIs, addresses
│   ├── data/           # Mock matches & players
│   ├── hooks/          # useContests, useTeamSubmission, usePlayers
│   ├── pages/          # Home, CreateTeam, ContestDetail
│   └── providers/      # Wagmi + RainbowKit
├── contracts/
│   ├── contracts/      # PlayerRegistry, Contest, ContestFactory
│   └── scripts/        # deploy.js
```

## Features

- Create fantasy team (11 players, 100 credit budget)
- Captain (2x) and Vice-Captain (1.5x) multipliers
- Role rules: 1 WK, 1–8 BAT, 1–8 AR, 1–8 BOWL
- Join contests with entry fee (MON)
- Leaderboard after match
- Connect wallet (MetaMask, etc.) on Monad Testnet
