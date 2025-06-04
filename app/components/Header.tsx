'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // on mount, check for existing auth token
        setToken(localStorage.getItem('token'));
    }, []);

    const handleLogout = () => {
        // clear token and redirect to login
        localStorage.removeItem('token');
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-50 bg-brand-olive/90 text-brand-ivory backdrop-blur-sm shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                <Link href="/home" passHref className="flex items-center">
                    <img
                        src="inlyne_logo.png"
                        alt="Inlyne Logo"
                        className="h-8 w-auto"
                    />
                </Link>
                <div>
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange/10 transition cursor-pointer"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link href="/login" passHref>
                            <button
                                className="px-4 py-2 border-2 border-brand-orange text-brand-orange rounded-lg hover:bg-brand-orange/10 transition cursor-pointer"
                            >
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
