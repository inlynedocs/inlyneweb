// app/components/Header.tsx
'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-olive/90 text-brand-ivory backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src="inlyne_logo.png"
            alt="Inlyne Logo"
            className="h-10 w-auto"
          />
        </Link>
        <div>
          <Link href="/login" passHref>
            <button
              className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange/10 transition cursor-pointer"
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
