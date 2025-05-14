'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

// Toggle maintenance mode here
const MAINTENANCE_MODE = false;
// Bypass credentials in maintenance mode
const BYPASS_USERNAME = 'adminbrar';
const BYPASS_PASSWORD = 'jivajBRAR0123@';

// Base URL for all API calls
const API_BASE = 'https://api.inlyne.link';

export default function InlyneHomepage() {
  const router = useRouter();
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceBypass, setMaintenanceBypass] = useState(false);
  const [bypassUser, setBypassUser] = useState('');
  const [bypassPw, setBypassPw] = useState('');

  // Retrieve JWT token from localStorage (set by signup/login)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Handle maintenance bypass when credentials match
  useEffect(() => {
    if (MAINTENANCE_MODE && bypassUser === BYPASS_USERNAME && bypassPw === BYPASS_PASSWORD) {
      setMaintenanceBypass(true);
    }
  }, [bypassUser, bypassPw]);

  // Fetch docs the user can read/write on initial render
  useEffect(() => {
    if (MAINTENANCE_MODE && !maintenanceBypass) {
      setLoading(false);
      return;
    }
    if (!token) {
      router.push('/login');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/docs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ type: 'getDocsUserCanReadWrite' }),
        });

        if (!res.ok) throw new Error(`Failed to fetch docs: ${res.status}`);
        const { docs: fetchedDocs } = await res.json();
        setDocs(fetchedDocs);
      } catch (err) {
        console.error(err);
        alert('Unable to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, maintenanceBypass, router]);

  // Create a new document via API
  const handleCreate = async () => {
    if (MAINTENANCE_MODE && !maintenanceBypass) {
      alert('Site in maintenance mode. Enter correct credentials to create docs.');
      return;
    }
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'create' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      const key = url.split('/').pop()!;

      setDocs(prev => [key, ...prev.filter(k => k !== key)]);
      router.push(`/editor/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

  // Maintenance login screen
  if (MAINTENANCE_MODE && !maintenanceBypass) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex-col items-center justify-center">
          <div className="flex w-full items-center justify-center">
              <h1 className=" font-bold text-xl pt-10 px-10">SITE IN MAINTENANCE MODE</h1>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Maintenance Mode</h2>
            <input
              type="text"
              placeholder="Username"
              value={bypassUser}
              onChange={e => setBypassUser(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={bypassPw}
              onChange={e => setBypassPw(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-4"
            />
            <button
              onClick={() => {
                if (bypassUser !== BYPASS_USERNAME || bypassPw !== BYPASS_PASSWORD) {
                  alert('Incorrect username or password');
                }
              }}
              className="w-full py-2 bg-gray-500 font-bold text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading documents...</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar documents={docs} />

      <main className="flex-1 overflow-auto bg-brand-ivory">
        <header className="flex justify-end px-6 py-4 bg-white shadow-md">
          <a href="/profile" className="hover:underline">My Profile</a>
        </header>

        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold">Document Overview</h1>
          <button
            onClick={handleCreate}
            className="cursor-pointer px-4 py-2 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition"
          >
            + New Document
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {docs.map(doc => (
            <div key={doc} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-40 flex items-center justify-center">
                <img
                  src={`/previews/${doc}.png`}
                  alt={`${doc} preview`}
                  className="max-h-full"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/icons/document_placeholder.svg'; }}
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
