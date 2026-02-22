import { useCallback } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useChainId,
} from 'wagmi';
import { parseEther } from 'viem';
import { contestAbi } from '@/contracts/abis/Contest';

const MONAD_CHAIN_ID = 10143;
const DEFAULT_ENTRY_FEE = parseEther('0.001');

export function useTeamSubmission(
  contestAddress: `0x${string}` | undefined,
  entryFeeWei?: bigint
) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectChain = chainId === MONAD_CHAIN_ID;

  const {
    data: hash,
    writeContractAsync,
    reset: resetWrite,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash, confirmations: 0 });

  const joinContest = useCallback(
    async (
      playerIds: readonly number[] | number[],
      captainId: bigint | number,
      viceCaptainId: bigint | number
    ): Promise<string | undefined> => {
      if (!contestAddress) return undefined;
      if (!isConnected) {
        throw new Error('Connect your wallet first');
      }
      if (!isCorrectChain) {
        throw new Error('Switch to Monad Testnet first');
      }
      resetWrite();
      const value = entryFeeWei ?? DEFAULT_ENTRY_FEE;
      const txHash = await writeContractAsync({
        address: contestAddress,
        abi: contestAbi,
        functionName: 'joinContest',
        args: [
          playerIds.map((id) => BigInt(id)),
          BigInt(captainId),
          BigInt(viceCaptainId),
        ],
        value,
        chainId: MONAD_CHAIN_ID,
        gas: 1500000n,
      });
      return txHash ? String(txHash) : undefined;
    },
    [
      contestAddress,
      isConnected,
      isCorrectChain,
      entryFeeWei,
      writeContractAsync,
      resetWrite,
    ]
  );

  const hasHash = Boolean(hash);
  const isConfirmed = isSuccess;

  return {
    joinContest,
    hash,
    reset: resetWrite,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    hasHash,
    isConfirming,
    error: writeError,
  };
}
