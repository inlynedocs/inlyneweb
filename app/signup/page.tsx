'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'userSignup',
          email,
          username: name,
          password,
        }),
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Store token (adjust storage mechanism as needed)
        localStorage.setItem('token', data.token);
        // Redirect after successful signup
        router.push('/home');
      } else {
        // Handle errors returned by the API
        const message = data.message || 'Signup failed';
        alert(message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
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
