import { useContractWrite, useAccount, usePrepareContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../config/contracts';
import LOVETokenABI from '../contracts/abis/LOVEToken.json';

export function useFaucet() {
  const { address } = useAccount();

  // Check last claim time
  const { data: lastClaimTime } = useContractRead({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'lastClaimTime',
    args: [address],
    enabled: !!address,
    watch: true,
  });

  // Prepare transfer
  const { config } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: [address || '0x0000000000000000000000000000000000000000', parseEther('5')],
    enabled: !!address,
  });

  // Get transfer function
  const { write: transfer, data: transferData } = useContractWrite(config);

  // Wait for transaction
  const { isLoading } = useWaitForTransaction({
    hash: transferData?.hash,
  });

  const claimTokens = async () => {
    if (!address) throw new Error('Connect wallet first');
    if (!transfer) throw new Error('Faucet not available');

    // Check cooldown
    if (lastClaimTime) {
      const cooldownEnd = Number(lastClaimTime) + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() < cooldownEnd) {
        throw new Error('Please wait 24 hours between claims');
      }
    }

    try {
      transfer();
    } catch (error: any) {
      console.error('Claim error:', error);
      throw new Error(error.message || 'Failed to claim tokens');
    }
  };

  return { 
    claimTokens, 
    isLoading,
    lastClaimTime: lastClaimTime ? Number(lastClaimTime) : null,
  };
}