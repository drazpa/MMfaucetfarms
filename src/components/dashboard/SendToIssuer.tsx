import React, { useState } from 'react';
import { Heart, Send, AlertCircle } from 'lucide-react';
import { useTokenContract } from '../../hooks/useTokenContract';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';
import { useStore } from '../../store/useStore';

const ISSUER_ADDRESS = '0x18B37183Bad87852cAA2Bc5C899e176eA74E2505';

export default function SendToIssuer() {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { balance } = useTokenContract();
  const { addTransaction } = useStore();

  // Prepare transfer configuration
  const { config: transferConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: amount ? [ISSUER_ADDRESS, parseEther(amount)] : undefined,
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
          description: memo || 'Sent to LOVE Issuer',
          to: ISSUER_ADDRESS,
        });
        setSuccess('Successfully sent LOVE tokens to issuer!');
        setAmount('');
        setMemo('');
        setError('');
      }
    },
    onError(error) {
      setError(error.message || 'Transaction failed');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    if (!memo.trim()) {
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

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-pink-600" />
        <div>
          <h2 className="text-xl font-semibold">Send to LOVE Issuer</h2>
          <p className="text-sm text-gray-500">Support the LOVE ecosystem</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
          <Heart className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount of LOVE
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason for Sending
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Enter your reason"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full button-primary flex items-center justify-center gap-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send to Issuer
            </>
          )}
        </button>
      </form>
    </div>
  );
}