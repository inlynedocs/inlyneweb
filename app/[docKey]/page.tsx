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

  // Sidebar state
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'public' | 'writer'>('public');
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState('<p></p>');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // load sidebar
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) setDocs(JSON.parse(stored));
  }, []);

  // fetch doc via public endpoint (or auth)
  useEffect(() => {
    if (!docKey) return;
    setLoading(true);
    fetch(`${API_BASE}/${docKey}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'success') {
          throw new Error(data.details || data.message || 'Load error');
        }
        setAccessLevel(data.accessLevel);
        setIsPublic(data.doc.isPublic ?? false);
        if (data.accessLevel === 'writer') {
          setContent(data.doc.content || '<p></p>');
        }
      })
      .catch(err => {
        console.error('Load failed:', err);
        alert('Could not load document: ' + err.message);
        if (err.message.toLowerCase().includes('auth')) {
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [docKey, token, router]);

  // save
  const handleSave = useCallback(async () => {
    if (!token) return router.push('/login');
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
      alert('Save failed: ' + err.message);
    }
  }, [content, docKey, token, router]);

  // toggle public
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

  if (loading || !docKey) {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar documents={docs} />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white shadow">
          <h2 className="truncate">Editing: {docKey}</h2>
          {accessLevel === 'writer' && (
            <div className="flex space-x-2">
              <button onClick={handleSave} className="btn btn-primary">Save</button>
              <button onClick={handleToggle} className="btn">{isPublic ? 'Make Private' : 'Make Public'}</button>
            </div>
          )}
        </header>
        <main className="flex-1 p-6 overflow-auto bg-brand-ivory relative">
          <RichTextEditor content={content} onChange={setContent} docKey={docKey} />
          {accessLevel === 'writer' && (
            <button onClick={handleSave} className="absolute bottom-4 right-4 btn-save">Save Document</button>
          )}
        </main>
      </div>
    </div>
  );
}
