// app/components/rich-text-editor/RichTextEditor.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import MenuBar from './Menubar';

import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const WS_URL = `${API_BASE}/ws`;

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  docKey?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  docKey,
}: RichTextEditorProps) {
  const stompRef = useRef<Client | null>(null);

  // initialize editor with your original UI classes
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: 'list-disc ml-3' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal ml-3' } },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image,
      Placeholder.configure({ placeholder: 'Type your docs here…' }),
    ],
    content,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // publish local edits
      if (stompRef.current?.active && docKey) {
        stompRef.current.publish({
          destination: `/app/edit/${docKey}`,
          body: JSON.stringify({ content: editor.getHTML() }),
        });
      }
    },
    editorProps: {
      attributes: {
        class: 'min-h-[156px] border rounded-md bg-slate-50 py-2 px-3 focus:outline-none',
      },
    },
  });

  // fetch existing doc when docKey changes
  useEffect(() => {
    if (!docKey || !editor) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/docs/${docKey}`);
        if (!res.ok) throw new Error('Not found');
        const { content: initial } = await res.json();
        editor.commands.setContent(initial || '');
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    })();
  }, [docKey, editor]);

  // setup STOMP subscription when docKey changes
  useEffect(() => {
    if (!docKey || !editor) return;

    stompRef.current?.deactivate();
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
    });
    client.onConnect = () => {
      client.subscribe(`/topic/docs/${docKey}`, (msg) => {
        const { content: incoming } = JSON.parse(msg.body);
        if (editor.getHTML() !== incoming) {
          editor.commands.setContent(incoming);
        }
      });
    };
    client.activate();
    stompRef.current = client;

    return () => void client.deactivate();
  }, [docKey, editor]);

  if (!editor) return null;

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
