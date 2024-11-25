import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NicknameModalProps {
  onSubmit: (nickname: string) => void;
  onClose: () => void;
}

export default function NicknameModal({ onSubmit, onClose }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nickname.length < 3) {
      setError('Nickname must be at least 3 characters long');
      return;
    }

    onSubmit(nickname);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Choose Your Nickname</h2>
        <p className="text-gray-600 mb-6">
          This nickname will be associated with your wallet address
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Set Nickname
          </button>
        </form>
      </div>
    </div>
  );
}