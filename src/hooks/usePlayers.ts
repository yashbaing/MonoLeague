import { useReadContract } from 'wagmi';
import { addresses } from '@/contracts/addresses';
import type { Player } from '@/data/mockPlayers';

const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000';

const playerRegistryAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: 'matchId', type: 'uint256' },
    ],
    name: 'getPlayersForMatch',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'uint8', name: 'role', type: 'uint8' },
          { internalType: 'uint8', name: 'credit', type: 'uint8' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'uint8', name: 'teamId', type: 'uint8' },
        ],
        internalType: 'struct PlayerRegistry.Player[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const ROLE_MAP = ['WK', 'BAT', 'AR', 'BOWL'] as const;

export function usePlayers(matchId: number, fallback: Player[]) {
  const { data: onChainPlayers } = useReadContract({
    address: addresses.playerRegistry,
    abi: playerRegistryAbi,
    functionName: 'getPlayersForMatch',
    args: [BigInt(matchId)],
    query: { enabled: !isZeroAddress(addresses.playerRegistry) },
  });

  if (onChainPlayers && onChainPlayers.length > 0) {
    return onChainPlayers.map((p) => ({
      id: Number(p.id),
      name: p.name || `Player ${p.id}`,
      role: ROLE_MAP[p.role] ?? 'BAT',
      credit: p.credit,
      teamId: (p.teamId === 0 ? 0 : 1) as 0 | 1,
    })) as Player[];
  }

  return fallback;
}
