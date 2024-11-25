import React from 'react';
import { Heart, LogOut, Droplets, Wallet, Coins, Trophy, Pickaxe, Sprout } from 'lucide-react';
import NetworkSelector from './NetworkSelector';

interface NavbarProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  address?: string | null;
  currentPage: 'dashboard' | 'faucet' | 'mint' | 'wheel' | 'mining' | 'farm';
  onNavigate: (page: 'dashboard' | 'faucet' | 'mint' | 'wheel' | 'mining' | 'farm') => void;
}

export default function Navbar({ 
  isConnected, 
  onConnect, 
  onDisconnect, 
  address,
  currentPage,
  onNavigate 
}: NavbarProps) {
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-pink-600" />
            <span className="text-xl font-bold text-gray-800">Love Connection</span>
          </div>
          
          <div className="flex items-center gap-6">
            {isConnected && (
              <>
                <NetworkSelector />
                <span className="text-gray-600 font-mono">
                  {address ? truncateAddress(address) : ''}
                </span>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`text-gray-600 hover:text-gray-800 ${
                    currentPage === 'dashboard' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => onNavigate('faucet')}
                  className={`text-gray-600 hover:text-gray-800 flex items-center gap-1 ${
                    currentPage === 'faucet' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  <Droplets className="w-4 h-4" />
                  Faucet
                </button>
                <button 
                  onClick={() => onNavigate('mint')}
                  className={`text-gray-600 hover:text-gray-800 flex items-center gap-1 ${
                    currentPage === 'mint' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  Mint
                </button>
                <button 
                  onClick={() => onNavigate('wheel')}
                  className={`text-gray-600 hover:text-gray-800 flex items-center gap-1 ${
                    currentPage === 'wheel' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  Wheel
                </button>
                <button 
                  onClick={() => onNavigate('mining')}
                  className={`text-gray-600 hover:text-gray-800 flex items-center gap-1 ${
                    currentPage === 'mining' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  <Pickaxe className="w-4 h-4" />
                  Mining
                </button>
                <button 
                  onClick={() => onNavigate('farm')}
                  className={`text-gray-600 hover:text-gray-800 flex items-center gap-1 ${
                    currentPage === 'farm' ? 'font-semibold text-pink-600' : ''
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                  Farm
                </button>
                <button 
                  onClick={onDisconnect}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </>
            )}
            {!isConnected && (
              <button 
                onClick={onConnect}
                className="flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-200 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}