import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { isAddress } from 'viem';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddFriendModal({ isOpen, onClose }: AddFriendModalProps) {
  const { addBestFriend, bestFriends } = useStore();
  const [friendData, setFriendData] = useState({
    name: '',
    address: '',
  });
  const [error, setError] = useState('');

  const validateAddress = (address: string) => {
    if (!isAddress(address)) {
      return 'Invalid wallet address';
    }
    if (bestFriends.some(friend => friend.address.toLowerCase() === address.toLowerCase())) {
      return 'This address is already in your best friends list';
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (friendData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    // Validate address
    const addressError = validateAddress(friendData.address);
    if (addressError) {
      setError(addressError);
      return;
    }

    addBestFriend({
      name: friendData.name.trim(),
      address: friendData.address,
    });
    onClose();
    setFriendData({ name: '', address: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative animate-float">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-6 h-6 text-pink-600" />
          <h2 className="text-xl font-semibold">Add Best Friend</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Friend's Name
            </label>
            <input
              type="text"
              value={friendData.name}
              onChange={(e) => setFriendData({ ...friendData, name: e.target.value })}
              placeholder="Enter friend's name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              value={friendData.address}
              onChange={(e) => setFriendData({ ...friendData, address: e.target.value })}
              placeholder="Enter wallet address"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full button-primary flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
        </form>
      </div>
    </div>
  );
}