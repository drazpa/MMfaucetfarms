import React from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';
import { AlertCircle } from 'lucide-react';
import { polygon } from '../config/networks';

export default function NetworkSelector() {
  const { chain } = useNetwork();
  const { switchNetwork, isLoading } = useSwitchNetwork();

  const isPolygon = chain?.id === polygon.id;

  const handleSwitchNetwork = () => {
    if (switchNetwork) {
      switchNetwork(polygon.id);
    }
  };

  if (!chain) return null;

  return (
    <>
      {!isPolygon && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Wrong Network</p>
              <p className="text-sm">Please switch to Polygon Network to use LOVE tokens</p>
            </div>
            <button
              onClick={handleSwitchNetwork}
              disabled={isLoading}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {isLoading ? 'Switching...' : 'Switch to Polygon'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            isPolygon ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium">
            {isPolygon ? 'Polygon' : chain.name}
          </span>
        </div>
      </div>
    </>
  );
}