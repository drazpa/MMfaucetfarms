import { useState, useEffect } from 'react';
import { User } from '../types';

export function useUser(address: string | null) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (address) {
      const savedUser = localStorage.getItem(`user_${address}`);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } else {
      setUser(null);
    }
  }, [address]);

  const updateUser = (userData: Partial<User>) => {
    if (!address) return;

    const updatedUser = {
      ...user,
      ...userData,
    } as User;

    setUser(updatedUser);
    localStorage.setItem(`user_${address}`, JSON.stringify(updatedUser));
  };

  const createUser = (address: string, nickname: string) => {
    const newUser: User = {
      address,
      nickname,
      balance: 1000,
      level: 1,
      avatar: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=400`,
    };

    setUser(newUser);
    localStorage.setItem(`user_${address}`, JSON.stringify(newUser));
    return newUser;
  };

  return { user, updateUser, createUser };
}