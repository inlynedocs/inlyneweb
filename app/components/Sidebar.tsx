'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  documents: string[];
}

/**
 * A reusable collapsible sidebar component.
 * @param documents - List of document filenames to display
 */
export const Sidebar: React.FC<SidebarProps> = ({ documents }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-100  transition-width duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <Link href="/home" passHref>
        <img
          src={
            collapsed ? '/inlyne_bracket_icon.png' : '/inlyne_logo.png'
          }
          alt="Inlyne Logo"
          className="h-8 w-auto"
        />
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-auto px-2">
        <ul className="space-y-1">
          {documents.map((doc) => (
            <li key={doc}>
              <a
                href={`/${doc}`}
                className="flex items-center p-2 rounded hover:bg-gray-100"
              >
                <span className="flex-1 truncate">
                  {collapsed ? doc.charAt(0) : doc}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
