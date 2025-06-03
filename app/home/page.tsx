'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileMenu from '../components/ProfileMenu';


const MAINTENANCE_MODE  = false;
const BYPASS_USERNAME   = 'adminbrar';
const BYPASS_PASSWORD   = 'jivajBRAR0123@';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';

interface UserMini {
  userName: string;
  email:    string;
  avatarUrl:string;
}

interface Doc {
  linkKey:  string;
  docTitle: string;
}

export default function InlyneHomepage() {
  const router = useRouter();
  const token  = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [readWriteDocs,     setReadWriteDocs    ] = useState<Doc[]>([]);
  const [ownedDocs,         setOwnedDocs        ] = useState<Doc[]>([]);
  const [loading,           setLoading          ] = useState(true);
  const [maintenanceBypass, setMaintenanceBypass] = useState(false);
  const [bypassUser,        setBypassUser       ] = useState('');
  const [bypassPw,          setBypassPw         ] = useState('');
  const [userMini,          setUserMini         ] = useState<UserMini>({ userName: '', email: '', avatarUrl: '' });
  const [searchQuery,       setSearchQuery      ] = useState('');

  // bypass logic
  useEffect(() => {
    if (MAINTENANCE_MODE &&
        bypassUser === BYPASS_USERNAME &&
        bypassPw   === BYPASS_PASSWORD) {
      setMaintenanceBypass(true);
    }
  }, [bypassUser, bypassPw]);

  // fetch docs
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
              Accept:         'application/json',
              Authorization:  `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'getDocsUserCanReadWrite' }),
          }),
          fetch(`${API_BASE}/docs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept:         'application/json',
              Authorization:  `Bearer ${token}`,
            },
            body: JSON.stringify({ type: 'getDocsUserIsOwner' }),
          }),
        ]);

        if (!rrRes.ok)    throw new Error(`Failed to fetch writable docs: ${rrRes.status}`);
        if (!ownerRes.ok) throw new Error(`Failed to fetch owned docs:    ${ownerRes.status}`);

        const { docs: rw }: { docs: Doc[] } = await rrRes.json();
        const { docs: ow }: { docs: Doc[] } = await ownerRes.json();

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

  // fetch user info
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user?requestType=getUserData`, {
          headers: {
            Accept:        'application/json',
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

  // create new doc
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
          Accept:         'application/json',
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ type: 'create' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { url } = await res.json();
      const key = url.split('/').pop()!;
      // assume new docs use key as title until refreshed:
      setOwnedDocs(prev => [{ linkKey: key, docTitle: key }, ...prev.filter(d => d.linkKey !== key)]);
      router.push(`/${key}`);
    } catch (err: any) {
      console.error('Create failed:', err);
      alert(`Error creating document: ${err.message}`);
    }
  };

  // show bypass form if in maintenance
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

  // loading spinner
  if (loading) {
    return <div className="flex items-center justify-center h-screen" />;
  }

  // merge & de-dupe by linkKey
  const allDocs = [
    ...ownedDocs,
    ...readWriteDocs.filter(rw => !ownedDocs.some(ow => ow.linkKey === rw.linkKey)),
  ];

  // simple case-sensitive title filter
  const filteredDocs = searchQuery
    ? allDocs.filter(d => d.docTitle.includes(searchQuery.trim()))
    : allDocs;

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <Link href="/home" passHref className="flex items-center">
          <img src="inlyne_logo.png" alt="Inlyne Logo" className="h-8" />
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-white text-brand-ivory rounded-xl hover:bg-gray-100 transition"
          >
            <img src="/newfileicon.svg" alt="New Document" className="w-5 h-5 mr-2" />
            New Document
          </button>
          <ProfileMenu
                avatarSrc={`${API_BASE}${userMini.avatarUrl}`}
                userName={userMini.userName}
                email={userMini.email}
          />
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-6 py-5">
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">Documents</h1>
            <div className="relative w-full sm:w-auto">
              <img
                src="/search.svg"
                alt="Search"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              />
              <input
                type="text"
                placeholder="Search documents"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDocs.map(doc => (
              <button
                key={doc.linkKey}
                onClick={() => router.push(`/${doc.linkKey}`)}
                className="bg-white rounded-lg shadow-sm overflow-hidden text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-200 transform hover:scale-105 hover:shadow-lg transition duration-200"
              >
                <div className="h-40 flex items-center justify-center shadow-xs">
                  <img src="file.svg" alt={`${doc.docTitle} preview`} className="w-20 h-20 object-cover" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg truncate inline-block">{doc.docTitle}</h3>
                  {readWriteDocs.some(rw => rw.linkKey === doc.linkKey) &&
                   !ownedDocs.some(ow => ow.linkKey === doc.linkKey) && (
                    <img src="share.svg" alt="Share" className="inline-block w-4 h-4 ml-2" />
                  )}
                </div>
              </button>
            ))}
            {filteredDocs.length === 0 && (
              <p className="col-span-full py-6 text-center text-gray-500">No documents found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
