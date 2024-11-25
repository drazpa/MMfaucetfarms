import React from 'react';
import { Coins, Award, TrendingUp, Users, Trophy, Pickaxe, Heart, History } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useStore } from '../../store/useStore';
import { useAccount } from 'wagmi';
import { formatDistanceToNow } from 'date-fns';

export default function Stats() {
  const { balance, tokenMetrics } = useTokenContract();
  const { transactions } = useStore();
  const { address } = useAccount();

  // Load game stats from localStorage
  const wheelStats = JSON.parse(localStorage.getItem('wheelStats') || '{"totalSpins":0,"totalWinnings":0,"lastWin":0,"winRate":0}');
  const miningStats = JSON.parse(localStorage.getItem('miningStats') || '{"totalMined":0,"sessionStart":null,"longestSession":0,"totalSessions":0}');

  // Calculate real-time transaction totals
  const totals = transactions.reduce((acc, tx) => {
    if (tx.type === 'send' && tx.from?.toLowerCase() === address?.toLowerCase()) {
      acc.totalSent += tx.amount;
    }
    if (tx.type === 'receive' && tx.to?.toLowerCase() === address?.toLowerCase()) {
      acc.totalReceived += tx.amount;
    }
    return acc;
  }, { totalSent: 0, totalReceived: 0 });

  // Calculate reputation score based on transaction activity
  const calculateReputationScore = () => {
    const transactionCount = transactions.filter(tx => 
      tx.from?.toLowerCase() === address?.toLowerCase() || 
      tx.to?.toLowerCase() === address?.toLowerCase()
    ).length;

    const baseScore = 100; // Base reputation score
    const transactionBonus = transactionCount * 5; // 5 points per transaction
    const balanceBonus = parseFloat(balance) * 0.1; // 0.1 points per LOVE token held
    const wheelBonus = wheelStats.totalWinnings * 0.5; // 0.5 points per LOVE won
    const miningBonus = miningStats.totalMined * 0.3; // 0.3 points per LOVE mined

    return Math.min(1000, Math.floor(baseScore + transactionBonus + balanceBonus + wheelBonus + miningBonus));
  };

  const reputationScore = calculateReputationScore();

  // Calculate percentage changes
  const balanceChange = tokenMetrics?.balanceChange || 0;
  const reputationChange = tokenMetrics?.reputationChange || 0;
  const sentChange = ((totals.totalSent / (parseFloat(balance) || 1)) * 100).toFixed(1);
  const receivedChange = ((totals.totalReceived / (parseFloat(balance) || 1)) * 100).toFixed(1);

  const stats = [
    {
      title: 'Total Balance',
      value: balance,
      change: balanceChange > 0 ? `+${balanceChange.toFixed(2)}%` : `${balanceChange.toFixed(2)}%`,
      icon: <Coins className="w-6 h-6 text-pink-600" />,
      gradient: 'from-pink-500 to-purple-500',
    },
    {
      title: 'Reputation Score',
      value: reputationScore.toString(),
      change: reputationChange > 0 ? `+${reputationChange.toFixed(2)}%` : `${reputationChange.toFixed(2)}%`,
      icon: <Award className="w-6 h-6 text-purple-600" />,
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Total Sent',
      value: totals.totalSent.toFixed(2),
      percentage: `${sentChange}%`,
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Total Received',
      value: totals.totalReceived.toFixed(2),
      percentage: `${receivedChange}%`,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      gradient: 'from-blue-500 to-cyan-500',
    },
    // Wheel Stats
    {
      title: 'Wheel Spins',
      value: wheelStats.totalSpins.toString(),
      icon: <Trophy className="w-6 h-6 text-yellow-600" />,
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      title: 'Wheel Winnings',
      value: `${wheelStats.totalWinnings} LOVE`,
      percentage: `${wheelStats.winRate.toFixed(1)}% Win Rate`,
      icon: <Heart className="w-6 h-6 text-red-600" />,
      gradient: 'from-red-500 to-pink-500',
    },
    // Mining Stats
    {
      title: 'Mining Sessions',
      value: miningStats.totalSessions.toString(),
      icon: <History className="w-6 h-6 text-indigo-600" />,
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Total Mined',
      value: `${miningStats.totalMined.toFixed(9)} LOVE`,
      subtitle: miningStats.sessionStart ? `Current session: ${formatDistanceToNow(miningStats.sessionStart)}` : 'Not mining',
      icon: <Pickaxe className="w-6 h-6 text-orange-600" />,
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="card hover:scale-105 transition-transform duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                {(stat.change || stat.percentage) && (
                  <span className={`text-sm ${
                    (stat.change?.startsWith('+') || parseFloat(stat.percentage || '0') > 0) 
                      ? 'text-green-600' 
                      : 'text-gray-600'
                  }`}>
                    ({stat.change || stat.percentage})
                  </span>
                )}
              </div>
              {stat.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-20`}>
              {stat.icon}
            </div>
          </div>
          {(stat.change || stat.percentage) && (
            <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${stat.gradient}`}
                style={{ 
                  width: stat.percentage || 
                    (stat.change ? `${Math.min(Math.abs(parseFloat(stat.change)), 100)}%` : '75%')
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}