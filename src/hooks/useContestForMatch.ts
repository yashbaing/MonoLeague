import { useContests } from './useContests';
import { useReadContracts } from 'wagmi';
import { contestAbi } from '@/contracts/abis/Contest';
import { addresses } from '@/contracts/addresses';

const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000';

/**
 * Returns the contest address for a given match on testnet.
 * Only returns a real contract address — no demo/mock. Returns undefined when
 * contracts aren't deployed or no contest exists for this match.
 */
export function useContestForMatch(matchId: number): {
  contestAddress: `0x${string}` | undefined;
  isLoading: boolean;
} {
  const { contests, isLoading: contestsLoading } = useContests();

  const contestAddresses = (contests ?? []) as `0x${string}`[];

  const matchIdCalls = contestAddresses.map((addr) => ({
    address: addr,
    abi: contestAbi,
    functionName: 'matchId' as const,
  }));

  const { data: matchIdResults, isLoading: matchIdsLoading } = useReadContracts({
    contracts: matchIdCalls,
    query: {
      enabled:
        !isZeroAddress(addresses.contestFactory) &&
        contestAddresses.length > 0 &&
        !contestsLoading,
    },
  });

  if (isZeroAddress(addresses.contestFactory)) {
    return { contestAddress: undefined, isLoading: false };
  }

  if (contestsLoading) {
    return { contestAddress: undefined, isLoading: true };
  }

  if (contestAddresses.length === 0) {
    return { contestAddress: undefined, isLoading: false };
  }

  if (matchIdsLoading || !matchIdResults) {
    return { contestAddress: undefined, isLoading: true };
  }

  // Use the latest contest for this match (last in list = most recently created)
  for (let idx = matchIdResults.length - 1; idx >= 0; idx--) {
    if (matchIdResults[idx].status === 'success' && matchIdResults[idx].result === BigInt(matchId)) {
      return { contestAddress: contestAddresses[idx], isLoading: false };
    }
  }

  return { contestAddress: undefined, isLoading: false };
}
