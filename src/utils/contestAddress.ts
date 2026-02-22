/**
 * Resolves contestId from URL to a contract address.
 * Actual testnet mode: only returns real addresses. No mock/demo.
 */
export function resolveContestAddress(
  contestId: string | undefined,
  fallback?: `0x${string}`
): `0x${string}` | undefined {
  if (contestId?.startsWith('0x') && contestId.length === 42) {
    return contestId as `0x${string}`;
  }
  return fallback;
}
