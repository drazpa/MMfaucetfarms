import React from 'react';
import Stats from './Stats';
import TransactionHistory from './TransactionHistory';
import SendReceiveCard from './SendReceiveCard';
import BestFriendsSend from './BestFriendsSend';
import LoveUtilities from './LoveUtilities';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Top Section - Send/Receive */}
      <SendReceiveCard />

      {/* Stats Section */}
      <Stats />

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Best Friends */}
        <div className="col-span-4">
          <BestFriendsSend />
        </div>

        {/* Middle Column - Transaction History */}
        <div className="col-span-8">
          <TransactionHistory />
        </div>
      </div>

      {/* Bottom Section - LOVE Utilities */}
      <LoveUtilities />
    </div>
  );
}