'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

const API_BASE = 'https://api.inlyne.link';

export default function InlyneHomepage() {
  const router = useRouter();
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieve JWT token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('inlyne-token') : null;

  // Fetch docs the user can read/write on initial render
  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_BASE}/docs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'getDocsUserCanReadWrite' }),
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch docs: ${res.status}`);
        }

        const { docs: fetchedDocs } = await res.json();
        setDocs(fetchedDocs);
      } catch (err) {
        console.error(err);
        alert('Unable to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [token, router]);

  // Create a new document via API
  const handleCreate = async () => {
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
      const { url } = await res.json(); // e.g. { url: 'https://inlyne.link/abcd1234' }
      const key = url.split('/').pop()!;

      // Prepend to list and navigate
      setDocs((prev) => [key, ...prev.filter((k) => k !== key)]);
      router.push(`/editor/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading documents...</div>;
  }

  return (
    <div className="flex h-screen">
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
                    (e.currentTarget as HTMLImageElement).src = '/icons/document_placeholder.svg';
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
