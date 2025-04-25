'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real sign-up logic
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    alert(`Signing up with:\nName: ${name}\nEmail: ${email}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-brand-ivory flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-brand-cream shadow-lg rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <img
            src="/inlyne_logo.png"
            alt="Inlyne Logo"
            style={{ width: '150px', height: 'auto' }}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-brand-black">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-orange hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
