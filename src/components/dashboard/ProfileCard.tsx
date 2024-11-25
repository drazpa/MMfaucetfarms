import React from 'react';
import { Heart, Star, UserPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import AddFriendModal from './AddFriendModal';

export default function ProfileCard() {
  const { user } = useStore();
  const [showAddFriend, setShowAddFriend] = React.useState(false);

  if (!user) return null;

  return (
    <>
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white p-1.5 rounded-full">
              <Star className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold gradient-text">{user.nickname}</h2>
            <p className="text-sm text-gray-500">Level {user.level}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {user.bestFriends?.map((friend) => (
            <div
              key={friend.address}
              className="flex items-center gap-2 p-2 rounded-lg gradient-border"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{friend.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddFriend(true)}
          className="w-full button-secondary flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Best Friend
        </button>
      </div>

      <AddFriendModal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      />
    </>
  );
}