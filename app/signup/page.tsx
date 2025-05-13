'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Base URL for all API calls
const API_BASE = 'https://api.inlyne.link';

// Shared input styles (edit here to update all inputs)
const inputClass =
  'w-full px-4 py-2 bg-white text-black border-2 border-black ' +
  'rounded-lg focus:outline-none focus:ring-1 focus:ring-black transition';

export default function SignupPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  // track if email field was touched
  const [emailTouched, setEmailTouched] = useState(false);

  // password criteria
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasSymbolAndNumber, setHasSymbolAndNumber] = useState(false);
  const [hasUpperLower, setHasUpperLower] = useState(false);

  // regex rules
  const emailRegex = /^(([^<>()\[\]\\.,;:"]+(\.[^<>()\[\]\\.,;:"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const pwdLenRe = /^.{12,}$/;
  const pwdSymNumRe = /(?=.*?[0-9])(?=.*?[#?!@$%^&*\-])/;
  const pwdCaseRe = /(?=.*?[A-Z])(?=.*?[a-z])/;

  // validate password criteria on change
  useEffect(() => {
    setIsLongEnough(pwdLenRe.test(password));
    setHasSymbolAndNumber(pwdSymNumRe.test(password));
    setHasUpperLower(pwdCaseRe.test(password));
  }, [password]);

  const passwordsMatch = password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !emailRegex.test(email) ||
      !username.trim() ||
      !isLongEnough ||
      !hasSymbolAndNumber ||
      !hasUpperLower ||
      !passwordsMatch
    ) {
      alert('Please complete all fields and meet password criteria.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'userSignup', email, username, password }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        localStorage.setItem('token', data.token);
        router.push('/home');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
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
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
              className={`${inputClass} ${emailTouched && !emailRegex.test(email) ? 'border-red-500 focus:ring-red-500' : 'border-black focus:ring-black'}`}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {/* Password */}
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

          {/* Password criteria: only show unmet rules with X mark */}
          <ul className="pl-4 text-xs space-y-1">
            <li className={`flex items-center text-brand-black overflow-hidden transition-all duration-300 ${isLongEnough ? 'opacity-0 h-0' : 'opacity-100 h-3'}`}>
              <span className="mr-2">❌</span>At least 12 characters
            </li>
            <li className={`flex items-center text-brand-black overflow-hidden transition-all duration-300 ${hasSymbolAndNumber ? 'opacity-0 h-0' : 'opacity-100 h-3'}`}>
              <span className="mr-2">❌</span>Contains a symbol and a number
            </li>
            <li className={`flex items-center text-brand-black overflow-hidden transition-all duration-300 ${hasUpperLower ? 'opacity-0 h-0' : 'opacity-100 h-3'}`}>
              <span className="mr-2">❌</span>Contains uppercase & lowercase letters
            </li>
          </ul>

{/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-brand-black">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className={`${inputClass} ${confirm === '' || password === confirm ? '' : 'border-red-500 focus:ring-red-500'}`}
            />
            {confirm && password !== confirm && (
              <p className="mt-1 text-xs text-red-500">Passwords don’t match</p>
            )}
          </div>

          {/* Sign Up button */}
          <div className="w-full flex items-center justify-center">
            <button
              type="submit"
              className="p-2 px-6 border-[#EC6D26] border-1 bg-white rounded-xl text-[#EC6D26] hover:bg-[#EC6D26] hover:text-white font-semibold transition"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-black">
          Already have an account?{' '}
          <Link href="/login" className="text-[#0000FF] hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
