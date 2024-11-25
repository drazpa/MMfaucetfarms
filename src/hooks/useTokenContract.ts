import { useContractRead, useContractWrite, useAccount, useContractEvent, usePrepareContractWrite } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import LOVETokenABI from '../contracts/abis/LOVEToken.json';
import { LOVE_TOKEN_ADDRESS } from '../config/contracts';
import { useState, useEffect } from 'react';

export function useTokenContract() {
  const { address } = useAccount();
  const FAUCET_WALLET = '0x18B37183Bad87852cAA2Bc5C899e176eA74E2505';
  const [tokenMetrics, setTokenMetrics] = useState({
    balanceChange: 0,
    reputationChange: 0,
  });

  // Token Balance
  const { data: balance, isError: balanceError } = useContractRead({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'balanceOf',
    args: [address || '0x0000000000000000000000000000000000000000'],
    enabled: !!address,
    watch: true,
  });

  // Check Allowance
  const { data: allowance } = useContractRead({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'allowance',
    args: [FAUCET_WALLET, LOVE_TOKEN_ADDRESS],
    watch: true,
  });

  // Prepare approve transaction
  const { config: approveConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'approve',
    args: [LOVE_TOKEN_ADDRESS, parseEther('1000000')], // Approve 1M LOVE tokens
  });

  // Approve function
  const { writeAsync: approve, isLoading: isApproving } = useContractWrite(approveConfig);

  const approveContract = async () => {
    if (!approve) throw new Error('Approval not available');
    try {
      const tx = await approve();
      await tx.wait();
      return tx;
    } catch (error: any) {
      console.error('Approval error:', error);
      throw new Error(error.message || 'Failed to approve tokens');
    }
  };

  // Contract Events
  useContractEvent({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    eventName: 'Transfer',
    listener(log) {
      const [from, to, value] = log.args;
      if (from === address || to === address) {
        setTokenMetrics(prev => ({
          ...prev,
          balanceChange: to === address ? 5 : -5,
          reputationChange: 1,
        }));
      }
    },
  });

  return {
    balance: balance ? formatEther(balance) : '0',
    tokenMetrics,
    error: balanceError,
    allowance: allowance ? formatEther(allowance) : '0',
    approveContract,
    isApproving,
  };
}