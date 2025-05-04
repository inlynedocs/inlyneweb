// app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real auth logic
    alert(`Logging in with:\nEmail: ${email}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-brand-ivory flex justify-center items-center p-4">
      <div className="
          w-full max-w-md
          bg-brand-cream
          rounded-2xl p-8
          shadow-[0_-4px_6px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.1)]
        "
      >
        <div className="flex justify-center mb-6">
          <Link href="/home" passHref>
          <img
            src="/inlyne_logo.png"
            alt="Inlyne Logo"
            style={{ width: '150px', height: 'auto' }}
          />
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-2
                bg-brand-ivory text-brand-black
                border-2 border-brand-olive rounded-lg
                focus:outline-none focus:ring-2 focus:ring-brand-orange
                transition
              "
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-2
                bg-brand-ivory text-brand-black
                border-2 border-brand-olive rounded-lg
                focus:outline-none focus:ring-2 focus:ring-brand-orange
                transition
              "
            />
          </div>
          <button
            type="submit"
            className="
              w-full py-3 mt-4
              bg-brand-orange text-brand-ivory rounded-lg
              hover:bg-brand-orange/90 transition
            "
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-brand-black">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-brand-orange hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
