import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ActionCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  cost?: number;
  reward?: number;
  onAction: () => void;
}

export default function ActionCard({ title, icon, description, cost, reward, onAction }: ActionCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {cost && (
            <span className="text-pink-600 font-semibold">-{cost} LOVE</span>
          )}
          {reward && (
            <span className="text-green-600 font-semibold">+{reward} LOVE</span>
          )}
          <button 
            onClick={onAction}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}