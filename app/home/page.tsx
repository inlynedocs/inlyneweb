'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';

const MAINTENANCE_MODE  = false;
const BYPASS_USERNAME   = 'adminbrar';
const BYPASS_PASSWORD   = 'jivajBRAR0123@';
const API_BASE          = 'https://api.inlyne.link';

interface UserMini {
  userName : string;
  email    : string;
  avatarUrl: string;
}

export default function InlyneHomepage() {
  const router = useRouter();
  const token  = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [readWriteDocs,    setReadWriteDocs   ] = useState<string[]>([]);
  const [ownedDocs,        setOwnedDocs       ] = useState<string[]>([]);
  const [loading,          setLoading         ] = useState(true);
  const [maintenanceBypass, setMaintenanceBypass] = useState(false);
  const [bypassUser,       setBypassUser      ] = useState('');
  const [bypassPw,         setBypassPw        ] = useState('');
  const [menuOpen,         setMenuOpen        ] = useState(false);
  const [userMini,         setUserMini        ] = useState<UserMini>({ userName: '', email: '', avatarUrl: '' });

  useEffect(() => {
    if (MAINTENANCE_MODE && bypassUser === BYPASS_USERNAME && bypassPw === BYPASS_PASSWORD) {
      setMaintenanceBypass(true);
    }
  }, [bypassUser, bypassPw]);

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
        const [rrRes, ownerRes] = await Promise.all([
          fetch(`${API_BASE}/docs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'getDocsUserCanReadWrite' }),
          }),
          fetch(`${API_BASE}/docs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'getDocsUserIsOwner' }),
          }),
        ]);

        if (!rrRes.ok) throw new Error(`Failed to fetch writable docs: ${rrRes.status}`);
        if (!ownerRes.ok) throw new Error(`Failed to fetch owned docs: ${ownerRes.status}`);

        const { docs: rw } = await rrRes.json();
        const { docs: ow } = await ownerRes.json();
        setReadWriteDocs(rw);
        setOwnedDocs(ow);
      } catch (err) {
        console.error(err);
        alert('Unable to load documents. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, maintenanceBypass, router]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user?requestType=getUserData`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          console.error('User fetch error:', await res.text());
          return;
        }
        const { username, email, pfpUrl } = await res.json();
        setUserMini({ userName: username ?? '', email: email ?? '', avatarUrl: pfpUrl ?? '' });
      } catch (err) {
        console.error('Failed to fetch mini user data', err);
      }
    })();
  }, [token]);

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
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'create' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      const key = url.split('/').pop()!;
      setOwnedDocs(prev => [key, ...prev.filter(k => k !== key)]);
      router.push(`/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

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

  const allDocs = [...ownedDocs, ...readWriteDocs.filter(doc => !ownedDocs.includes(doc))];

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-white">
        <header className="relative flex justify-between items-center px-6 py-3 bg-white shadow-md">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex items-center">
            <button
              onClick={handleCreate}
              className="flex items-center px-4 py-2 bg-white text-brand-ivory rounded-lg hover:bg-gray-100 transition mr-4"
            >
              <img src="/newfileicon.svg" alt="New Document" className="w-5 h-5 mr-2" />
              New Document
            </button>
            <div className="relative">
              <img
                src={`${API_BASE}/${userMini.avatarUrl}` || '/profileicon.svg'}
                alt="Profile Icon"
                className="w-8 h-8 rounded-full object-cover cursor-pointer focus:outline-none hover:outline-none hover:ring-2 hover:ring-gray-100 hover:ring-offset-0 transition"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 shadow-md rounded-lg py-2">
                  <div className="px-4 py-2">
                    <p className="font-semibold text-lg truncate">{userMini.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{userMini.email}</p>
                  </div>
                  <hr className="border-gray-200 my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <img src="profileicon.svg" alt="Profile" className="w-4 h-4 mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); localStorage.removeItem('token'); router.push('/login'); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <img src="logout.svg" alt="Logout" className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
          {allDocs.map(doc => (
            <button
              key={doc}
              onClick={() => router.push(`/${doc}`)}
              className="bg-white rounded-lg shadow-sm overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-orange transform hover:scale-105 hover:shadow-lg transition duration-200"
            >
              <div className="h-40 flex items-center justify-center shadow-xs">
                <img src="file.svg" alt={`${doc} preview`} className="w-20 h-20 object-cover" />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg truncate inline-block">{doc}</h3>
                {readWriteDocs.includes(doc) && !ownedDocs.includes(doc) && (
                  <img src="/icons/share.svg" alt="Share icon" className="inline-block w-4 h-4 ml-2 align-middle" />
                )}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
