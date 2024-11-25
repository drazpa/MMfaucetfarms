import React, { useState, useRef, useEffect } from 'react';
import { Trophy, AlertCircle, Heart, History, Award, TrendingUp, Clock } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

const ISSUER_ADDRESS = '0x18B37183Bad87852cAA2Bc5C899e176eA74E2505';
const SPIN_COST = 100;
const SPIN_DURATION = 5; // 5 seconds
const WHEEL_ITEMS = [
  { label: '0 LOVE', value: 0 },
  { label: '200 LOVE', value: 200 },
];

interface GameStats {
  totalSpins: number;
  totalWinnings: number;
  lastWin: number;
  winRate: number;
}

export default function WheelPage() {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { balance } = useTokenContract();
  const { addTransaction } = useStore();
  const [canClaim, setCanClaim] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalSpins: 0,
    totalWinnings: 0,
    lastWin: 0,
    winRate: 0,
  });

  // Load game stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('wheelStats');
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Prepare spin transaction
  const { config: spinConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: [ISSUER_ADDRESS, parseEther(SPIN_COST.toString())],
    enabled: !isSpinning,
  });

  // Get spin function
  const { write: spin, data: spinData } = useContractWrite(spinConfig);

  // Wait for spin transaction
  const { isLoading: isSpinLoading } = useWaitForTransaction({
    hash: spinData?.hash,
    onSuccess() {
      handleSpin();
    },
    onError(error) {
      setError(error.message || 'Spin transaction failed');
      setIsSpinning(false);
    },
  });

  // Prepare claim transaction
  const { config: claimConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: result ? [ISSUER_ADDRESS, parseEther(result.toString())] : undefined,
    enabled: canClaim && result !== null && result > 0,
  });

  // Get claim function
  const { write: claim, data: claimData } = useContractWrite(claimConfig);

  // Wait for claim transaction
  const { isLoading: isClaimLoading } = useWaitForTransaction({
    hash: claimData?.hash,
    onSuccess() {
      if (claimData?.hash && result) {
        addTransaction({
          id: claimData.hash,
          type: 'receive',
          amount: result,
          timestamp: new Date().toISOString(),
          description: 'Won from LOVE Wheel',
          from: ISSUER_ADDRESS,
        });
        setCanClaim(false);
        setSuccess(`Successfully claimed ${result} LOVE!`);
      }
    },
    onError(error) {
      setError(error.message || 'Claim transaction failed');
    },
  });

  const handleSpinClick = async () => {
    if (isSpinning || !spin) return;
    
    setError('');
    setSuccess('');
    setResult(null);
    setCanClaim(false);

    if (parseFloat(balance) < SPIN_COST) {
      setError('Insufficient LOVE balance');
      return;
    }

    try {
      spin();
    } catch (err: any) {
      console.error('Spin error:', err);
      setError(err.message || 'Failed to spin wheel');
    }
  };

  const handleSpin = () => {
    if (!wheelRef.current) return;
    setIsSpinning(true);
    setCountdown(SPIN_DURATION);

    // Random number of full rotations (3-5) plus the winning position
    const fullRotations = (Math.floor(Math.random() * 3) + 3) * 360;
    const winningIndex = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const winningRotation = (winningIndex * (360 / WHEEL_ITEMS.length));
    const totalRotation = fullRotations + winningRotation;

    wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;

    // After spin animation completes (5 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setCountdown(0);
      const prize = WHEEL_ITEMS[winningIndex].value;
      setResult(prize);
      
      // Update game stats
      setGameStats(prev => {
        const newStats = {
          totalSpins: prev.totalSpins + 1,
          totalWinnings: prev.totalWinnings + prize,
          lastWin: prize > 0 ? Date.now() : prev.lastWin,
          winRate: ((prev.totalWinnings + prize) / ((prev.totalSpins + 1) * SPIN_COST) * 100),
        };
        localStorage.setItem('wheelStats', JSON.stringify(newStats));
        return newStats;
      });

      if (prize > 0) {
        setCanClaim(true);
        setSuccess(`Congratulations! You won ${prize} LOVE!`);
      } else {
        setSuccess('Better luck next time!');
      }
    }, SPIN_DURATION * 1000);
  };

  const handleClaim = async () => {
    if (!claim || !result || result <= 0) return;
    try {
      claim();
    } catch (err: any) {
      console.error('Claim error:', err);
      setError(err.message || 'Failed to claim prize');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold">LOVE Wheel</h1>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 rounded-lg flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Game Stats */}
            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Total Spins</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{gameStats.totalSpins}</p>
            </div>

            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Total Winnings</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">{gameStats.totalWinnings} LOVE</p>
            </div>

            <div className="card bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold">Win Rate</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {gameStats.winRate.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="relative w-96 h-96 mx-auto mb-8">
            {/* Countdown Timer */}
            {countdown > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-75 rounded-full w-20 h-20 flex items-center justify-center">
                <div className="text-4xl font-bold text-white flex items-center gap-1">
                  <Clock className="w-6 h-6" />
                  {countdown}
                </div>
              </div>
            )}

            {/* Wheel Container */}
            <div className="absolute inset-0 rounded-full border-8 border-pink-600 overflow-hidden">
              {/* Wheel */}
              <div
                ref={wheelRef}
                className="absolute inset-0 transition-transform duration-[5000ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
              >
                {WHEEL_ITEMS.map((item, index) => {
                  const rotation = (index * 360) / WHEEL_ITEMS.length;
                  return (
                    <div
                      key={index}
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                    >
                      <div 
                        className={`absolute top-0 left-1/2 w-1/2 h-full ${
                          item.value === 0 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      >
                        <div 
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-2xl whitespace-nowrap"
                          style={{
                            transform: `rotate(${90}deg)`,
                          }}
                        >
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Point */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-pink-600 rounded-full z-20" />

            {/* Pointer */}
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-12 h-12 z-10">
              <div className="w-0 h-0 border-t-[24px] border-t-transparent border-b-[24px] border-b-transparent border-l-[48px] border-l-pink-600" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <p>Cost to spin: {SPIN_COST} LOVE</p>
            </div>

            <button
              onClick={handleSpinClick}
              disabled={isSpinning || isSpinLoading}
              className={`button-primary w-full max-w-xs mx-auto ${
                (isSpinning || isSpinLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSpinning || isSpinLoading ? 'Spinning...' : 'Spin Wheel'}
            </button>

            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={isClaimLoading}
                className={`button-primary w-full max-w-xs mx-auto ${
                  isClaimLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isClaimLoading ? 'Claiming...' : 'Claim Prize'}
              </button>
            )}
          </div>

          {gameStats.lastWin > 0 && (
            <div className="mt-6 text-sm text-gray-500">
              Last win: {formatDistanceToNow(gameStats.lastWin, { addSuffix: true })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}