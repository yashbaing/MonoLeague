import { useReadContract } from 'wagmi';
import { addresses } from '@/contracts/addresses';

const contestFactoryAbi = [
  {
    inputs: [],
    name: 'getContests',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000';

export function useContests() {
  const { data: contests, ...rest } = useReadContract({
    address: addresses.contestFactory,
    abi: contestFactoryAbi,
    functionName: 'getContests',
    query: { enabled: !isZeroAddress(addresses.contestFactory) },
  });

  return { contests: contests ?? [], ...rest };
}
