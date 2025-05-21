'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import RichTextEditor from '../components/rich-text-editor/RichTextEditor';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.inlyne.link';
interface UserMini {
  userName: string;
  email:   string;
  avatarUrl: string;
}

export default function DocEditorPage() {
  const { docKey: raw } = useParams();
  const docKey = Array.isArray(raw) ? raw[0] : raw;
  const router = useRouter();

  // If docKey is missing or wrong length, immediately redirect to /home
  useEffect(() => {
    if (!docKey || docKey.length !== 8) {
      router.replace('/home');
    }
  }, [docKey, router]);

  // Prevent any rendering while redirecting
  if (!docKey || docKey.length !== 8) {
    return null;
  }

  // Sidebar docs list
  const [docs, setDocs] = useState<string[]>([]);
  // Page + doc state
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'public' | 'writer'>('public');
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState('<p></p>');
  const [userMini, setUserMini] = useState<UserMini>({ userName: '', email: '', avatarUrl: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /* --------------------------- load sidebar docs -------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) setDocs(JSON.parse(stored));
  }, []);

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
        if (!res.ok) throw new Error(await res.text());
        const { username, email, pfpUrl } = await res.json();
        setUserMini({ userName: username, email, avatarUrl: pfpUrl });
      } catch (err) {
        console.error('Failed to fetch mini user data', err);
      }
    })();
  }, [token]);

  /* -------------------------- fetch document meta ------------------------- */
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/${docKey}`, {
      headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status !== 'success') {
          const message = data.details || data.message || 'Unknown error';
          console.error('Load failed:', message);
          alert(`Could not load document: ${message}`);
          if (message.toLowerCase().includes('auth')) {
            router.replace('/login');
          } else {
            router.replace('/home');
          }
          return;
        }
        setAccessLevel(data.accessLevel);
        setIsPublic(data.doc.isPublic ?? false);
        if (data.accessLevel === 'writer') setContent(data.doc.content || '<p></p>');
      })
      .catch(err => {
        console.error('Fetch error:', err);
        alert(`Could not load document: ${err.message || 'Fetch error'}`);
        router.replace('/home');
      })
      .finally(() => setLoading(false));
  }, [docKey, token, router]);

  /* --------------------------------- save --------------------------------- */
  const handleSave = useCallback(async () => {
    if (!token) return router.replace('/login');
    try {
      const res = await fetch(`${API_BASE}/docs/${docKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || `HTTP ${res.status}`);
      }
      alert('Saved!');
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Save failed: ' + (err.message || 'Unknown error'));
    }
  }, [content, docKey, token, router]);

  /* --------------------------- toggle public flag ------------------------- */
  const handleToggle = useCallback(async () => {
    if (!token) return router.replace('/login');
    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'setPublic', docId: docKey, public: !isPublic }),
      });
      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.message);
      setIsPublic(data.isPublic);
      alert(`Now ${data.isPublic ? 'Public' : 'Private'}`);
    } catch (err: any) {
      console.error('Toggle failed:', err);
      alert('Toggle failed: ' + (err.message || 'Unknown error'));
    }
  }, [isPublic, docKey, token, router]);

  /* -------------------------------- render -------------------------------- */
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar/>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 bg-white shadow-md relative">
          <h2 className="text-lg font-medium truncate">Editing: {docKey}</h2>
          <div className="flex items-center space-x-4">
            {accessLevel === 'writer' && (
              <div className="flex space-x-3">
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Save
                </button>
                <button onClick={handleToggle} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                  {isPublic ? 'Make Private' : 'Make Public'}
                </button>
              </div>
            )}
            <div className="relative">
              <img
                src={`${API_BASE}/${userMini.avatarUrl}` || "/profileicon.svg"}
                alt="Profile Icon"
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => setMenuOpen(prev => !prev)}
              />
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
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
                    onClick={() => { setMenuOpen(false); localStorage.removeItem('token'); router.replace('/login'); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gray-50 overflow-auto relative">
          <RichTextEditor content={content} onChange={setContent} docKey={docKey} />
          {accessLevel === 'writer' && (
            <button
              onClick={handleSave}
              className="absolute bottom-4 right-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
            >
              Save Document
            </button>
          )}
        </main>
      </div>
    </div>
  );
}
