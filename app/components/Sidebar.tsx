'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const API_BASE = 'https://api.inlyne.link';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
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

    if (token) {
      fetch(`${API_BASE}/user/docs/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('API error');
          return res.json();
        })
        .then((data: { docs: string[] }) => {
          setDocuments(data.docs);
          // optionally sync back to localStorage:
          localStorage.setItem('inlyne-docs', JSON.stringify(data.docs));
        })
        .catch(() => {
          loadFromLocal();
        });
    } else {
      loadFromLocal();
    }
  }, []);

  return (
    <aside
      className={`flex flex-col bg-[#f9f9f9] border-r border-gray-200
                  transition-width duration-300 ease-in-out
                  ${collapsed ? 'w-22' : 'w-60'}`}
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
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200"
        >
          {collapsed ? (
            <ChevronRight className="h-2 w-2 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* docs list */}
      <nav className="flex-1 overflow-auto px-2">
        <ul className="space-y-1">
          {documents.map((doc) => (
            <li key={doc}>
              <Link
                href={`/${doc}`}
                className="flex items-center p-2 rounded hover:bg-gray-100"
              >
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
