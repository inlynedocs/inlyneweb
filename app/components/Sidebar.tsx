'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_BASE = 'https://api.inlyne.link';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const loadFromLocal = () => {
      const stored = localStorage.getItem('inlyne-docs');
      try {
        setDocuments(stored ? JSON.parse(stored) : []);
      } catch {
        setDocuments([]);
      }
    };
    if (!token) return loadFromLocal();

    fetch(`${API_BASE}/docs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: 'getRecentlyAccessedDocs' }),
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then((data: { status: string; docs: string[] }) => {
        if (data.status === 'success') {
          setDocuments(data.docs);
          localStorage.setItem('inlyne-docs', JSON.stringify(data.docs));
        } else {
          loadFromLocal();
        }
      })
      .catch(loadFromLocal);
  }, []);

  // hide entire sidebar when collapsed
  if (collapsed) return null;

  return (
    <aside
      className={`
        flex flex-col bg-[#f9f9f9] border-r border-gray-200
        transition-all duration-300 ease-in-out
        w-64
      `}
    >
      {/* logo + collapse */}
      <div className="flex items-center justify-between p-4 shrink-0">
        <Link href="/home" passHref>
          <img src="/inlyne_logo.png" alt="Logo" className="h-8 w-auto" />
        </Link>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-200 transition"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* menu */}
      <div className="flex flex-col flex-1 overflow-auto">
        <div className="px-2 mt-4">
          <Link
            href="/new"
            className="flex items-center p-2 rounded hover:bg-gray-100 transition"
          >
            <Image
              src="/newfileicon.svg"
              alt="New"
              width={16}
              height={16}
              className="mr-2"
            />
            <span>New Document</span>
          </Link>
        </div>

        <div className="px-4 mt-6 text-gray-400 uppercase text-xs tracking-wide">
          Recent
        </div>

        <nav className="flex-1 px-2 mt-2">
          <ul className="space-y-1">
            {documents.map(doc => (
              <li key={doc}>
                <Link
                  href={`/${doc}`}
                  className="flex items-center p-2 rounded-xl hover:bg-gray-100 transition"
                >
                  <Image
                    src="/file.svg"
                    alt="Doc"
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  <span className="truncate">{doc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
