import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

export function useWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const connectWallet = async () => {
    try {
      await open();
      return address;
    } catch (error) {
      console.error('Wallet connection error:', error);
      throw new Error('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      await open({ view: 'Account' });
    } catch (error) {
      console.error('Wallet disconnect error:', error);
    }
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnectWallet,
    currentChain: chain,
    switchNetwork,
  };
}