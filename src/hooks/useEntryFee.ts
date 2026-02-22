import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { contestAbi } from '@/contracts/abis/Contest';

const ENTRY_FEE = parseEther('0.001');

export function useEntryFee(contestAddress: `0x${string}` | undefined) {
  const {
    data: hash,
    writeContract,
    isPending,
    error,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const payEntryFee = () => {
    if (!contestAddress) return;
    writeContract.mutate({
      address: contestAddress,
      abi: contestAbi,
      functionName: 'payEntryFee',
      value: ENTRY_FEE,
    });
  };

  return {
    payEntryFee,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}
