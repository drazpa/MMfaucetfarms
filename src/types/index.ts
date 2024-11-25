export interface User {
  address: string;
  nickname: string;
  balance: number;
  level: number;
  avatar?: string;
  bio?: string;
  reputation: number;
  totalSent: number;
  totalReceived: number;
  joinedAt: string;
  lastActive: string;
  bestFriends?: BestFriend[];
  settings?: UserSettings;
}

export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
  transactionSigning: boolean;
  autoLock: boolean;
  biometrics: boolean;
  publicProfile: boolean;
  defaultNetwork: 'polygon' | 'base';
}

export interface BestFriend {
  name: string;
  address: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'reward' | 'purchase';
  amount: number;
  timestamp: string;
  description: string;
  from?: string;
  to?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  expiresAt: string;
}

export interface LeaderboardEntry {
  address: string;
  nickname: string;
  score: number;
  avatar?: string;
}

export interface MiningSession {
  id: string;
  startTime: number;
  endTime: number;
  amountMined: number;
  duration: number;
  pauseDuration?: number;
  status: 'completed' | 'paused' | 'active';
}