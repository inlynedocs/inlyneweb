'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string;
}

// Replace this with real fetched user data or props
const initialUser: User = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'avatar.png',
};

export default function ProfilePage() {
  const [user, setUser] = useState<User>(initialUser);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: send user and password data to API
    alert('Profile updated successfully');
  };

  return (
    <div>
    <Header />
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-[0_-4px_6px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">My Profile</h2>
          <Link href="/home" passHref className="text-indigo-600 hover:underline">
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
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              className="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
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
