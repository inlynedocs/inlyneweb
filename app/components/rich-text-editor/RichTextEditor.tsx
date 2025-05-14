'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit     from '@tiptap/starter-kit';
import TextAlign      from '@tiptap/extension-text-align';
import Highlight      from '@tiptap/extension-highlight';
import Image          from '@tiptap/extension-image';
import Placeholder    from '@tiptap/extension-placeholder';
import MenuBar        from './Menubar';

import SockJS                 from 'sockjs-client';
import { Client, IMessage }   from '@stomp/stompjs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';
const WS_URL   = `${API_BASE}/ws`;   // SockJS expects http(s)

/* ───────────────── helper ───────────────── */
// guard `localStorage` for SSR
const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined;

interface Props {
  content : string;
  onChange: (html: string) => void;
  docKey  : string;
}

/* ─────────────────────────────────────────────────────────── */

export default function RichTextEditor({
  content,
  onChange,
  docKey,
}: Props) {
  const stompRef            = useRef<Client | null>(null);
  const [saving, setSaving] = useState(false);

  /* ─── TipTap setup ─── */
  const editor = useEditor({
    content,
    autofocus: 'end',
    editable : true,
    extensions: [
      StarterKit.configure({
        bulletList : { HTMLAttributes: { class: 'list-disc ml-5'   }},
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-5'}},
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image,
      Placeholder.configure({ placeholder: 'Start writing here…' }),
    ],
    editorProps: {
      attributes: {
        class:
          'prose prose-lg max-w-none flex-1 overflow-auto p-6 ' +
          'bg-white rounded-b-lg focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/edit/${docKey}`,
          body       : JSON.stringify({ content: html }),
        });
      }
    },
  });

  /* sync TipTap if parent `content` changes */
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false); // keep cursor
    }
  }, [editor, content]);

  /* ─── STOMP connect / disconnect ─── */
  useEffect(() => {
    if (!editor) return;

    // clean up any previous connection
    stompRef.current?.deactivate();

    const client = new Client({
      webSocketFactory : () => new SockJS(WS_URL),
      reconnectDelay   : 5_000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20_000,
      debug            : msg => console.log('[STOMP]', msg),
      connectHeaders   : getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      onConnect() {
        console.log('✅ STOMP connected');

        client.subscribe(`/topic/docs/${docKey}`, (frame: IMessage) => {
          const { content: incoming } = JSON.parse(frame.body);
          if (incoming && incoming !== editor.getHTML()) {
            editor.commands.setContent(incoming, false);
          }
        });

        client.subscribe('/user/queue/errors', f =>
          console.error('🚨 broker error', JSON.parse(f.body)),
        );
      },
      onStompError: f =>
        console.error('🛑 STOMP frame error', f.headers['message'], f.body),
    });

    client.activate();
    stompRef.current = client;

    /* cleanup must be synchronous → do not return a Promise */
    return () => {
      // fire‑and‑forget; React ignores any returned value
      client.deactivate();
    };
  }, [editor, docKey]);

  /* ─── explicit SAVE (REST) ─── */
  const handleSave = useCallback(async () => {
    if (!editor) return;

    const html = editor.getHTML();
    onChange(html);
    setSaving(true);

    const token = getToken();

    try {
      // live broadcast for other tabs
      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/edit/${docKey}`,
          body       : JSON.stringify({ content: html }),
        });
      }

      // persist to server
      const res = await fetch(`${API_BASE}/docs/${docKey}`, {
        method : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: html }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== 'success') throw new Error(data.message ?? 'unknown error');

      alert('Document saved successfully.');
    } catch (err: any) {
      console.error(err);
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }, [editor, onChange, docKey]);

  if (!editor) return null;

  /* ─── render ─── */
  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      {/* toolbar + save */}
      <div className="flex items-center justify-between bg-white shadow-sm rounded-t-lg">
        <MenuBar editor={editor} />
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 text-white rounded-r-lg transition
            ${saving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
