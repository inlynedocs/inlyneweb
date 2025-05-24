'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_BASE = 'https://api.inlyne.link';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [documents, setDocuments] = useState<string[]>([]);

  useEffect(() => {
    console.log('[sidebar] initializing recent-docs load');
    const token = localStorage.getItem('token');

    const loadFromLocal = () => {
      console.log('[sidebar] loading docs from localStorage');
      const stored = localStorage.getItem('inlyne-docs');
      try {
        const docs = stored ? JSON.parse(stored) : [];
        console.log('[sidebar] loaded local docs:', docs);
        setDocuments(docs);
      } catch (err) {
        console.log('[sidebar] failed to parse local docs, clearing', err);
        setDocuments([]);
      }
    };

    if (token) {
      console.log('[sidebar] token found, fetching /docs');
      fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'getDocsUserIsOwner' }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then((data: { status: string; docs: string[] }) => {
          if (data.status === 'success') {
            setDocuments(data.docs);
            localStorage.setItem('inlyne-docs', JSON.stringify(data.docs));
          } else {
            loadFromLocal();
          }
        })
        .catch(() => loadFromLocal());
    } else {
      loadFromLocal();
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={`flex flex-col bg-[#f9f9f9] border-e border-gray-100
                  transition-width duration-300 ease-in-out
                  ${collapsed ? 'w-22' : 'w-65'}`}
    >
      {/* logo + collapse button */}
      <div className="flex items-center justify-between p-4">
        <Link href="/home" passHref>
          <img
            src={collapsed ? '/inlyne_bracket_icon.png' : '/inlyne_logo.png'}
            alt="Inlyne Logo"
            className={collapsed ? 'h-10 w-10' : 'h-10 w-auto'}
          />
        </Link>
        <button
          onClick={toggleCollapsed}
          className="p-1 rounded hover:bg-gray-200"
        >
          {collapsed ? (
            <ChevronRight className="h-2 w-2 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* gap + New Document */}
      <div className="px-2 mt-4">
        <Link
          href="/new"
          className="flex items-center p-2 rounded-xl hover:bg-gray-100"
        >
          <Image
            src="/newfileicon.svg"
            alt="New file icon"
            width={16}
            height={16}
            className="mr-2"
          />
          {!collapsed && <span>New Document</span>}
        </Link>
      </div>

      {/* Recent label */}
      <div className="px-4 mt-6 text-gray-400 uppercase text-xs tracking-wide">
        {!collapsed && 'Recent'}
      </div>

      {/* docs list */}
      <nav className="flex-1 overflow-auto px-2 mt-2">
        <ul className="space-y-1">
          {documents.map((doc) => (
            <li key={doc}>
              <Link
                href={`/${doc}`}
                className="flex items-center p-2 rounded-xl hover:bg-gray-100"
              >
                <Image
                  src="/file.svg"
                  alt="Document icon"
                  width={16}
                  height={16}
                  className="mr-2"
                />
                <span className="flex-1 truncate">
                  {collapsed ? doc.charAt(0) : doc}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
