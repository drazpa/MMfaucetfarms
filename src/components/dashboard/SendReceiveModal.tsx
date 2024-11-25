import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import QrReader from 'react-qr-scanner';
import { X, Copy, Check, QrCode, Send, Wallet, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useWallet } from '../../hooks/useWallet';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther } from 'viem';
import LOVETokenABI from '../../contracts/abis/LOVEToken.json';
import { LOVE_TOKEN_ADDRESS } from '../../config/contracts';
import { useTokenContract } from '../../hooks/useTokenContract';

interface SendReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'send' | 'receive';
}

export default function SendReceiveModal({ isOpen, onClose, mode }: SendReceiveModalProps) {
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const { address } = useWallet();
  const { addTransaction } = useStore();
  const { balance } = useTokenContract();

  // Prepare transfer configuration
  const { config: transferConfig } = usePrepareContractWrite({
    address: LOVE_TOKEN_ADDRESS,
    abi: LOVETokenABI.abi,
    functionName: 'transfer',
    args: recipientAddress && amount ? [
      recipientAddress,
      parseEther(amount)
    ] : undefined,
    enabled: Boolean(recipientAddress && amount && parseFloat(amount) > 0),
  });

  // Get transfer function
  const { write: transfer, data: transferData } = useContractWrite(transferConfig);

  // Wait for transaction
  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: transferData?.hash,
    onSuccess() {
      if (transferData?.hash) {
        addTransaction({
          id: transferData.hash,
          type: 'send',
          amount: parseFloat(amount),
          timestamp: new Date().toISOString(),
          description: 'Sent LOVE tokens',
          from: address || '',
          to: recipientAddress,
        });
        onClose();
        setAmount('');
        setRecipientAddress('');
        setError('');
      }
    },
    onError(error) {
      setError(error.message || 'Transaction failed');
    },
  });

  const handleScan = (data: any) => {
    if (data) {
      setRecipientAddress(data.text);
      setShowScanner(false);
    }
  };

  const handleError = (err: any) => {
    console.error('QR scan error:', err);
    setError('Failed to scan QR code');
  };

  const copyToClipboard = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        setError('Failed to copy address');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recipientAddress) {
      setError('Please enter recipient address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    try {
      transfer?.();
    } catch (err: any) {
      console.error('Transfer error:', err);
      setError(err.message || 'Failed to send LOVE tokens');
    }
  };

  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(balance);
  const canSubmit = recipientAddress && isValidAmount && !isTransactionPending && transfer;

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

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {mode === 'send' ? (
            <>
              <Send className="w-5 h-5 text-pink-600" />
              Send LOVE
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 text-pink-600" />
              Receive LOVE
            </>
          )}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'receive' ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-lg">
                <QRCodeSVG
                  value={address || ''}
                  size={200}
                  level="H"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={address || ''}
                readOnly
                className="flex-1 bg-transparent text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>Current Balance: {balance} LOVE</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Address
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <QrCode className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {showScanner && (
              <div className="relative">
                <QrReader
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: '100%' }}
                />
                <button
                  onClick={() => setShowScanner(false)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount of LOVE"
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

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full button-primary flex items-center justify-center gap-2 ${
                !canSubmit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isTransactionPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send LOVE
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}