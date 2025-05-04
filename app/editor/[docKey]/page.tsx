// app/editor/[docKey]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import RichTextEditor from '../../components/rich-text-editor/RichTextEditor';

export default function DocEditorPage() {
  const { docKey } = useParams();                // grabs { docKey } from /editor/:docKey
  const [docs, setDocs] = useState<string[]>([]);

  // Load the same persisted list from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('inlyne-docs');
    if (stored) {
      try {
        setDocs(JSON.parse(stored));
      } catch {
        setDocs([]);
      }
    }
  }, []);

  // Local state for the editor’s HTML
  const [content, setContent] = useState('<p></p>');

  return (
    <div className="flex h-screen">
      {/* Sidebar with the same docs list */}
      <Sidebar documents={docs} />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          {/* Your existing RichTextEditor now gets the dynamic docKey */}
          <RichTextEditor
            content={content}
            onChange={setContent}
            docKey={docKey}
          />
        </main>
      </div>
    </div>
  );
}
