'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import Sidebar from '../components/Sidebar';
import RichTextEditor from '../components/rich-text-editor/RichTextEditor';
import ProfileMenu from '../components/ProfileMenu';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';

interface UserMini {
  userName: string;
  email: string;
  avatarUrl: string;
}

export default function DocEditorPage() {
  const { docKey: raw } = useParams();
  const docKey = Array.isArray(raw) ? raw[0] : raw;
  const router = useRouter();

  // Basic UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessLevel, setAccessLevel] = useState<'public' | 'writer'>('public');
  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState('<p></p>');
  const [docTitle, setDocTitle] = useState('');
  const [userMini, setUserMini] = useState<UserMini>({ userName: '', email: '', avatarUrl: '' });

  // Permission-related lists
  const [owner, setOwner] = useState<UserMini | null>(null);
  const [adminsList, setAdminsList] = useState<UserMini[]>([]);
  const [writersList, setWritersList] = useState<UserMini[]>([]);
  const [readersList, setReadersList] = useState<UserMini[]>([]);

  // UI interactions
  const [hoverCopy, setHoverCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Add-permission form
  const [newPermissionUserEmail, setNewPermissionUserEmail] = useState('');
  const [newPermissionRole, setNewPermissionRole] = useState<'reader'|'writer'|'admin'>('reader');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Redirect if missing/invalid docKey
  useEffect(() => {
    if (!docKey || docKey.length !== 8) router.replace('/home');
  }, [docKey, router]);
  if (!docKey || docKey.length !== 8) return null;

  // Fetch current user info
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/user?requestType=getUserData`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : Promise.reject('User fetch error'))
      .then(({ username, email, pfpUrl }) => setUserMini({ userName: username, email, avatarUrl: pfpUrl }))
      .catch(console.error);
  }, [token]);

  // Fetch document metadata, content, and permission lists
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/${docKey}`, {
      headers: { Accept: 'application/json', ... (token ? { Authorization: `Bearer ${token}` } : {}) },
    })
      .then(res => res.json())
      .then(data => {
        if (data.status !== 'success') {
          const msg = data.details || data.message || '';
          if (/auth/i.test(msg)) router.replace('/login');
          else router.replace('/home');
          return;
        }
        const doc = data.doc;
        setAccessLevel(data.accessLevel);
        setIsPublic(doc.isPublic ?? true);
        setDocTitle(doc.title || '');

        setOwner(
          doc.owner
            ? { userName: doc.owner.username, email: doc.owner.email, avatarUrl: doc.owner.pfpUrl }
            : null
        );
        setAdminsList(
          (doc.admins || []).map((u: any) => ({ userName: u.username, email: u.email, avatarUrl: u.pfpUrl }))
        );
        setWritersList(
          (doc.writers || []).map((u: any) => ({ userName: u.username, email: u.email, avatarUrl: u.pfpUrl }))
        );
        setReadersList(
          (doc.readers || []).map((u: any) => ({ userName: u.username, email: u.email, avatarUrl: u.pfpUrl }))
        );

        if (data.accessLevel === 'writer') setContent(doc.content || '<p></p>');
      })
      .catch(err => { console.error('Fetch document failed', err); router.replace('/home'); })
      .finally(() => setLoading(false));
  }, [docKey, token, router]);

  // Permissions logic
  const isAdminOrOwner = Boolean(
    owner && userMini.email === owner.email ||
    adminsList.some(a => a.email === userMini.email)
  );
  // Anyone can edit if doc is public; otherwise only writers
  const canEdit = isPublic || accessLevel === 'writer';

  // Handlers
  const handleSave = useCallback(async () => {
    if (!token) return router.replace('/login');
    try {
      const res = await fetch(`${API_BASE}/docs/${docKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Save failed');
    } catch (err: any) {
      console.error(err);
      alert(`Save failed: ${err.message}`);
    }
  }, [content, docKey, token, router]);

  const handleToggle = useCallback(async () => {
    if (!token) return router.replace('/login');
    const payload = { type: 'setPublic', docId: docKey, public: !isPublic, docTitle };
    console.log('Toggle payload:', payload);
    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Toggle response:', data);
      if (data.status !== 'success') throw new Error(data.message || 'Toggle failed');
      setIsPublic(data.isPublic);
    } catch (err: any) {
      console.error(err);
      alert(`Toggle failed: ${err.message}`);
    }
  }, [isPublic, docKey, docTitle, token, router]);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://www.inlyne.link/${docKey}`);
    setCopied(true);
    setHoverCopy(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/${docKey}`;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  const handleAddPermission = useCallback(async () => {
    if (!token) return router.replace('/login');
    try {
      const res = await fetch(`${API_BASE}/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          type: 'updateDocPermissions',
          docId: docKey,
          updates: [{ userEmail: newPermissionUserEmail, role: newPermissionRole, mode: 'add' }],
        }),
      });
      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.message || 'Permission update failed');
      setNewPermissionUserEmail('');
    } catch (err: any) {
      console.error(err);
      alert(`Permission update failed: ${err.message}`);
    }
  }, [newPermissionUserEmail, newPermissionRole, docKey, token, router]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading…</div>;

  return (
    <>
      <div className={`flex h-screen overflow-hidden ${shareOpen ? 'filter blur-sm pointer-events-none' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center px-6 py-3 border-b border-gray-200 bg-white shadow space-x-4">
            {sidebarCollapsed && (
              <>
                <button onClick={() => setSidebarCollapsed(false)}>
                  <Image src="sidebar.svg" alt="Open sidebar" width={24} height={24} />
                </button>
                <Link href="/home">
                  <img src="/inlyne_bracket_icon.png" alt="Logo" className="h-8" />
                </Link>
              </>
            )}
            <h2 className="text-xl font-bold truncate">{docKey}</h2>
            <button
              onClick={copyLink}
              onMouseEnter={() => setHoverCopy(true)}
              onMouseLeave={() => setHoverCopy(false)}
              className="flex justify-center items-center text-sm bg-gray-100 w-24 text-gray-600 rounded-lg px-2 py-0.5 hover:bg-gray-200 transition"
            >
              {copied ? (
                <>
                  <Image src="/checkmark.svg" alt="Copied" width={16} height={16} className="mr-1" />
                  Copied
                </>
              ) : hoverCopy ? (
                <>
                  <Image src="/copy.svg" alt="Copy" width={16} height={16} className="mr-1" />
                  Copy
                </>
              ) : (
                <>
                  <span>{docKey}</span>
                  <Image src="/link.svg" alt="link" width={16} height={16} className="ml-1" />
                </>
              )}
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center space-x-1 px-4 py-2 rounded-full border border-gray-300 mr-6 hover:bg-gray-100 transition"
              >
                {isPublic ? (
                  <Image src="/globe.svg" alt="Public" width={16} height={16} />
                ) : (
                  <Image src="/lock.svg" alt="Private" width={16} height={16} />
                )}
                <span>Share</span>
              </button>

              <ProfileMenu
                avatarSrc={`${API_BASE}${userMini.avatarUrl}`}
                userName={userMini.userName}
                email={userMini.email}
              />
            </div>
          </header>

          <main className="flex-1 bg-gray-50 overflow-auto relative">
            <RichTextEditor
              content={content}
              onChange={canEdit ? setContent : () => {} }
              /*readOnly={!canEdit}*/
              docKey={docKey}
            />
          </main>
        </div>
      </div>

      {shareOpen && (
  <div
    className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={() => setShareOpen(false)}
  >
    <div
      className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <h2 className="text-2xl font-semibold mb-1">Share this document</h2>
      <p className="text-sm text-gray-600 mb-6">
        {isPublic
          ? 'Anyone with the link can view this document.'
          : 'Only authorized users can access this document.'}
      </p>

      {/* Link row */}
      <div className="flex items-center space-x-2 mb-6">
        <input
          type="text"
          readOnly
          value={`${window.location.origin}/${docKey}`}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={copyShareLink}
          className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition"
        >
          Copy Link
        </button>
      </div>

      <hr className="border-gray-200 mb-6" />

      {/* People with access */}
      <h3 className="text-sm font-medium text-gray-700 mb-3">People with access</h3>
      <ul className="space-y-4 mb-6">
        {owner && (
          <li key={owner.email} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{owner.userName}</p>
              <p className="text-xs text-gray-500">{owner.email}</p>
            </div>
            <select
              value="owner"
              disabled
              className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 cursor-not-allowed"
            >
              <option>Owner</option>
            </select>
          </li>
        )}

        {adminsList.map(u => (
          <li key={u.email} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{u.userName}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <select
              defaultValue="admin"
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option value="reader">Can view</option>
              <option value="writer">Can edit</option>
              <option value="admin">Is admin</option>
            </select>
          </li>
        ))}

        {writersList.map(u => (
          <li key={u.email} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{u.userName}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <select
              defaultValue="writer"
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option value="reader">Can view</option>
              <option value="writer">Can edit</option>
              <option value="admin">Is admin</option>
            </select>
          </li>
        ))}

        {readersList.map(u => (
          <li key={u.email} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{u.userName}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
            <select
              defaultValue="reader"
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              <option value="reader">Can view</option>
              <option value="writer">Can edit</option>
              <option value="admin">Is admin</option>
            </select>
          </li>
        ))}
      </ul>

      {/* Add Permission */}
      {isAdminOrOwner && (
        <div className="space-y-2 mb-6">
          <label className="block text-sm font-medium">Add people</label>
          <div className="flex space-x-2">
            <input
              type="email"
              placeholder="User email"
              value={newPermissionUserEmail}
              onChange={e => setNewPermissionUserEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <select
              value={newPermissionRole}
              onChange={e => setNewPermissionRole(e.target.value as any)}
              className="w-32 border border-gray-300 rounded px-2 py-2 text-sm focus:outline-none"
            >
              <option value="reader">Reader</option>
              <option value="writer">Writer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleAddPermission}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Add
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center">
        {/* Toggle Public/Private */}
        <button
          onClick={handleToggle}
          disabled={!isAdminOrOwner}
          className={`px-3 py-1 border rounded text-sm transition ${
            isAdminOrOwner
              ? 'hover:bg-gray-100'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isPublic ? 'Make Private' : 'Make Public'}
        </button>

        {/* Close */}
        <button
          onClick={() => setShareOpen(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </>
  );
}
