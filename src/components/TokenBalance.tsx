import React, { useState } from 'react';
import { Coins, Send, Wallet } from 'lucide-react';
import SendReceiveModal from './dashboard/SendReceiveModal';

interface TokenBalanceProps {
  balance: number;
}

export default function TokenBalance({ balance }: TokenBalanceProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'send' | 'receive'>('send');

  const handleSend = () => {
    setModalMode('send');
    setShowModal(true);
  };

  const handleReceive = () => {
    setModalMode('receive');
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 glow-effect-intense">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your LOVE Balance</h2>
            <p className="text-sm text-gray-500 mt-1">Available to send or receive</p>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-pink-600" />
            <span className="text-2xl font-bold gradient-text">{balance}</span>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleSend}
            className="flex-1 button-primary flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send LOVE
          </button>
          <button 
            onClick={handleReceive}
            className="flex-1 button-secondary flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Receive LOVE
          </button>
        </div>
      </div>

      <SendReceiveModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </>
  );
}