'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import hazard from '../public/hazard.svg';
import Image from 'next/image';

// Base URL for all API calls
const API_BASE = 'https://api.inlyne.link';

// Shared input styles (edit here to update all inputs)
const inputClass =
  'w-full px-4 py-2 bg-white text-black border-2 rounded-lg focus:outline-none focus:ring-1 transition';
const hazardClass = 'mr-1 inline-block';

export default function SignupPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  // validation state
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);

  // password criteria
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [hasSymbolAndNumber, setHasSymbolAndNumber] = useState(false);
  const [hasUpperLower, setHasUpperLower] = useState(false);

  // regex rules
  const emailRegex = /^(([^<>()\[\]\\.,;:\"']+(\.[^<>()\[\]\\.,;:\"']+)*)|(".+"))@((\d{1,3}\.){3}\d{1,3}|([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;
  const pwdLenRe = /^.{12,}$/;
  const pwdSymNumRe = /(?=.*?[0-9])(?=.*?[#?!@$%^&*\-])/;
  const pwdCaseRe = /(?=.*?[A-Z])(?=.*?[a-z])/;

  // validate password criteria
  useEffect(() => {
    setIsLongEnough(pwdLenRe.test(password));
    setHasSymbolAndNumber(pwdSymNumRe.test(password));
    setHasUpperLower(pwdCaseRe.test(password));
  }, [password]);

  const passwordsMatch = password === confirm;

  // check email availability on blur
  const checkEmailExists = async () => {
    if (!emailRegex.test(email)) {
      setEmailError('Email is invalid or already taken');
      return;
    }
    setCheckingEmail(true);
    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkUserExists', email }),
      });
      const data = await res.json();
      if (data.exists) {
        setEmailError('Email is invalid or already taken');
      } else {
        setEmailError('');
      }
    } catch (err) {
      console.error('Email check failed:', err);
    } finally {
      setCheckingEmail(false);
    }
  };

  // check username availability on blur
  const checkUsernameExists = async () => {
    if (!username.trim()) {
      setUsernameError('Username cannot be empty');
      return;
    }
    setCheckingUsername(true);
    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'checkUserExists', username }),
      });
      const data = await res.json();
      if (data.exists) {
        setUsernameError('Username is invalid or already taken');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      console.error('Username check failed:', err);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || usernameError) return;
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
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ type: 'userSignup', email, username, password }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        localStorage.setItem('token', data.token);
        router.push('/home');
      } else {
        // catch backend errors
        if (data.message?.toLowerCase().includes('email')) {
          setEmailError('Email is invalid or already taken');
        }
        if (data.message?.toLowerCase().includes('username')) {
          setUsernameError('Username is invalid or already taken');
        }
        if (!emailError && !usernameError) {
          alert(data.message || 'Signup failed');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f7] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <Link href="/" passHref>
            <img src="/inlyne_logo.png" alt="Inlyne Logo" className="w-36" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              onBlur={checkEmailExists}
              required
              className={`${inputClass} border-black focus:ring-black ${
                emailError ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {checkingEmail}
            {emailError && (
              <div className="p-1 pl-4 text-xs text-red-500 flex items-center">
                <Image className={hazardClass} src={hazard} alt="hazard" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameError(''); }}
              onBlur={checkUsernameExists}
              required
              className={`${inputClass} border-black focus:ring-black ${
                usernameError ? 'border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {checkingUsername}
            {usernameError && (
              <div className="p-1 pl-4 text-xs text-red-500 flex items-center">
                <Image className={hazardClass} src={hazard} alt="hazard" />
                <span>{usernameError}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`${inputClass} border-black focus:ring-black`}
            />
          </div>

          {/* Password criteria */}
          {(!isLongEnough || !hasSymbolAndNumber || !hasUpperLower) && (
            <ul className="pl-4 space-y-1 text-xs text-black">
              <li className={`${isLongEnough ? 'opacity-0 h-0' : 'opacity-100 h-3'} transition-all`}>❌ At least 12 characters</li>
              <li className={`${hasSymbolAndNumber ? 'opacity-0 h-0' : 'opacity-100 h-3'} transition-all`}>❌ Contains a symbol and a number</li>
              <li className={`${hasUpperLower ? 'opacity-0 h-0' : 'opacity-100 h-3'} transition-all`}>❌ Contains uppercase & lowercase letters</li>
            </ul>
          )}

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-black">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              className={`${inputClass} border-black focus:ring-black ${
                confirm === '' || passwordsMatch ? '' : 'border-red-500 focus:ring-red-500'
              }`}
            />
            {confirm && !passwordsMatch && (
              <div className="p-1 pl-4 text-xs text-red-500 flex items-center">
                <Image className={hazardClass} src={hazard} alt="hazard" />
                <span>Passwords don’t match</span>
              </div>
            )}
          </div>

          {/* Sign Up button */}
          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="p-2 px-6 border-[#EC6D26] border-2 bg-white rounded-xl text-[#EC6D26] hover:bg-[#EC6D26] hover:text-white font-semibold transition"
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
