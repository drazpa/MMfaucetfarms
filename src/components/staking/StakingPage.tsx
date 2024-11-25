import React, { useState, useEffect } from 'react';
import { Banknote, AlertCircle, Clock, TrendingUp, Lock, Unlock } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useStaking } from '../../hooks/useStaking';
import { formatDistanceToNow } from 'date-fns';
import { formatEther, parseEther } from 'viem';

export default function StakingPage() {
  const { balance } = useTokenContract();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    stakeInfo,
    stake,
    unstake,
    claimRewards,
    isUnstaking,
    isClaiming,
    isApproving,
  } = useStaking();

  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<string>('');
  const [isStaking, setIsStaking] = useState(false);

  useEffect(() => {
    const updateTimeUntilNextClaim = () => {
      if (stakeInfo.lastClaimTime === 0n) return;

      const nextClaimTime = Number(stakeInfo.lastClaimTime) + 60 * 1000; // 1 minute in milliseconds
      const now = Date.now();

      if (now >= nextClaimTime) {
        setTimeUntilNextClaim('');
        return;
      }

      setTimeUntilNextClaim(formatDistanceToNow(nextClaimTime, { addSuffix: true }));
    };

    const timer = setInterval(updateTimeUntilNextClaim, 1000);
    updateTimeUntilNextClaim();

    return () => clearInterval(timer);
  }, [stakeInfo.lastClaimTime]);

  const handleStake = async () => {
    try {
      setError('');
      setSuccess('');
      setIsStaking(true);
      
      if (!amount || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (parseFloat(amount) > parseFloat(balance)) {
        setError('Insufficient balance');
        return;
      }

      // Convert amount to BigInt with proper decimals
      const amountBigInt = parseEther(amount);
      
      await stake(amountBigInt);
      setSuccess('Successfully staked LOVE tokens!');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to stake tokens');
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    try {
      setError('');
      setSuccess('');
      await unstake();
      setSuccess('Successfully unstaked LOVE tokens!');
    } catch (err: any) {
      setError(err.message || 'Failed to unstake tokens');
    }
  };

  const handleClaim = async () => {
    try {
      setError('');
      setSuccess('');
      await claimRewards();
      setSuccess('Successfully claimed rewards!');
    } catch (err: any) {
      setError(err.message || 'Failed to claim rewards');
    }
  };

  const stakedAmount = formatEther(stakeInfo.stakedAmount);
  const pendingRewards = formatEther(stakeInfo.pendingRewards);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-center gap-3 mb-8">
            <Banknote className="w-8 h-8 text-pink-600" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">LOVE Staking</h1>
              <p className="text-gray-600">Stake your LOVE tokens and earn 100% APY</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Staked Amount */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Staked Amount</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stakedAmount} LOVE</p>
            </div>

            {/* Pending Rewards */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Pending Rewards</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{pendingRewards} LOVE</p>
              {timeUntilNextClaim && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  Next claim {timeUntilNextClaim}
                </p>
              )}
            </div>

            {/* APY */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Annual Yield</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">100% APY</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Stake Form */}
            <div className="card bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Stake LOVE</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Stake
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter amount"
                      min="0"
                      step="any"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      LOVE
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Available: {balance} LOVE
                  </p>
                </div>

                <button
                  onClick={handleStake}
                  disabled={isStaking || isApproving}
                  className={`button-primary w-full ${
                    (isStaking || isApproving) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isApproving ? 'Approving...' : isStaking ? 'Staking...' : 'Stake LOVE'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleClaim}
                disabled={isClaiming || Number(pendingRewards) === 0}
                className={`button-primary flex-1 ${
                  (isClaiming || Number(pendingRewards) === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </button>

              <button
                onClick={handleUnstake}
                disabled={isUnstaking || Number(stakedAmount) === 0}
                className={`button-secondary flex-1 ${
                  (isUnstaking || Number(stakedAmount) === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUnstaking ? 'Unstaking...' : 'Unstake All'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}