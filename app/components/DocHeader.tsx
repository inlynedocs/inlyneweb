'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileMenu from './ProfileMenu';

interface DocHeaderProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
    docKey: string;
    docTitle: string;
    setDocTitle: (title: string) => void;
    accessLevel: 'public' | 'writer';
    isPublic: boolean;
    handleSave: () => void;
    handleTogglePublic: () => void;
    copyLink: () => void;
    hoverCopy: boolean;
    setHoverCopy: (b: boolean) => void;
    copied: boolean;
    onOpenShare: () => void;
    avatarSrc: string;
    userName: string;
    email: string;
}

export default function DocHeader({
    sidebarCollapsed,
    onToggleSidebar,
    docKey,
    docTitle,
    setDocTitle,
    accessLevel,
    isPublic,
    handleSave,
    handleTogglePublic,
    copyLink,
    hoverCopy,
    setHoverCopy,
    copied,
    onOpenShare,
    avatarSrc,
    userName,
    email
}: DocHeaderProps) 
{
    const router = useRouter();
    const [editingTitle, setEditingTitle] = useState(false);

    return (
        <header className="flex items-center px-6 py-3 bg-white border-b shadow space-x-4">
            {sidebarCollapsed && (
                <>
                    <button onClick={onToggleSidebar}>
                        <Image src="/sidebar.svg" alt="Open sidebar" width={24} height={24} />
                    </button>
                    <Link href="/home">
                        <img src="/inlyne_bracket_icon.png" alt="Logo" className="h-8" />
                    </Link>
                </>
            )}

            {/* Editable Title */}
            {accessLevel === 'writer' ? (
                editingTitle ? (
                    <input
                        className="flex-1 text-xl font-bold px-2 py-1 border-b focus:outline-none"
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                        onBlur={() => {
                            handleSave();
                            setEditingTitle(false);
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        autoFocus
                    />
                ) : (
                    <h2
                        className="flex-1 text-xl font-bold truncate cursor-text"
                        onClick={() => setEditingTitle(true)}
                    >
                        {docTitle || docKey}
                    </h2>
                )
            ) : (
                <h2 className="flex-1 text-xl font-bold truncate">
                    {docTitle || docKey}
                </h2>
            )}

            {/* Copy Link */}
            <button
                onClick={copyLink}
                onMouseEnter={() => setHoverCopy(true)}
                onMouseLeave={() => setHoverCopy(false)}
                className="flex items-center text-sm bg-gray-100 text-gray-600 rounded px-2 py-1"
            >
                {copied ? (
                    <>
                        <Image src="/checkmark.svg" alt="✓" width={16} height={16} className="mr-1" />
                        Copied
                    </>
                ) : hoverCopy ? (
                    <>
                        <Image src="/copy.svg" alt="✎" width={16} height={16} className="mr-1" />
                        Copy
                    </>
                ) : (
                    <>
                        <span className="truncate">{docKey}</span>
                        <Image src="/link.svg" alt="🔗" width={16} height={16} className="ml-1" />
                    </>
                )}
            </button>

            <div className="flex-1" />

            {/* Share button */}
            <button
                onClick={onOpenShare}
                className="flex items-center space-x-1 px-4 py-2 border rounded-full hover:bg-gray-100"
            >
                {isPublic ? (
                    <Image src="/globe.svg" alt="🌐" width={16} height={16} />
                ) : (
                    <Image src="/lock.svg" alt="🔒" width={16} height={16} />
                )}
                <span>Share</span>
            </button>

            {/* Writer actions */}
            {accessLevel === 'writer' && (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleTogglePublic}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        {isPublic ? 'Make Private' : 'Make Public'}
                    </button>
                </div>
            )}

            {/* Profile menu */}
            <ProfileMenu
                avatarSrc={avatarSrc}
                userName={userName}
                email={email}
            />
        </header>
    );
}
