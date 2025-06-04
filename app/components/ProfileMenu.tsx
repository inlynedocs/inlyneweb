'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileMenuProps {
    avatarSrc: string;
    userName: string;
    email: string;
}

export default function ProfileMenu({ avatarSrc, userName, email }: ProfileMenuProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    return (
        <div className="relative">
            <img
                src={avatarSrc || "profileicon.svg"}
                alt="Profile"
                className="w-10 h-10 rounded-full cursor-pointer hover:ring-4 hover:ring-gray-100 transition"
                onClick={() => setOpen(o => !o)}
            />

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 shadow-md rounded-lg py-2">
                    <div className="px-4 py-2">
                        <p className="font-semibold text-lg truncate">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{email}</p>
                    </div>
                    <hr className="border-gray-200 my-1" />
                    <button
                        onClick={() => {
                            setOpen(false);
                            router.push('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    >
                        <img src="/profileicon.svg" alt="Profile" className="w-4 h-4 mr-2" />
                        Profile
                    </button>
                    <button
                        onClick={() => {
                            setOpen(false);
                            localStorage.removeItem('token');
                            router.push('/login');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                    >
                        <img src="/logout.svg" alt="Logout" className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
