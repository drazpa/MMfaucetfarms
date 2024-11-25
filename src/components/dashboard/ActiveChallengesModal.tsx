import React, { useState } from 'react';
import { X, Plus, Trophy, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface ActiveChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ActiveChallengesModal({ isOpen, onClose }: ActiveChallengesModalProps) {
  const { challenges, activeChallenges, toggleChallenge, addTransaction } = useStore();
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    reward: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Date.now().toString();
    const challenge = {
      id,
      title: newChallenge.title,
      description: newChallenge.description,
      reward: parseInt(newChallenge.reward),
      type: 'daily',
      progress: 0,
      target: 100,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // Add challenge and automatically activate it
    toggleChallenge(id);
    setNewChallenge({ title: '', description: '', reward: '' });
  };

  const handlePayChallenge = (challengeId: string, reward: number) => {
    addTransaction({
      id: Date.now().toString(),
      type: 'send',
      amount: reward,
      timestamp: new Date().toISOString(),
      description: 'Challenge Reward Payment',
      to: 'Challenge Pool',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold">Manage Active Challenges</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Active Challenges List */}
          <div>
            <h3 className="font-medium mb-4">Current Challenges</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-pink-200 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-gray-500">{challenge.description}</p>
                    </div>
                    <span className="text-pink-600 font-semibold">
                      +{challenge.reward} LOVE
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleChallenge(challenge.id)}
                      className={`flex-1 px-3 py-1 rounded-lg text-sm ${
                        activeChallenges.includes(challenge.id)
                          ? 'bg-pink-600 text-white'
                          : 'border border-pink-600 text-pink-600'
                      }`}
                    >
                      {activeChallenges.includes(challenge.id)
                        ? 'Remove'
                        : 'Add to Active'}
                    </button>
                    {activeChallenges.includes(challenge.id) && (
                      <button
                        onClick={() => handlePayChallenge(challenge.id, challenge.reward)}
                        className="px-3 py-1 rounded-lg text-sm bg-green-600 text-white"
                      >
                        Pay {challenge.reward} LOVE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Challenge Form */}
          <div>
            <h3 className="font-medium mb-4">Create New Challenge</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Challenge Title
                </label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LOVE Reward
                </label>
                <input
                  type="number"
                  value={newChallenge.reward}
                  onChange={(e) =>
                    setNewChallenge({ ...newChallenge, reward: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full button-primary flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Challenge
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}