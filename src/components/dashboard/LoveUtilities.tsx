import React, { useState } from 'react';
import { Gift, Award, Heart, Coins, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import SendToIssuer from './SendToIssuer';

export default function LoveUtilities() {
  const { user, addTransaction } = useStore();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleAction = (id: string, cost?: number) => {
    if (!user) return;

    const showMessage = (message: string) => {
      setAlertMessage(message);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    switch (id) {
      case 'send':
        if (user.balance >= 100) {
          addTransaction({
            id: Date.now().toString(),
            type: 'send',
            amount: 100,
            timestamp: new Date().toISOString(),
            description: 'Sent LOVE tokens',
            to: 'Friend',
          });
          showMessage('Successfully sent 100 LOVE tokens!');
        } else {
          showMessage('Insufficient balance!');
        }
        break;
      case 'challenges':
        showMessage('Daily challenges updated!');
        break;
      case 'charity':
        if (user.balance >= 50) {
          addTransaction({
            id: Date.now().toString(),
            type: 'send',
            amount: 50,
            timestamp: new Date().toISOString(),
            description: 'Donated to LOVE Fund',
            to: 'Charity Pool',
          });
          showMessage('Thank you for your donation!');
        } else {
          showMessage('Insufficient balance for donation!');
        }
        break;
      case 'rewards':
        if (user.balance >= 200) {
          addTransaction({
            id: Date.now().toString(),
            type: 'purchase',
            amount: 200,
            timestamp: new Date().toISOString(),
            description: 'Purchased reward item',
          });
          showMessage('Reward purchased successfully!');
        } else {
          showMessage('Insufficient balance for purchase!');
        }
        break;
    }
  };

  return (
    <div className="relative space-y-6">
      {showAlert && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-4">
          <div className="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-float">
            <AlertCircle className="w-5 h-5 text-pink-600" />
            <span>{alertMessage}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Send to Issuer Card */}
        <SendToIssuer />

        {/* Other Utilities */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 gradient-text">
            LOVE Token Utilities
          </h2>
          <div className="space-y-4">
            {utilities.map((utility) => (
              <div
                key={utility.id}
                className="p-4 gradient-border rounded-lg hover-scale glow-effect-intense"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${utility.gradient}`}>
                    {utility.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{utility.title}</h3>
                    <p className="text-sm text-gray-500">{utility.description}</p>
                    {utility.cost && (
                      <p className="text-xs text-pink-600 mt-1">Cost: {utility.cost} LOVE</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleAction(utility.id)}
                    className="button-primary"
                  >
                    {utility.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const utilities = [
  {
    id: 'challenges',
    title: 'Daily Challenges',
    description: 'Complete tasks to earn LOVE',
    icon: <Award className="w-5 h-5 text-purple-600" />,
    action: 'View',
    gradient: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    id: 'charity',
    title: 'LOVE Fund',
    description: 'Support community projects',
    icon: <Heart className="w-5 h-5 text-red-600" />,
    action: 'Donate',
    gradient: 'from-red-500/20 to-orange-500/20',
    cost: 50,
  },
  {
    id: 'rewards',
    title: 'LOVE Shop',
    description: 'Spend tokens on rewards',
    icon: <Coins className="w-5 h-5 text-yellow-600" />,
    action: 'Shop',
    gradient: 'from-yellow-500/20 to-amber-500/20',
    cost: 200,
  },
];