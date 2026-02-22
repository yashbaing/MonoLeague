import { useReadContract } from 'wagmi';
import { contestAbi } from '@/contracts/abis/Contest';
import { formatEther } from 'viem';

const isZeroAddress = (addr: string) =>
  addr === '0x0000000000000000000000000000000000000000' ||
  addr === '0x0000000000000000000000000000000000000001';

export function useContest(contestAddress: `0x${string}` | undefined) {
  const enabled = Boolean(contestAddress) && !isZeroAddress(contestAddress ?? '');

  const { data: matchId, ...matchRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'matchId',
    query: { enabled },
  });

  const { data: entryFee, ...entryRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'entryFee',
    query: { enabled },
  });

  const { data: deadline, ...deadlineRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'deadline',
    query: { enabled },
  });

  const { data: status, ...statusRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'status',
    query: { enabled },
  });

  const { data: prizePool, ...prizeRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'prizePool',
    query: { enabled },
  });

  const { data: entryCount, ...entryCountRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'getEntryCount',
    query: { enabled },
  });

  const { data: maxEntries, ...maxRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'maxEntries',
    query: { enabled },
  });

  const { data: firstPrizeAmount, ...firstPrizeRest } = useReadContract({
    address: contestAddress,
    abi: contestAbi,
    functionName: 'firstPrizeAmount',
    query: { enabled },
  });

  const isLoading =
    matchRest.isLoading ||
    entryRest.isLoading ||
    deadlineRest.isLoading ||
    statusRest.isLoading ||
    prizeRest.isLoading ||
    entryCountRest.isLoading ||
    firstPrizeRest.isLoading;

  const statusLabels = ['Open', 'Locked', 'Scored', 'Completed'] as const;

  return {
    matchId: matchId != null ? Number(matchId) : undefined,
    entryFee: entryFee != null ? formatEther(entryFee) : undefined,
    entryFeeWei: entryFee,
    deadline: deadline != null ? Number(deadline) : undefined,
    status: status != null ? statusLabels[Number(status)] : undefined,
    statusRaw: status,
    prizePool: prizePool != null ? formatEther(prizePool) : undefined,
    entryCount: entryCount != null ? Number(entryCount) : undefined,
    maxEntries: maxEntries != null ? Number(maxEntries) : undefined,
    firstPrizeAmount: firstPrizeAmount != null ? formatEther(firstPrizeAmount) : undefined,
    isLoading,
    ...matchRest,
  };
}
