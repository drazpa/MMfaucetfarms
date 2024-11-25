import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { polygon } from '../config/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { retryExponential } from '../utils/retry';

const projectId = '09f4713e6fc4332ca539edac100c2609';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [publicProvider()],
  {
    retryDelay: retryExponential({ minMs: 1000, maxMs: 10000 }),
    retryCount: 5,
    batch: {
      multicall: true,
    },
    pollingInterval: 4_000,
  }
);

const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
  storage: {
    getItem: (key: string) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // If storage is full, clear wagmi cache and retry
        try {
          window.localStorage.removeItem('wagmi.cache');
          window.localStorage.setItem(key, value);
        } catch {
          console.warn('Failed to set localStorage item:', error);
        }
      }
    },
    removeItem: (key: string) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.warn('Failed to remove localStorage item:', error);
      }
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: retryExponential({ minMs: 1000, maxMs: 10000 }),
      staleTime: 5000,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
    },
  },
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#EC4899',
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
}