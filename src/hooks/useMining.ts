import { useContractRead, useContractWrite, useAccount, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS, LOVE_MINING_ADDRESS } from '../config/contracts';
import LOVETokenABI from '../contracts/abis/LOVEToken.json';
import LOVEMiningABI from '../contracts/abis/LOVEMining.json';
import { useState, useEffect } from 'react';

export function useMining() {
  const { address } = useAccount();
  const [pendingRewards, setPendingRewards] = useState<bigint>(0n);

  // Check token approval
  const { data: allowance } = useContractRead({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', LOVE_MINING_ADDRESS],
    enabled: !!address,
    watch: true,
  });

  // Get miner info
  const { data: minerInfo } = useContractRead({
    address: LOVE_MINING_ADDRESS,
    abi: LOVEMiningABI.abi,
    functionName: 'getMinerInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: !!address,
    watch: true,
  });

  // Prepare approve transaction
  const { config: approveConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'approve',
    args: [LOVE_MINING_ADDRESS, parseEther('1000000')],
    enabled: !!address,
  });

  // Approve function
  const { write: approve, data: approveData } = useContractWrite(approveConfig);
  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // Prepare start mining transaction
  const { config: startConfig } = usePrepareContractWrite({
    address: LOVE_MINING_ADDRESS,
    abi: LOVEMiningABI.abi,
    functionName: 'startMining',
    args: [parseEther('0')], // Will be updated when calling startMining
    enabled: !!address,
  });

  // Start mining function
  const { write: startWrite, data: startData } = useContractWrite(startConfig);
  const { isLoading: isStarting } = useWaitForTransaction({
    hash: startData?.hash,
  });

  const startMining = async (amount: bigint) => {
    if (!address) throw new Error('Wallet not connected');

    try {
      // Check and handle approval if needed
      if (!allowance || allowance < amount) {
        if (!approve) throw new Error('Approval not available');
        const approveTx = await approve();
        if (!approveTx) throw new Error('Approval failed');

        // Wait for approval to be mined
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!startWrite) throw new Error('Mining not available');
      const tx = await startWrite({ args: [amount] });
      if (!tx) throw new Error('Mining transaction failed');
      
      return tx;
    } catch (error: any) {
      console.error('Mining error:', error);
      throw new Error(error.message || 'Failed to start mining');
    }
  };

  // Prepare stop mining transaction
  const { config: stopConfig } = usePrepareContractWrite({
    address: LOVE_MINING_ADDRESS,
    abi: LOVEMiningABI.abi,
    functionName: 'stopMining',
    enabled: !!address && !!(minerInfo?.minedAmount || 0n) > 0n,
  });

  // Stop mining function
  const { write: stopWrite, data: stopData } = useContractWrite(stopConfig);
  const { isLoading: isStopping } = useWaitForTransaction({
    hash: stopData?.hash,
  });

  // Prepare claim transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOVE_MINING_ADDRESS,
    abi: LOVEMiningABI.abi,
    functionName: 'claimRewards',
    enabled: !!address && pendingRewards > 0n && !minerInfo?.isPaused,
  });

  // Claim function
  const { write: claimWrite, data: claimData } = useContractWrite(claimConfig);
  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Update pending rewards in real-time
  useEffect(() => {
    if (!minerInfo?.minedAmount || minerInfo.isPaused) {
      setPendingRewards(0n);
      return;
    }

    const updateRewards = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const timeElapsed = now - minerInfo.lastClaimTime;
      const annualRate = parseEther('1'); // 100% APY
      const rewards = (minerInfo.minedAmount * annualRate * timeElapsed) / (BigInt(365) * BigInt(24) * BigInt(60) * BigInt(60));
      setPendingRewards(rewards);
    };

    const timer = setInterval(updateRewards, 1000);
    updateRewards();

    return () => clearInterval(timer);
  }, [minerInfo]);

  const stopMining = async () => {
    if (!stopWrite) throw new Error('Stop mining not available');
    return stopWrite();
  };

  const claimRewards = async () => {
    if (!claimWrite) throw new Error('Claim not available');
    return claimWrite();
  };

  return {
    minerInfo: {
      minedAmount: minerInfo?.minedAmount || 0n,
      startTime: minerInfo?.startTime || 0n,
      lastClaimTime: minerInfo?.lastClaimTime || 0n,
      pendingRewards,
      isPaused: minerInfo?.isPaused || false,
      pausedAt: minerInfo?.pausedAt || 0n,
    },
    startMining,
    stopMining,
    claimRewards,
    isStarting,
    isStopping,
    isClaiming,
    isApproving,
  };
}