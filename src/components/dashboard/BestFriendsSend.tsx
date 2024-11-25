import React, { useState } from 'react';
import { Heart, Send, UserPlus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import AddFriendModal from './AddFriendModal';
import { BestFriend } from '../../types';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';

interface QuickSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: BestFriend;
}

function QuickSendModal({ isOpen, onClose, friend }: QuickSendModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const { addTransaction } = useStore();
  const { balance } = useTokenContract();

  // Prepare transfer configuration
  const { config: transferConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: amount ? [friend.address, parseEther(amount)] : undefined,
    enabled: Boolean(amount && parseFloat(amount) > 0),
  });

  // Get transfer function
  const { write: transfer, data: transferData } = useContractWrite(transferConfig);

  // Wait for transaction
  const { isLoading } = useWaitForTransaction({
    hash: transferData?.hash,
    onSuccess() {
      if (transferData?.hash) {
        addTransaction({
          id: transferData.hash,
          type: 'send',
          amount: parseFloat(amount),
          timestamp: new Date().toISOString(),
          description: reason || `Sent to ${friend.name}`,
          to: friend.address,
        });
        onClose();
        setAmount('');
        setReason('');
        setError('');
      }
    },
    onError(error) {
      setError(error.message || 'Transaction failed');
    },
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for sending');
      return;
    }

    try {
      transfer?.();
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Failed to send LOVE tokens');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative animate-float">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Send LOVE to {friend.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{friend.address}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount of LOVE
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min="0"
                step="any"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                LOVE
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Available: {balance} LOVE
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Sending
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 button-primary flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send LOVE
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  friend: BestFriend;
}

function EditFriendModal({ isOpen, onClose, friend }: EditFriendModalProps) {
  const { updateBestFriend } = useStore();
  const [name, setName] = useState(friend.name);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    updateBestFriend(friend.address, { name: name.trim() });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md relative animate-float">
        <h2 className="text-xl font-semibold mb-4">Edit Best Friend</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Friend's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600 font-mono text-sm">
              {friend.address}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 button-primary"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BestFriendsSend() {
  const { bestFriends, removeBestFriend } = useStore();
  const [selectedFriend, setSelectedFriend] = useState<BestFriend | null>(null);
  const [editingFriend, setEditingFriend] = useState<BestFriend | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (address: string) => {
    removeBestFriend(address);
    setShowDeleteConfirm(null);
  };

  return (
    <>
      <div className="card h-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-semibold">Best Friends</h2>
          </div>
          <button
            onClick={() => setShowAddFriend(true)}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors text-pink-600"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {bestFriends.map((friend) => (
            <div
              key={friend.address}
              className="p-4 gradient-border rounded-lg hover-scale glow-effect-intense"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium">{friend.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingFriend(friend)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setSelectedFriend(friend)}
                    className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4 text-pink-600" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(friend.address)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 font-mono truncate">{friend.address}</p>

              {showDeleteConfirm === friend.address && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-600">Remove this friend?</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(friend.address)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {bestFriends.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No best friends added yet
            </p>
          )}
        </div>
      </div>

      {selectedFriend && (
        <QuickSendModal
          isOpen={true}
          onClose={() => setSelectedFriend(null)}
          friend={selectedFriend}
        />
      )}

      {editingFriend && (
        <EditFriendModal
          isOpen={true}
          onClose={() => setEditingFriend(null)}
          friend={editingFriend}
        />
      )}

      <AddFriendModal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />
    </>
  );
}