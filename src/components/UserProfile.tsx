import React from 'react';
import { User, Star } from 'lucide-react';

interface UserProfileProps {
  name: string;
  level: number;
  avatar: string;
}

export default function UserProfile({ name, level, avatar }: UserProfileProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col items-center">
        <div className="relative">
          <img 
            src={avatar} 
            alt={name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="absolute -bottom-2 -right-2 bg-pink-600 text-white p-2 rounded-full">
            <Star className="w-4 h-4" />
          </div>
        </div>
        
        <h2 className="mt-4 text-xl font-semibold text-gray-800">{name}</h2>
        <p className="text-sm text-gray-500">Level {level} Member</p>
        
        <div className="mt-6 w-full space-y-4">
          <button className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
            Edit Profile
          </button>
          <button className="w-full border border-pink-600 text-pink-600 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors">
            View History
          </button>
        </div>
      </div>
    </div>
  );
}