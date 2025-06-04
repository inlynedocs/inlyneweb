'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Image from 'next/image';
import hazard from '../public/hazard.svg';

interface User {
  userName: string;
  email: string;
  avatarUrl: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User>({ userName: '', email: '', avatarUrl: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // password criteria states
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasSymbolAndNumber, setHasSymbolAndNumber] = useState(false);
  const [hasUpperLower, setHasUpperLower] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);

  // regex rules
  const pwdLenRe = /^.{12,}$/;
  const pwdSymNumRe = /(?=.*?[0-9])(?=.*?[#?!@$%^&*\-])/;
  const pwdCaseRe = /(?=.*?[A-Z])(?=.*?[a-z])/;

  const passwordsMatch = newPassword === confirmPassword;

  // Fetch profile once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user?requestType=getUserData`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('Profile fetch error body:', await res.text());
          throw new Error(`HTTP ${res.status}`);
        }

        const { username, email, pfpUrl } = await res.json();
        setUser({
          userName: username ?? '',
          email: email ?? '',
          avatarUrl: pfpUrl ?? '',
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setErrorMsg(`Could not load profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  // validate password criteria whenever newPassword changes
  useEffect(() => {
    setIsLongEnough(pwdLenRe.test(newPassword));
    setHasSymbolAndNumber(pwdSymNumRe.test(newPassword));
    setHasUpperLower(pwdCaseRe.test(newPassword));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (newPassword && !currentPassword) {
      alert('Please enter current password');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const calls: Promise<Response>[] = [];

      if (user.userName) {
        calls.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'updateUsername', newUsername: user.userName }),
          })
        );
      }

      if (user.email) {
        calls.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'updateUserEmail', newEmail: user.email }),
          })
        );
      }

      if (newPassword) {
        calls.push(
          fetch(`${API_BASE}/user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: 'updateUserPassword',
              oldPassword: currentPassword,
              newPassword,
            }),
          })
        );
      }

      const responses = await Promise.all(calls);
      for (const r of responses) {
        const body = await r.json();
        if (!r.ok || body.status !== 'success') throw new Error(body.message ?? 'Update failed');
      }

      alert('Profile updated');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? 'An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"></div>;
  }

  return (
    <div>
      <Header />
      <div className="flex items-center justify-center mt-5">
        <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">My Profile</h2>
            <Link href="/home">
              <button className="bg-gray-100 hover:bg-gray-200 text-black px-5 py-2 rounded-lg">
                Home
              </button>
            </Link>
          </div>

          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col items-center">
              <img
                src={`${API_BASE}/${user.avatarUrl}` || '/avatar.png'}
                alt="Profile Picture"
                className="w-24 h-24 rounded-full mb-2 object-cover"
              />
            </div>

            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={user.userName}
                onChange={e => setUser({ ...user, userName: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={e => setUser({ ...user, email: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {/* New: Current Password */}
            <div>
              <label className="block text-gray-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter current password to change"
              />
            </div>

            <div>
              <label className="block text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                onFocus={() => setShowCriteria(true)}
                onBlur={() => setShowCriteria(false)}
                className={`w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none ${
                  showCriteria && (!isLongEnough || !hasSymbolAndNumber || !hasUpperLower)
                    ? 'focus:ring-2 focus:ring-red-500 focus:border-red-500'
                    : 'focus:ring-2 focus:ring-black'
                }`}
                placeholder="Leave blank to keep current"
              />
              {showCriteria && (
                <ul className="pl-4 mt-2 space-y-1 text-xs text-black">
                  <li className={`${isLongEnough ? 'opacity-50' : 'opacity-100'} transition`}>
                    {isLongEnough ? '✅' : '❌'} At least 12 characters
                  </li>
                  <li className={`${hasSymbolAndNumber ? 'opacity-50' : 'opacity-100'} transition`}>
                    {hasSymbolAndNumber ? '✅' : '❌'} Contains a symbol & a number
                  </li>
                  <li className={`${hasUpperLower ? 'opacity-50' : 'opacity-100'} transition`}>
                    {hasUpperLower ? '✅' : '❌'} Contains uppercase & lowercase
                  </li>
                </ul>
              )}
            </div>

            <div>
              <label className="block text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none ${
                  confirmPassword && !passwordsMatch
                    ? 'focus:ring-2 focus:ring-red-500 border-red-500'
                    : 'focus:ring-2 focus:ring-black'
                }`}
                placeholder="Re-enter to confirm"
              />
              {confirmPassword && !passwordsMatch && (
                <div className="flex items-center mt-1 text-xs text-red-500">
                  <Image src={hazard} alt="hazard" className="mr-1" />
                  <span>Passwords don’t match</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#EC6D26] hover:bg-[#CD5512] font-medium text-white px-4 py-2 rounded-xl"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
