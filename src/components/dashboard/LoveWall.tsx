import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

export default function LoveWall() {
  const posts = [
    {
      id: 1,
      author: 'Sarah K.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      content: 'Just donated 100 LOVE to the community garden project! 🌱',
      loves: 24,
      comments: 5,
      shares: 2,
      timestamp: '2h ago',
    },
    {
      id: 2,
      author: 'Michael R.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      content: 'Thank you everyone for the birthday wishes and LOVE tokens! ❤️',
      loves: 45,
      comments: 12,
      shares: 3,
      timestamp: '4h ago',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-auto">
      <h2 className="text-xl font-semibold mb-6">LOVE Wall</h2>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-sm text-gray-500">{post.timestamp}</p>
              </div>
            </div>

            <p className="text-gray-800 mb-4">{post.content}</p>

            <div className="flex items-center gap-6">
              <button className="flex items-center gap-1 text-gray-500 hover:text-pink-600">
                <Heart className="w-4 h-4" />
                <span>{post.loves}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1 text-gray-500 hover:text-green-600">
                <Share2 className="w-4 h-4" />
                <span>{post.shares}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}