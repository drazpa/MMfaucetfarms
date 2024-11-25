import { useContractRead, useContractWrite, useAccount, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS, LOVE_STAKING_ADDRESS } from '../config/contracts';
import LOVETokenABI from '../contracts/abis/LOVEToken.json';
import LOVEStakingABI from '../contracts/abis/LOVEStaking.json';
import { useState, useEffect } from 'react';

export function useStaking() {
  const { address } = useAccount();
  const [pendingRewards, setPendingRewards] = useState<bigint>(0n);

  // Check token approval
  const { data: allowance } = useContractRead({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', LOVE_STAKING_ADDRESS],
    enabled: !!address,
    watch: true,
  });

  // Get stake info
  const { data: stakeInfo } = useContractRead({
    address: LOVE_STAKING_ADDRESS,
    abi: LOVEStakingABI.abi,
    functionName: 'getStakeInfo',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: !!address,
    watch: true,
  });

  // Prepare approve transaction
  const { config: approveConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'approve',
    args: [LOVE_STAKING_ADDRESS, parseEther('1000000')],
    enabled: !!address,
  });

  // Approve function
  const { write: approve, data: approveData } = useContractWrite(approveConfig);
  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
  });

  // Prepare stake transaction
  const { config: stakeConfig } = usePrepareContractWrite({
    address: LOVE_STAKING_ADDRESS,
    abi: LOVEStakingABI.abi,
    functionName: 'stake',
    enabled: !!address,
  });

  // Stake function
  const { write: stakeWrite, data: stakeData } = useContractWrite(stakeConfig);
  const { isLoading: isStaking } = useWaitForTransaction({
    hash: stakeData?.hash,
  });

  const stake = async (amount: bigint) => {
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

      if (!stakeWrite) throw new Error('Staking not available');
      const tx = await stakeWrite({ args: [amount] });
      if (!tx) throw new Error('Staking transaction failed');
      
      return tx;
    } catch (error: any) {
      console.error('Stake error:', error);
      throw new Error(error.message || 'Failed to stake tokens');
    }
  };

  // Prepare unstake transaction
  const { config: unstakeConfig } = usePrepareContractWrite({
    address: LOVE_STAKING_ADDRESS,
    abi: LOVEStakingABI.abi,
    functionName: 'unstake',
    enabled: !!address && !!(stakeInfo?.stakedAmount || 0n) > 0n,
  });

  // Unstake function
  const { write: unstakeWrite, data: unstakeData } = useContractWrite(unstakeConfig);
  const { isLoading: isUnstaking } = useWaitForTransaction({
    hash: unstakeData?.hash,
  });

  // Prepare claim transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOVE_STAKING_ADDRESS,
    abi: LOVEStakingABI.abi,
    functionName: 'claimRewards',
    enabled: !!address && pendingRewards > 0n,
  });

  // Claim function
  const { write: claimWrite, data: claimData } = useContractWrite(claimConfig);
  const { isLoading: isClaiming } = useWaitForTransaction({
    hash: claimData?.hash,
  });

  // Update pending rewards in real-time
  useEffect(() => {
    if (!stakeInfo?.stakedAmount) return;

    const updateRewards = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const timeElapsed = now - stakeInfo.lastClaimTime;
      const annualRate = parseEther('1'); // 100% APY
      const rewards = (stakeInfo.stakedAmount * annualRate * timeElapsed) / (BigInt(365) * BigInt(24) * BigInt(60) * BigInt(60));
      setPendingRewards(rewards);
    };

    const timer = setInterval(updateRewards, 1000);
    updateRewards();

    return () => clearInterval(timer);
  }, [stakeInfo]);

  const unstake = async () => {
    if (!unstakeWrite) throw new Error('Unstake not available');
    return unstakeWrite();
  };

  const claimRewards = async () => {
    if (!claimWrite) throw new Error('Claim not available');
    return claimWrite();
  };

  return {
    stakeInfo: {
      stakedAmount: stakeInfo?.stakedAmount || 0n,
      startTime: stakeInfo?.startTime || 0n,
      lastClaimTime: stakeInfo?.lastClaimTime || 0n,
      pendingRewards,
    },
    stake,
    unstake,
    claimRewards,
    isStaking,
    isUnstaking,
    isClaiming,
    isApproving,
  };
}