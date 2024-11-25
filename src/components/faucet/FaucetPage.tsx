import React, { useState, useEffect } from 'react';
import { Droplets, AlertCircle, Clock } from 'lucide-react';
import { useFaucet } from '../../hooks/useFaucet';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';

export default function FaucetPage() {
  const { claimTokens, isLoading } = useFaucet();
  const { address } = useAccount();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Load last claim time from localStorage
    if (address) {
      const savedLastClaim = localStorage.getItem(`lastClaim_${address}`);
      if (savedLastClaim) {
        setLastClaim(parseInt(savedLastClaim));
      }
    }
  }, [address]);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!lastClaim) return;

      const now = Date.now();
      const nextClaimTime = lastClaim + 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (now >= nextClaimTime) {
        setTimeRemaining('');
        return;
      }

      const remaining = formatDistanceToNow(nextClaimTime, { addSuffix: true });
      setTimeRemaining(remaining);
    };

    const timer = setInterval(updateTimeRemaining, 1000);
    updateTimeRemaining();

    return () => clearInterval(timer);
  }, [lastClaim]);

  const canClaim = !lastClaim || Date.now() >= lastClaim + 24 * 60 * 60 * 1000;

  const handleClaim = async () => {
    try {
      setError('');
      setSuccess('');
      await claimTokens();
      
      // Update last claim time
      const now = Date.now();
      setLastClaim(now);
      if (address) {
        localStorage.setItem(`lastClaim_${address}`, now.toString());
      }
      
      setSuccess('Successfully claimed 5 LOVE tokens!');
    } catch (err: any) {
      setError(err.message || 'Failed to claim tokens');
    }
  };

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="card text-center p-8">
            <p className="text-gray-600">Please connect your wallet to claim LOVE tokens</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
              <Droplets className="w-10 h-10 text-pink-600" />
            </div>

            <h2 className="text-xl font-semibold mb-2">Claim LOVE Tokens</h2>
            <p className="text-gray-600 mb-6 text-center">
              Get 5 LOVE tokens every 24 hours
            </p>

            {error && (
              <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="w-full mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-center">
                {success}
              </div>
            )}

            {!canClaim && timeRemaining && (
              <div className="w-full mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Next claim available {timeRemaining}</span>
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={isLoading || !canClaim}
              className={`button-primary w-full max-w-sm flex items-center justify-center gap-2 ${
                (isLoading || !canClaim) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Droplets className="w-5 h-5" />
                  {canClaim ? 'Claim 5 LOVE' : 'Claim Cooldown'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}