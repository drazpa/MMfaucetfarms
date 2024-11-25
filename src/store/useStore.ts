import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, BestFriend, MiningSession } from '../types';

// Helper to clean up old transactions
const cleanupTransactions = (transactions: Transaction[], maxCount = 20) => {
  return transactions.slice(0, maxCount);
};

// Helper to clean up old sessions
const cleanupSessions = (sessions: MiningSession[], maxCount = 5) => {
  return sessions.slice(0, maxCount);
};

// Custom storage with error handling and cleanup
const customStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return localStorage.getItem(name);
    } catch (error) {
      console.warn('Storage error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      // Clean up old data before setting new data
      try {
        const oldData = JSON.parse(localStorage.getItem(name) || '{}');
        if (oldData.state?.transactions) {
          oldData.state.transactions = cleanupTransactions(oldData.state.transactions);
        }
        if (oldData.state?.miningSessions) {
          oldData.state.miningSessions = cleanupSessions(oldData.state.miningSessions);
        }
        localStorage.setItem(name, JSON.stringify(oldData));
      } catch (e) {
        console.warn('Failed to clean up old data:', e);
      }

      // Try to set the new data
      localStorage.setItem(name, value);
    } catch (error) {
      console.warn('Storage error:', error);
      // If quota exceeded, clear non-essential data
      try {
        localStorage.removeItem('wagmi.cache');
        localStorage.removeItem('wagmi.connected');
        localStorage.removeItem('wagmi.network');
        localStorage.setItem(name, value);
      } catch (retryError) {
        console.error('Failed to store data even after cleanup:', retryError);
      }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.warn('Storage error:', error);
    }
  },
};

interface Store {
  transactions: Transaction[];
  bestFriends: BestFriend[];
  mining: {
    isActive: boolean;
    isPaused: boolean;
    startTime: number | null;
    pauseTime: number | null;
    minedAmount: number;
  };
  farming: {
    isActive: boolean;
    isPaused: boolean;
    startTime: number | null;
    pauseTime: number | null;
    farmedAmount: number;
  };
  miningSessions: MiningSession[];
  addTransaction: (transaction: Transaction) => void;
  addBestFriend: (friend: BestFriend) => void;
  removeBestFriend: (address: string) => void;
  updateBestFriend: (address: string, updates: Partial<BestFriend>) => void;
  setMiningStatus: (status: boolean) => void;
  setMiningPaused: (paused: boolean) => void;
  setMiningStartTime: (time: number | null) => void;
  setMiningPauseTime: (time: number | null) => void;
  setMinedAmount: (amount: number) => void;
  resetMining: () => void;
  setFarmingStatus: (status: boolean) => void;
  setFarmingPaused: (paused: boolean) => void;
  setFarmStartTime: (time: number | null) => void;
  setFarmPauseTime: (time: number | null) => void;
  setFarmedAmount: (amount: number) => void;
  resetFarming: () => void;
  addMiningSession: (session: MiningSession) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      transactions: [],
      bestFriends: [],
      miningSessions: [],
      mining: {
        isActive: false,
        isPaused: false,
        startTime: null,
        pauseTime: null,
        minedAmount: 0,
      },
      farming: {
        isActive: false,
        isPaused: false,
        startTime: null,
        pauseTime: null,
        farmedAmount: 0,
      },
      addTransaction: (transaction) =>
        set((state) => ({ 
          transactions: cleanupTransactions([transaction, ...state.transactions])
        })),
      addBestFriend: (friend) =>
        set((state) => ({
          bestFriends: [...state.bestFriends.filter(f => f.address !== friend.address), friend]
        })),
      removeBestFriend: (address) =>
        set((state) => ({
          bestFriends: state.bestFriends.filter(f => f.address !== address)
        })),
      updateBestFriend: (address, updates) =>
        set((state) => ({
          bestFriends: state.bestFriends.map(friend =>
            friend.address === address ? { ...friend, ...updates } : friend
          )
        })),
      setMiningStatus: (status) =>
        set((state) => ({
          mining: { ...state.mining, isActive: status }
        })),
      setMiningPaused: (paused) =>
        set((state) => ({
          mining: { ...state.mining, isPaused: paused }
        })),
      setMiningStartTime: (time) =>
        set((state) => ({
          mining: { ...state.mining, startTime: time }
        })),
      setMiningPauseTime: (time) =>
        set((state) => ({
          mining: { ...state.mining, pauseTime: time }
        })),
      setMinedAmount: (amount) =>
        set((state) => ({
          mining: { ...state.mining, minedAmount: amount }
        })),
      resetMining: () =>
        set((state) => ({
          mining: {
            isActive: false,
            isPaused: false,
            startTime: null,
            pauseTime: null,
            minedAmount: 0,
          }
        })),
      setFarmingStatus: (status) =>
        set((state) => ({
          farming: { ...state.farming, isActive: status }
        })),
      setFarmingPaused: (paused) =>
        set((state) => ({
          farming: { ...state.farming, isPaused: paused }
        })),
      setFarmStartTime: (time) =>
        set((state) => ({
          farming: { ...state.farming, startTime: time }
        })),
      setFarmPauseTime: (time) =>
        set((state) => ({
          farming: { ...state.farming, pauseTime: time }
        })),
      setFarmedAmount: (amount) =>
        set((state) => ({
          farming: { ...state.farming, farmedAmount: amount }
        })),
      resetFarming: () =>
        set((state) => ({
          farming: {
            isActive: false,
            isPaused: false,
            startTime: null,
            pauseTime: null,
            farmedAmount: 0,
          }
        })),
      addMiningSession: (session) =>
        set((state) => ({
          miningSessions: cleanupSessions([session, ...state.miningSessions])
        })),
    }),
    {
      name: 'love-connection-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        transactions: cleanupTransactions(state.transactions),
        bestFriends: state.bestFriends,
        miningSessions: cleanupSessions(state.miningSessions),
        mining: {
          isActive: state.mining.isActive,
          isPaused: state.mining.isPaused,
          startTime: state.mining.startTime,
          pauseTime: state.mining.pauseTime,
          minedAmount: state.mining.minedAmount,
        },
        farming: {
          isActive: state.farming.isActive,
          isPaused: state.farming.isPaused,
          startTime: state.farming.startTime,
          pauseTime: state.farming.pauseTime,
          farmedAmount: state.farming.farmedAmount,
        },
      }),
    }
  )
);