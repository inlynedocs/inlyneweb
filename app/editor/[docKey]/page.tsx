// app/editor/[docKey]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import RichTextEditor from '../../components/rich-text-editor/RichTextEditor';

export default function DocEditorPage() {
  const { docKey: raw } = useParams();            // → the dynamic segment from /editor/abc123
  const docKey = Array.isArray(raw) ? raw[0] : raw; // handle array case
  const [docs, setDocs] = useState<string[]>([]);

  // load your persisted list so the sidebar stays in sync
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) setDocs(JSON.parse(stored));
  }, []);

  // local state for the HTML content
  const [content, setContent] = useState('<p></p>');

  return (
    <div className="flex h-screen">
      <Sidebar documents={docs} />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {docKey ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              docKey={docKey}           // ← crucial for sync!
            />
          ) : (
            <p>Loading document…</p>
          )}
        </main>
      </div>
    </div>
  );
}
