'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';

interface User {
  fullName: string;
  userName: string;
  email: string;
  avatarUrl: string;
}

// Replace this with real fetched user data or props
const initialUser: User = {
  fullName: 'John Doe',
  userName: 'johnny',
  email: 'john.doe@example.com',
  avatarUrl: 'avatar.png',
};

export default function ProfilePage() {
  const [user, setUser] = useState<User>(initialUser);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      alert('You must be logged in to update your profile');
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      // Update username
      if (user.userName !== initialUser.userName) {
        const res = await fetch('/user', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'updateUsername',
            newUsername: user.userName,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed to update username');
        }
      }

      // Update email
      if (user.email !== initialUser.email) {
        const res = await fetch('/user', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'updateUserEmail',
            userId,
            newEmail: user.email,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed to update email');
        }
      }

      // Update password
      if (password) {
        const oldPassword = window.prompt('Please enter your current password:');
        if (!oldPassword) {
          alert('Current password is required to change password');
          return;
        }
        const res = await fetch('/user', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            type: 'updateUserPassword',
            userId,
            oldPassword,
            newPassword: password,
          }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Failed to update password');
        }
      }

      alert('Profile updated successfully');
      // Optionally refresh or redirect
      router.refresh();
    } catch (error: any) {
      console.error('Profile update error:', error);
      alert(error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-[0_-4px_6px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <Link href="/home" className="text-indigo-600 hover:underline">
              Back to Home
            </Link>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center">
              <img
                src={user.avatarUrl}
                alt=""
                className="w-24 h-24 rounded-full mb-2"
              />
            </div>
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={user.userName}
                onChange={(e) => setUser({ ...user, userName: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 border rounded px-3 py-2"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 border rounded px-3 py-2"
                placeholder="Re-enter password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
