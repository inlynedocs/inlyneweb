'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

const MAINTENANCE_MODE  = false;
const BYPASS_USERNAME   = 'adminbrar';
const BYPASS_PASSWORD   = 'jivajBRAR0123@';
const API_BASE          = 'https://api.inlyne.link';

interface UserMini {
  userName: string;
  email   : string;
  avatarUrl: string;
}

export default function InlyneHomepage() {
  const router = useRouter();

  const [docs, setDocs]                     = useState<string[]>([]);
  const [loading, setLoading]               = useState(true);
  const [maintenanceBypass, setMaintenanceBypass] = useState(false);
  const [bypassUser, setBypassUser]         = useState('');
  const [bypassPw, setBypassPw]             = useState('');
  const [menuOpen, setMenuOpen]             = useState(false);
  const [userMini, setUserMini]             = useState<UserMini>({ userName: '', email: '', avatarUrl: '' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /* ─── maintenance bypass ─── */
  useEffect(() => {
    if (MAINTENANCE_MODE && bypassUser === BYPASS_USERNAME && bypassPw === BYPASS_PASSWORD) {
      setMaintenanceBypass(true);
    }
  }, [bypassUser, bypassPw]);

  /* ─── fetch docs on mount ─── */
  useEffect(() => {
    if (MAINTENANCE_MODE && !maintenanceBypass) { setLoading(false); return; }
    if (!token) { router.push('/login'); return; }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/docs`, {
          method : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept        : 'application/json',
            Authorization : `Bearer ${token}`,
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

  /* ─── fetch username + email for dropdown ─── */
  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/user?requestType=getUserData`,
          {
            headers: {
              Accept        : 'application/json',
              Authorization : `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error('User fetch error:', await res.text());
          return;
        }

        const { username, email, pfpUrl } = await res.json();
        setUserMini({ userName: username ?? '', email: email ?? '' , avatarUrl: pfpUrl ?? '' });
      } catch (err) {
        console.error('Failed to fetch mini user data', err);
      }
    })();
  }, [token]);

  /* ─── create doc ─── */
  const handleCreate = async () => {
    if (MAINTENANCE_MODE && !maintenanceBypass) {
      alert('Site in maintenance mode. Enter correct credentials to create docs.');
      return;
    }
    if (!token) { router.push('/login'); return; }

    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept        : 'application/json',
          Authorization : `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'create' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { url } = await res.json();
      const key = url.split('/').pop()!;
      setDocs(prev => [key, ...prev.filter(k => k !== key)]);
      router.push(`/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

  /* ─── maintenance screen ─── */
  if (MAINTENANCE_MODE && !maintenanceBypass) {
    return (
      <div className="flex items-center justify-center h-screen">
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
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Submit
          </button>
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
        {/* top bar */}
        <header className="flex justify-end px-10 py-3 bg-white shadow-md relative">
          <div className="relative">
            <img
              src={`${API_BASE}/${userMini.avatarUrl}` || '/profileicon.svg'}
              alt="Profile Icon"
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2">
                {/* user info block */}
                <div className="px-4 pb-2 border-b">
                  <p className="font-semibold leading-tight truncate">{userMini.userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userMini.email}</p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    localStorage.removeItem('token');
                    router.push('/login');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
