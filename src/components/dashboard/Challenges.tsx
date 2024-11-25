import React from 'react';
import { Trophy, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

export default function Challenges() {
  const { challenges, activeChallenges, toggleChallenge } = useStore();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Active Challenges
        </h2>
      </div>

      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="border border-gray-100 rounded-lg p-4 hover:border-pink-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{challenge.title}</h3>
                <p className="text-sm text-gray-500">{challenge.description}</p>
              </div>
              <div className="text-right">
                <p className="text-pink-600 font-semibold">+{challenge.reward} LOVE</p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(challenge.expiresAt))}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-pink-600 rounded-full h-2"
                  style={{
                    width: `${(challenge.progress / challenge.target) * 100}%`,
                  }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {challenge.progress} / {challenge.target} completed
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}