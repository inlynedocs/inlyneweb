// app/components/Header.tsx
'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-brand-olive/90 text-brand-ivory backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-brand-orange hover:text-brand-cream"
        >
          Inlyne
        </Link>
        <div>
          <Link href="/login" passHref>
            <button
              className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange/10 transition"
            >
              Login
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
