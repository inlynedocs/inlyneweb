'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import RichTextEditor from '../components/rich-text-editor/RichTextEditor';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.inlyne.link';

export default function DocEditorPage() {
  const { docKey: raw } = useParams();
  const docKey = Array.isArray(raw) ? raw[0] : raw;
  const router = useRouter();

  // Sidebar docs list
  const [docs, setDocs] = useState<string[]>([]);
  // Page + doc state
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'public' | 'writer'>('public');
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState('<p></p>');

  // UI state for profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /* --------------------------- load sidebar docs -------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) setDocs(JSON.parse(stored));
  }, []);

  /* -------------------------- fetch document meta ------------------------- */
  useEffect(() => {
    if (!docKey) return;
    setLoading(true);
    fetch(`${API_BASE}/${docKey}`, {
      headers: { Accept: 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    })
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'success') throw new Error(data.details || data.message);
        setAccessLevel(data.accessLevel);
        setIsPublic(data.doc.isPublic ?? false);
        if (data.accessLevel === 'writer') setContent(data.doc.content || '<p></p>');
      })
      .catch(err => {
        console.error('Load failed:', err);
        alert('Could not load document: ' + err.message);
        if (err.message?.toLowerCase().includes('auth')) router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [docKey, token, router]);

  /* --------------------------------- save --------------------------------- */
  const handleSave = useCallback(async () => {
    if (!token) return router.push('/login');
    try {
      const res = await fetch(`${API_BASE}/docs/${docKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || `HTTP ${res.status}`);
      alert('Saved!');
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Save failed: ' + err.message);
    }
  }, [content, docKey, token, router]);

  /* --------------------------- toggle public flag ------------------------- */
  const handleToggle = useCallback(async () => {
    if (!token) return router.push('/login');
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
      console.error(err);
      alert('Toggle failed: ' + err.message);
    }
  }, [isPublic, docKey, token, router]);

  /* --------------------------- render loading ----------------------------- */
  if (loading || !docKey) {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

  /* -------------------------------- render -------------------------------- */
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar documents={docs} />
      <div className="flex-1 flex flex-col">
        {/* unified header with profile dropdown + doc controls */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md relative">
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

            {/* profile icon dropdown */}
            <div className="relative">
              <img
                src="/profileicon.svg"
                alt="Profile Icon"
                className="w-8 h-8 rounded cursor-pointer"
                onClick={() => setMenuOpen(prev => !prev)}
              />
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
                  <button
                    onClick={() => { setMenuOpen(false); router.push('/profile'); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); localStorage.removeItem('token'); router.push('/login'); }}
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
