import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import FaucetPage from './components/faucet/FaucetPage';
import MintPage from './components/mint/MintPage';
import WheelPage from './components/wheel/WheelPage';
import MiningPage from './components/mining/MiningPage';
import FarmPage from './components/farm/FarmPage';
import { useWallet } from './hooks/useWallet';
import { Heart, AlertCircle } from 'lucide-react';

function App() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'faucet' | 'mint' | 'wheel' | 'mining' | 'farm'>('dashboard');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setError('');
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">Welcome to Love Connection</h1>
          <p className="text-gray-600 mb-8">Connect your wallet to get started</p>
          
          {error && (
            <div className="mb-6 flex items-center justify-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            onClick={handleConnect} 
            className="button-primary"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Navbar 
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={disconnectWallet}
        address={address}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'faucet' && <FaucetPage />}
        {currentPage === 'mint' && <MintPage />}
        {currentPage === 'wheel' && <WheelPage />}
        {currentPage === 'mining' && <MiningPage />}
        {currentPage === 'farm' && <FarmPage />}
      </main>
    </div>
  );
}

export default App;