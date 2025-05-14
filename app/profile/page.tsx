'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';

interface User {
  userName: string;
  email: string;
  avatarUrl: string;
}

const API_BASE = 'https://api.inlyne.link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>({ userName: '', email: '', avatarUrl: '' });
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'getUserProfile' }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error('Profile fetch error body:', text);
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setUser({
          userName: data.username || data.newUsername || '',
          email: data.email || data.newEmail || '',
          avatarUrl: data.avatarUrl || data.pfpUrl || '',
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setErrorMsg(`Could not load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not authenticated');
      router.push('/login');
      return;
    }
    try {
      const updatePromises: Promise<Response>[] = [];
      if (user.userName) {
        updatePromises.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'updateUsername', newUsername: user.userName }),
          })
        );
      }
      if (user.email) {
        updatePromises.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'updateUserEmail', newEmail: user.email }),
          })
        );
      }
      if (password) {
        const oldPassword = window.prompt('Enter your current password:');
        if (!oldPassword) {
          alert('Current password required');
          return;
        }
        updatePromises.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'updateUserPassword', oldPassword, newPassword: password }),
          })
        );
      }
      const responses = await Promise.all(updatePromises);
      for (const res of responses) {
        const data = await res.json();
        if (!res.ok || data.status !== 'success') {
          throw new Error(data.message || 'Update failed');
        }
      }
      alert('Profile updated');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading profile...</div>;
  }

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <Link href="/home" className="text-indigo-600 hover:underline">Back to Home</Link>
          </div>
          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center">
              <img src={user.avatarUrl || '/avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full mb-2" />
            </div>
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={user.userName}
                onChange={e => setUser({ ...user, userName: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
                className="w-full mt-1 border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full mt-1 border rounded px-3 py-2"
                placeholder="Leave blank to keep current"
              />
            </div>
            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full mt-1 border rounded px-3 py-2"
                placeholder="Re-enter password"
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
