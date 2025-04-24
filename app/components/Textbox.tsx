// app/components/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useRouter, useSearchParams } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const WS_URL  = `${API_BASE}/ws`;

export default function RichTextEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [docKey, setDocKey] = useState<string | null>(null);
  const stompRef = useRef<Client | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: 'Type your documentation here…' }),
    ],
    content: '',
  });

  // On mount or URL change: fetch existing document
  useEffect(() => {
    const key = searchParams.get('docKey');
    if (key && editor) {
      setDocKey(key);
      fetchDoc(key);
    }
  }, [searchParams, editor]);

  async function fetchDoc(key: string) {
    try {
      const res = await fetch(`${API_BASE}/docs/${key}`);
      if (!res.ok) throw new Error('Not found');
      const doc = await res.json();
      editor?.commands.setContent(doc.content || '');
      connectWebSocket(key);
    } catch (err) {
      console.error('Document not found:', key);
    }
  }

  // Create a new document
  async function createNewDoc() {
    const res = await fetch(`${API_BASE}/docs`, { method: 'POST' });
    const json = await res.json(); // { url: '.../docs/{key}' }
    const key = json.url.split('/').pop();
    if (key) {
      setDocKey(key);
      router.replace(`${key}`);
      editor?.commands.clearContent();
      connectWebSocket(key);
    }
  }

  // Connect STOMP over SockJS
  function connectWebSocket(key: string) {
    stompRef.current?.deactivate();

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/docs/${key}`, msg => {
        const { content } = JSON.parse(msg.body);
        editor?.commands.setContent(content);
      });
    };

    client.activate();
    stompRef.current = client;
  }

  // Publish updates on local change
  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      if (stompRef.current?.active && docKey) {
        stompRef.current.publish({
          destination: `/app/edit/${docKey}`,
          body: JSON.stringify({ content: editor.getHTML() }),
        });
      }
    };
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    };
  }, [editor, docKey]);

  if (!editor) return null;

  return (
    <div className="max-w-xl mx-auto mt-12 bg-brand-cream shadow-lg rounded-2xl p-6">

      {/* Toolbar */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`
            cursor-pointer px-3 py-1 rounded transition
            ${editor.isActive('bold')
              ? 'bg-brand-olive/50 ring-2 ring-brand-orange'
              : 'hover:bg-brand-olive/20 focus:ring-2 focus:ring-brand-orange'}
          `}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`
            cursor-pointer px-3 py-1 rounded transition
            ${editor.isActive('italic')
              ? 'bg-brand-olive/50 ring-2 ring-brand-orange'
              : 'hover:bg-brand-olive/20 focus:ring-2 focus:ring-brand-orange'}
          `}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => {
            const url = prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="cursor-pointer px-3 py-1 rounded hover:bg-brand-olive/20 focus:ring-2 focus:ring-brand-orange transition"
        >
          Img
        </button>
      </div>

      {/* Editable area */}
      <EditorContent
        editor={editor}
        className="
          border-2 border-brand-olive rounded-lg
          bg-brand-ivory p-4 min-h-[12rem]
          outline-none focus:ring-2 focus:ring-brand-orange transition
        "
      />

      {/* Create or display document link */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={createNewDoc}
          className="px-4 py-2 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition"
        >
          {docKey ? 'New Document' : 'Create New Document'}
        </button>
        {docKey && (
          <span className="text-sm text-brand-olive">
            Link: <code>{docKey}</code>
          </span>
        )}
      </div>

      {/* Optional manual link copy */}
      {docKey && (
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              const html = editor.getHTML();
              const link = `${window.location.origin}/document/${encodeURIComponent(html)}`;
              navigator.clipboard.writeText(link);
              alert('🔗 Link copied!');
            }}
            className="px-6 py-3 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition focus:ring-2 focus:ring-brand-orange"
          >
            Generate Link
          </button>
        </div>
      )}
    </div>
  );
}