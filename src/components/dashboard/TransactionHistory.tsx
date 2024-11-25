import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDistanceToNow } from 'date-fns';

export default function TransactionHistory() {
  const { transactions, bestFriends } = useStore();

  const getPolyscanUrl = (txHash: string) => {
    return `https://polygonscan.com/tx/${txHash}`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderAddressWithFriend = (address: string) => {
    const friend = bestFriends.find(f => f.address.toLowerCase() === address?.toLowerCase());
    if (friend) {
      return (
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-600" />
          <span>{friend.name}</span>
          <span className="text-gray-400">({truncateAddress(address)})</span>
        </span>
      );
    }
    return truncateAddress(address);
  };

  // Create a unique list of transactions by id
  const uniqueTransactions = transactions.reduce((acc, tx) => {
    if (!acc.find(t => t.id === tx.id)) {
      acc.push(tx);
    }
    return acc;
  }, [] as typeof transactions);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-auto">
      <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>

      <div className="space-y-4">
        {uniqueTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                tx.type === 'receive' ? 'bg-green-100' : 'bg-pink-100'
              }`}>
                {tx.type === 'receive' ? (
                  <ArrowDownLeft className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-pink-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{tx.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">
                    {formatDistanceToNow(new Date(tx.timestamp))} ago
                  </span>
                  <a 
                    href={getPolyscanUrl(tx.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700 flex items-center gap-1 whitespace-nowrap"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Polyscan
                  </a>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
              <p className={`font-semibold text-sm whitespace-nowrap ${
                tx.type === 'receive' ? 'text-green-600' : 'text-pink-600'
              }`}>
                {tx.type === 'receive' ? '+' : '-'}{tx.amount} LOVE
              </p>
              <span className="text-xs text-gray-500">
                {tx.type === 'receive' ? 'From: ' : 'To: '}
                {tx.type === 'receive' 
                  ? renderAddressWithFriend(tx.from || '')
                  : renderAddressWithFriend(tx.to || '')}
              </span>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );
}