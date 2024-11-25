import React from 'react';
import { Trophy, Heart, Star } from 'lucide-react';

export default function LoveLeaderboard() {
  const leaders = [
    {
      rank: 1,
      name: 'Sarah K.',
      score: 15000,
    },
    {
      rank: 2,
      name: 'Michael R.',
      score: 12500,
    },
    {
      rank: 3,
      name: 'Emma L.',
      score: 10000,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-auto">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-xl font-semibold">LOVE Leaderboard</h2>
      </div>

      <div className="space-y-4">
        {leaders.map((leader) => (
          <div
            key={leader.rank}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <span className="font-bold text-lg text-gray-500">#{leader.rank}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">{leader.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-pink-600" />
              <span className="font-semibold">{leader.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}