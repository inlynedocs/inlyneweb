// app/home/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

const API_BASE = "https://localhost:8080";
const DEFAULT_DOCS = ['Test1','Test2','Test3','Test4','Test5','Test6'];

export default function InlyneHomepage() {
  const router = useRouter();
  const [docs, setDocs] = useState<string[]>([]);

  // Load from localStorage (or defaults) on first render
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) {
      try {
        setDocs(JSON.parse(stored));
      } catch {
        setDocs(DEFAULT_DOCS);
      }
    } else {
      setDocs(DEFAULT_DOCS);
    }
  }, []);

  // Persist to localStorage whenever `docs` changes
  useEffect(() => {
    localStorage.setItem('inlyne-docs', JSON.stringify(docs));
  }, [docs]);

  // Create a new doc via your API, update state+storage, then navigate
  const handleCreate = async () => {
    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'create' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();       // e.g. { url: '…/docs/abcd1234' }
      const key = url.split('/').pop()!;       // 'abcd1234'

      // 1) add to our in-memory list
      setDocs((prev) => [key, ...prev.filter((k) => k !== key)]);
      // 2) navigate to the editor route for that key
      router.push(`/editor/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar shows the persisted list */}
      <Sidebar documents={docs} />

      <main className="flex-1 overflow-auto bg-brand-ivory">
        {/* Profile header */}
        <header className="flex justify-end px-6 py-4 bg-white shadow-md">
          <a href="/profile" className="hover:underline">My Profile</a>
        </header>

        {/* Title + New Document button */}
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold">Document Overview</h1>
          <button
            onClick={handleCreate}
            className="cursor-pointer px-4 py-2 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition"
          >
            + New Document
          </button>
        </div>

        {/* Grid of docs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {docs.map((doc) => (
            <div key={doc} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 flex items-center justify-center">
                <img
                  src={`/previews/${doc}.png`}
                  alt={`${doc} preview`}
                  className="max-h-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/icons/document_placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg truncate">{doc}</h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
