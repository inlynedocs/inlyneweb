'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Base URL for all API calls
const API_BASE = 'https://api.inlyne.link';

// Shared input styles
const inputClass =
  'w-full px-4 py-2 bg-brand-ivory text-brand-black border-2 border-brand-olive ' +
  'rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  // grab the "redirect" param or fall back to internal /home
  const redirectUri = searchParams.get('redirect') || '/home';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'userLogin', email, password }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        // if VS Code URI, bounce out to it; otherwise client-route internally
        const returnTo = `${redirectUri}${
          redirectUri.includes('?') ? '&' : '?'
        }token=${data.token}&email=${encodeURIComponent(email)}`;
        if (redirectUri.startsWith('vscode://')) {
          window.location.href = returnTo;
        } else {
          localStorage.setItem('token', data.token);
          if (data.pfpUrl) localStorage.setItem('pfpUrl', data.pfpUrl);
          router.push(returnTo);
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-[0_-4px_6px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]">
        <div className="flex justify-center mb-6">
          <Link href="/" passHref>
            <img src="/inlyne_logo.png" alt="Inlyne Logo" style={{ width: '150px' }} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div className="w-full flex items-center justify-center">
            <button
              type="submit"
              className="p-2 px-6 border-[#EC6D26] border-2 bg-white rounded-xl text-[#EC6D26] hover:bg-[#EC6D26] hover:text-white font-semibold transition cursor-pointer"
            >
              Login
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-black">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-[#0000FF] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
