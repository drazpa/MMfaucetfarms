import React, { useState } from 'react';
import { Send, Wallet, QrCode, DollarSign } from 'lucide-react';
import { useStore } from '../../store/useStore';
import SendReceiveModal from './SendReceiveModal';
import { useBalances } from '../../hooks/useBalances';

export default function SendReceiveCard() {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'send' | 'receive'>('send');
  const { user } = useStore();
  const balances = useBalances();

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
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold gradient-text">Quick Actions</h2>
            <p className="text-sm text-gray-500">Send or receive tokens</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-bold gradient-text">
                {balances.love.balance} LOVE
              </span>
              <span className="text-sm text-gray-500">
                ({balances.love.usdValue})
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="text-sm font-medium text-gray-700">
                {balances.matic.balance} POL
              </span>
              <span className="text-xs text-gray-500">
                ({balances.matic.usdValue})
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Total Value: {balances.total.usdValue}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSend}
            className="p-6 gradient-border rounded-lg hover-scale glow-effect-intense flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-red-500/20">
              <Send className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Send LOVE</h3>
              <p className="text-sm text-gray-500">Transfer tokens to others</p>
            </div>
          </button>

          <button
            onClick={handleReceive}
            className="p-6 gradient-border rounded-lg hover-scale glow-effect-intense flex items-center gap-4"
          >
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">Receive LOVE</h3>
              <p className="text-sm text-gray-500">Get your wallet QR code</p>
            </div>
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>Exchange Rate: 1 LOVE = $0.0001 USD</span>
          </div>
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