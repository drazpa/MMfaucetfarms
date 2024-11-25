import React from 'react';
import { Settings, Bell, Shield, Wallet, Moon, Sun, Globe, Heart, Lock, Key, Smartphone, Share2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useWallet } from '../../hooks/useWallet';

export default function SettingsPage() {
  const { user, setUser } = useStore();
  const { address } = useWallet();
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [autoLock, setAutoLock] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);

  const handleUpdateProfile = (field: string, value: any) => {
    if (user) {
      setUser({ ...user, [field]: value });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-pink-600" />
        <h1 className="text-2xl font-bold gradient-text">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Security */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-pink-600" />
            Wallet Security
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">Auto-Lock Timer</span>
                  <p className="text-xs text-gray-500">Lock wallet after inactivity</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLock}
                  onChange={(e) => setAutoLock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">Biometric Authentication</span>
                  <p className="text-xs text-gray-500">Use fingerprint or face ID</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometrics}
                  onChange={(e) => setBiometrics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Connected Wallet
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600 font-mono text-sm">
                {address || 'Not connected'}
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">Transaction Signing</span>
                  <p className="text-xs text-gray-500">Require confirmation for all transactions</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Profile Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={user?.nickname || ''}
                onChange={(e) => handleUpdateProfile('nickname', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={user?.bio || ''}
                onChange={(e) => handleUpdateProfile('bio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">Public Profile</span>
                  <p className="text-xs text-gray-500">Allow others to view your profile</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-600" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">LOVE Received</span>
                  <p className="text-xs text-gray-500">Get notified when you receive LOVE</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm font-medium">New Challenges</span>
                  <p className="text-xs text-gray-500">Get notified about new challenges</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-600" />
            App Settings
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600" />
                )}
                <div>
                  <span className="text-sm font-medium">Dark Mode</span>
                  <p className="text-xs text-gray-500">Toggle dark theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Network
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent">
                <option value="polygon">Polygon</option>
                <option value="base">Base</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <button className="button-secondary">
          Reset to Default
        </button>
        <button className="button-primary">
          Save Changes
        </button>
      </div>
    </div>
  );
}</content></file>

<boltAction type="file" filePath="src/types/index.ts">export interface User {
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
}</content></file>

<boltAction type="start">
<command>npm run dev</command>