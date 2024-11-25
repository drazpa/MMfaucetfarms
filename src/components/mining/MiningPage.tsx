import React, { useState, useEffect } from 'react';
import { Pickaxe, AlertCircle, Clock, TrendingUp, Play, Pause, Zap } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';
import { useStore } from '../../store/useStore';
import MiningAnimation from './MiningAnimation';

const ISSUER_ADDRESS = '0x18B37183Bad87852cAA2Bc5C899e176eA74E2505';
const BASE_MINING_RATE = 0.000000001 / 1000; // Base amount mined per millisecond
const RATE_UPGRADE_COST = 1000; // LOVE tokens per upgrade
const RATE_UPGRADE_AMOUNT = 0.000000000001; // Amount increased per upgrade
const UPDATE_INTERVAL = 10; // Update every 10ms for smooth animation

export default function MiningPage() {
  const { mining, setMiningStatus, setMiningStartTime, setMinedAmount, resetMining } = useStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { balance } = useTokenContract();
  const { addTransaction } = useStore();
  const [displayAmount, setDisplayAmount] = useState('0.000000000');
  const [miningRate, setMiningRate] = useState(BASE_MINING_RATE);
  const [upgradeLevel, setUpgradeLevel] = useState(0);
  const [miningStats, setMiningStats] = useState({
    totalMined: 0,
    sessionStart: null as number | null,
    longestSession: 0,
    totalSessions: 0,
    totalUpgrades: 0,
  });

  // Load mining stats and upgrades from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('miningStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setMiningStats(stats);
      // Restore upgrade level and mining rate
      setUpgradeLevel(stats.totalUpgrades || 0);
      setMiningRate(BASE_MINING_RATE + (stats.totalUpgrades || 0) * RATE_UPGRADE_AMOUNT);
    }
  }, []);

  // Update mined amount in real-time with millisecond precision
  useEffect(() => {
    if (!mining.isActive || !mining.startTime) {
      setDisplayAmount('0.000000000');
      return;
    }

    const timer = setInterval(() => {
      const elapsedMilliseconds = Date.now() - mining.startTime;
      const amount = elapsedMilliseconds * miningRate;
      setMinedAmount(amount);
      setDisplayAmount(amount.toFixed(12));
    }, UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, [mining.isActive, mining.startTime, miningRate, setMinedAmount]);

  // Prepare upgrade transaction
  const { config: upgradeConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: [ISSUER_ADDRESS, parseEther(RATE_UPGRADE_COST.toString())],
    enabled: parseFloat(balance) >= RATE_UPGRADE_COST,
  });

  // Get upgrade function
  const { write: upgrade, data: upgradeData } = useContractWrite(upgradeConfig);

  // Wait for upgrade transaction
  const { isLoading: isUpgrading } = useWaitForTransaction({
    hash: upgradeData?.hash,
    onSuccess() {
      if (upgradeData?.hash) {
        // Update mining rate and stats
        const newUpgradeLevel = upgradeLevel + 1;
        setUpgradeLevel(newUpgradeLevel);
        setMiningRate(BASE_MINING_RATE + newUpgradeLevel * RATE_UPGRADE_AMOUNT);
        
        const newStats = {
          ...miningStats,
          totalUpgrades: (miningStats.totalUpgrades || 0) + 1,
        };
        setMiningStats(newStats);
        localStorage.setItem('miningStats', JSON.stringify(newStats));

        // Add transaction record
        addTransaction({
          id: upgradeData.hash,
          type: 'send',
          amount: RATE_UPGRADE_COST,
          timestamp: new Date().toISOString(),
          description: 'Mining Rate Upgrade',
          to: ISSUER_ADDRESS,
        });

        setSuccess('Successfully upgraded mining rate!');
      }
    },
    onError(error) {
      setError(error.message || 'Failed to upgrade mining rate');
    },
  });

  // Prepare claim transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: mining.minedAmount ? [ISSUER_ADDRESS, parseEther(mining.minedAmount.toFixed(9))] : undefined,
    enabled: mining.minedAmount > 0,
  });

  // Get claim function
  const { write: claim, data: claimData } = useContractWrite(claimConfig);

  // Wait for claim transaction
  const { isLoading: isClaimLoading } = useWaitForTransaction({
    hash: claimData?.hash,
    onSuccess() {
      if (claimData?.hash) {
        // Update mining stats
        const sessionDuration = mining.startTime ? Date.now() - mining.startTime : 0;
        const newStats = {
          ...miningStats,
          totalMined: miningStats.totalMined + mining.minedAmount,
          sessionStart: null,
          longestSession: Math.max(miningStats.longestSession, sessionDuration),
          totalSessions: miningStats.totalSessions + 1,
        };
        setMiningStats(newStats);
        localStorage.setItem('miningStats', JSON.stringify(newStats));

        // Add transaction record
        addTransaction({
          id: claimData.hash,
          type: 'receive',
          amount: mining.minedAmount,
          timestamp: new Date().toISOString(),
          description: 'Claimed mined LOVE tokens',
          from: ISSUER_ADDRESS,
        });

        setSuccess(`Successfully claimed ${mining.minedAmount.toFixed(9)} LOVE!`);
        resetMining();
        setDisplayAmount('0.000000000');
      }
    },
    onError(error) {
      setError(error.message || 'Failed to claim tokens');
    },
  });

  const handleStartMining = () => {
    setError('');
    setSuccess('');
    setMiningStatus(true);
    setMiningStartTime(Date.now());
    setMiningStats(prev => ({
      ...prev,
      sessionStart: Date.now(),
    }));
  };

  const handleStopMining = () => {
    setMiningStatus(false);
    setMiningStats(prev => ({
      ...prev,
      sessionStart: null,
    }));
  };

  const handleUpgrade = async () => {
    try {
      setError('');
      if (!upgrade) {
        throw new Error('Upgrade not available');
      }
      if (parseFloat(balance) < RATE_UPGRADE_COST) {
        throw new Error(`Insufficient balance. Need ${RATE_UPGRADE_COST} LOVE`);
      }
      await upgrade();
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.message || 'Failed to upgrade mining rate');
    }
  };

  const handleClaim = async () => {
    try {
      setError('');
      if (!claim) {
        throw new Error('Claim not available');
      }
      if (!mining.minedAmount || mining.minedAmount <= 0) {
        throw new Error('No LOVE to claim');
      }
      if (mining.isActive) {
        throw new Error('Please stop mining before claiming');
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
            <Pickaxe className="w-8 h-8 text-pink-600" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">LOVE Mining</h1>
              <p className="text-gray-600">Mine LOVE tokens in real-time</p>
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

          {/* Mining Animation */}
          {mining.isActive && (
            <div className="mb-8">
              <MiningAnimation />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Mining Session */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Current Session</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {displayAmount} LOVE
              </p>
              {mining.startTime && (
                <p className="text-sm text-gray-500 mt-1">
                  Mining for {((Date.now() - mining.startTime) / 1000).toFixed(3)}s
                </p>
              )}
            </div>

            {/* Mining Rate */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Mining Rate</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {miningRate.toFixed(12)} LOVE/ms
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Level {upgradeLevel} Miner
              </p>
            </div>

            {/* Total Mined */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Pickaxe className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Total Mined</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 font-mono">
                {miningStats.totalMined.toFixed(9)} LOVE
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {miningStats.totalSessions} sessions
              </p>
            </div>
          </div>

          {/* Mining Rate Upgrade */}
          <div className="card bg-gray-50 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-semibold">Mining Rate Upgrade</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Increase mining rate by {RATE_UPGRADE_AMOUNT.toFixed(12)} LOVE/ms
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Cost: {RATE_UPGRADE_COST} LOVE
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading || parseFloat(balance) < RATE_UPGRADE_COST}
                className={`button-primary flex items-center gap-2 ${
                  (isUpgrading || parseFloat(balance) < RATE_UPGRADE_COST) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUpgrading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Upgrade Rate
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-600">
              Mining must be stopped before claiming rewards
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={mining.isActive ? handleStopMining : handleStartMining}
              className={`button-primary flex-1 flex items-center justify-center gap-2`}
            >
              {mining.isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Mining
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Mining
                </>
              )}
            </button>

            <button
              onClick={handleClaim}
              disabled={isClaimLoading || mining.isActive || !mining.minedAmount || mining.minedAmount <= 0}
              className={`button-primary flex-1 flex items-center justify-center gap-2 ${
                (isClaimLoading || mining.isActive || !mining.minedAmount || mining.minedAmount <= 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isClaimLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Claim {mining.minedAmount?.toFixed(9) || '0.000000000'} LOVE
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}