'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  documents: string[];
}

/**
 * Collapsible sidebar with a subtle right‑edge shadow so it stands out against the main pane.
 */
export const Sidebar: React.FC<SidebarProps> = ({ documents }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-[#f4f4f7] border-r border-gray-100 
        shadow-[4px_0_6px_-2px_rgba(0,0,0,0.12)]
        transition-width duration-300 ease-in-out
        ${collapsed ? 'w-22' : 'w-64'}`}
    >
      {/* logo + collapse button */}
      <div className="flex items-center justify-between p-4">
        <Link href="/home" passHref>
          <img
            src={collapsed ? '/inlyne_bracket_icon.png' : '/inlyne_logo.png'}
            alt="Inlyne Logo"
            className={collapsed? 'h-10 w-10' : 'h-10 w-auto'}
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
