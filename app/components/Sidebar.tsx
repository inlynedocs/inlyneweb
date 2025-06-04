'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';

interface Doc {
    linkKey: string;
    docTitle: string;
}

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const router = useRouter();
    const [documents, setDocuments] = useState<Doc[]>([]);

    // Helper to dedupe by linkKey
    const dedupe = (arr: Doc[]) => {
        const seen = new Set<string>();
        return arr.filter(d => {
            if (seen.has(d.linkKey)) return false;
            seen.add(d.linkKey);
            return true;
        });
    };

    // Load from localStorage (handles both string[] and Doc[])
    const loadFromLocal = () => {
        const raw = localStorage.getItem('inlyne-docs');
        if (!raw) {
            setDocuments([]);
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            let docs: Doc[];
            // old format: string[]
            if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
                docs = (parsed as string[]).map(k => ({ linkKey: k, docTitle: k }));
            } else {
                docs = parsed as Doc[];
            }
            setDocuments(dedupe(docs));
        } catch {
            setDocuments([]);
        }
    };

    // Fetch recently accessed from server
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            loadFromLocal();
            return;
        }
        fetch(`${API_BASE}/docs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'getDocsUserRecentlyAccessed' }),
        })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then((data: { status: string; docs: string[] | Doc[] }) => {
                if (data.status === 'success') {
                    let docs: Doc[];
                    if (data.docs.length > 0 && typeof data.docs[0] === 'string') {
                        docs = (data.docs as string[]).map(k => ({ linkKey: k, docTitle: k }));
                    } else {
                        docs = data.docs as Doc[];
                    }
                    const unique = dedupe(docs);
                    setDocuments(unique);
                    localStorage.setItem('inlyne-docs', JSON.stringify(unique));
                } else {
                    loadFromLocal();
                }
            })
            .catch(loadFromLocal);
    }, []);

    // Create new doc → prepend + dedupe
    const handleCreate = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/docs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: 'create' }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { url } = await res.json();
            const key = url.split('/').pop()!;
            const newDoc: Doc = { linkKey: key, docTitle: key };
            const merged = [newDoc, ...documents];
            const unique = dedupe(merged);
            setDocuments(unique);
            localStorage.setItem('inlyne-docs', JSON.stringify(unique));
            router.push(`/${key}`);
        } catch (err: any) {
            console.error('Create failed:', err);
            alert(`Error creating document: ${err.message}`);
        }
    };

    if (collapsed) return null;

    return (
        <aside className="flex flex-col bg-[#f9f9f9] border-r border-gray-200 w-64 transition-all duration-300">
            {/* Logo & Collapse */}
            <div className="flex items-center justify-between p-4">
                <Link href="/home" passHref>
                    <img src="/inlyne_logo.png" alt="Logo" className="h-8 w-auto" />
                </Link>
                <button onClick={onToggle} className="p-1 rounded-lg hover:bg-gray-200">
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* New Document */}
            <div className=" rounder-xl w-full px-2 mt-4">
                <button
                    onClick={handleCreate}
                    className="flex items-center p-2 rounded-xl w-full hover:bg-gray-100 transition"
                >
                    <Image
                        src="/newfileicon.svg"
                        alt="New"
                        width={16}
                        height={16}
                        className="mr-2"
                    />
                    <span>New Document</span>
                </button>
            </div>

            <div className="px-4 mt-6 text-gray-400 uppercase text-xs tracking-wide">
                Recent
            </div>

            {/* Recent List */}
            <nav className="flex-1 px-2 mt-2 overflow-auto">
                <ul className="space-y-1">
                    {documents.map(doc => (
                        <li key={doc.linkKey}>
                            <Link
                                href={`/${doc.linkKey}`}
                                className="flex items-center p-2 rounded-xl hover:bg-gray-100 transition"
                            >
                                <Image
                                    src="/file.svg"
                                    alt="Doc"
                                    width={16}
                                    height={16}
                                    className="mr-2"
                                />
                                <span className="truncate">{doc.docTitle}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
