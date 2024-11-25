import React, { useState, useEffect } from 'react';
import { Sprout, AlertCircle, Clock, TrendingUp, Play, Pause, Plus } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';
import { useStore } from '../../store/useStore';
import FarmAnimation from './FarmAnimation';
import { formatDistanceToNow } from 'date-fns';

const ISSUER_ADDRESS = '0x18B37183Bad87852cAA2Bc5C899e176eA74E2505';
const BASE_FARM_RATE = 0.00000000001; // Base rate per millisecond per LOVE token
const UPDATE_INTERVAL = 10; // Update every 10ms for smooth animation

export default function FarmPage() {
  const { farming, setFarmingStatus, setFarmStartTime, setFarmedAmount, resetFarming } = useStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { balance } = useTokenContract();
  const { addTransaction } = useStore();
  const [displayAmount, setDisplayAmount] = useState('0.000000000');
  const [farmStats, setFarmStats] = useState({
    totalFarmed: 0,
    sessionStart: null as number | null,
    longestSession: 0,
    totalSessions: 0,
  });

  // Calculate farming rate based on wallet balance
  const farmingRate = parseFloat(balance) * BASE_FARM_RATE;

  // Load farm stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('farmStats');
    if (savedStats) {
      setFarmStats(JSON.parse(savedStats));
    }
  }, []);

  // Update farmed amount in real-time with millisecond precision
  useEffect(() => {
    if (!farming.isActive || !farming.startTime || parseFloat(balance) === 0) {
      setDisplayAmount('0.000000000');
      return;
    }

    const timer = setInterval(() => {
      const elapsedMilliseconds = Date.now() - farming.startTime;
      const amount = elapsedMilliseconds * farmingRate;
      setFarmedAmount(amount);
      setDisplayAmount(amount.toFixed(12));
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [farming.isActive, farming.startTime, farmingRate, setFarmedAmount, balance]);

  // Prepare claim transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: farming.farmedAmount ? [ISSUER_ADDRESS, parseEther(farming.farmedAmount.toFixed(9))] : undefined,
    enabled: farming.farmedAmount > 0,
  });

  // Get claim function
  const { write: claim, data: claimData } = useContractWrite(claimConfig);

  // Wait for claim transaction
  const { isLoading: isClaimLoading } = useWaitForTransaction({
    hash: claimData?.hash,
    onSuccess() {
      if (claimData?.hash) {
        // Update farming stats
        const sessionDuration = farming.startTime ? Date.now() - farming.startTime : 0;
        const newStats = {
          ...farmStats,
          totalFarmed: farmStats.totalFarmed + farming.farmedAmount,
          sessionStart: null,
          longestSession: Math.max(farmStats.longestSession, sessionDuration),
          totalSessions: farmStats.totalSessions + 1,
        };
        setFarmStats(newStats);
        localStorage.setItem('farmStats', JSON.stringify(newStats));

        addTransaction({
          id: claimData.hash,
          type: 'receive',
          amount: farming.farmedAmount,
          timestamp: new Date().toISOString(),
          description: 'Claimed farmed LOVE tokens',
          from: ISSUER_ADDRESS,
        });

        setSuccess(`Successfully claimed ${farming.farmedAmount.toFixed(9)} LOVE!`);
        resetFarming();
        setDisplayAmount('0.000000000');
      }
    },
    onError(error) {
      setError(error.message || 'Failed to claim tokens');
    },
  });

  const handleStartFarming = () => {
    if (parseFloat(balance) === 0) {
      setError('You need LOVE tokens in your wallet to start farming');
      return;
    }
    setError('');
    setSuccess('');
    setFarmingStatus(true);
    setFarmStartTime(Date.now());
    setFarmStats(prev => ({
      ...prev,
      sessionStart: Date.now(),
    }));
  };

  const handleStopFarming = () => {
    setFarmingStatus(false);
    setFarmStats(prev => ({
      ...prev,
      sessionStart: null,
    }));
  };

  const handleClaim = async () => {
    try {
      setError('');
      if (!claim) {
        throw new Error('Claim not available');
      }
      if (!farming.farmedAmount || farming.farmedAmount <= 0) {
        throw new Error('No LOVE to claim');
      }
      if (farming.isActive) {
        throw new Error('Please stop farming before claiming');
      }
      await claim();
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim LOVE');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <Sprout className="w-8 h-8 text-pink-600" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">LOVE Farming</h1>
              <p className="text-gray-600">Farm LOVE tokens based on your wallet balance</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Farming Animation */}
          {farming.isActive && (
            <div className="mb-8">
              <FarmAnimation />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Farming Session */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Current Session</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {displayAmount} LOVE
              </p>
              {farming.startTime && (
                <p className="text-sm text-gray-500 mt-1">
                  Farming for {((Date.now() - farming.startTime) / 1000).toFixed(3)}s
                </p>
              )}
            </div>

            {/* Farming Rate */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Farming Rate</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {farmingRate.toFixed(12)} LOVE/ms
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Based on {balance} LOVE balance
              </p>
            </div>

            {/* Total Farmed */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Sprout className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Total Farmed</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {farmStats.totalFarmed.toFixed(9)} LOVE
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {farmStats.totalSessions} sessions
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-600">
              Farming rate is based on your wallet balance. More LOVE = Higher farming rate!
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={farming.isActive ? handleStopFarming : handleStartFarming}
              disabled={parseFloat(balance) === 0}
              className={`button-primary flex-1 flex items-center justify-center gap-2 ${
                parseFloat(balance) === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {farming.isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Farming
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Farming
                </>
              )}
            </button>

            <button
              onClick={handleClaim}
              disabled={isClaimLoading || farming.isActive || !farming.farmedAmount || farming.farmedAmount <= 0}
              className={`button-primary flex-1 flex items-center justify-center gap-2 ${
                (isClaimLoading || farming.isActive || !farming.farmedAmount || farming.farmedAmount <= 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isClaimLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Claim {farming.farmedAmount?.toFixed(9) || '0.000000000'} LOVE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}