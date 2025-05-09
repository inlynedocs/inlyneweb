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

const API_BASE = "https://localhost:8080";
const WS_URL = `${API_BASE}/ws`;

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  docKey: string;
}

export default function RichTextEditor({
  content,
  onChange,
  docKey,
}: RichTextEditorProps) {
  const stompRef = useRef<Client | null>(null);

  // 1) init Tiptap with your exact styling
  const editor = useEditor({
    editable: true,
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
      const html = editor.getHTML();
      onChange(html);
      // 4) publish local changes
      if (stompRef.current?.active) {
        stompRef.current.publish({
          destination: `/app/editor/${docKey}`,
          body: JSON.stringify({ content: html }),
        });
      }
    },
    editorProps: {
      attributes: {
        class: 'min-h-[156px] backdrop-blur-sm shadow-md rounded-md bg-slate-50 py-2 px-3 focus:outline-none',
      },
    },
  });

  // 2) fetch initial content once
  useEffect(() => {
    if (!editor) return;
    fetch(`${API_BASE}/docs/${docKey}`)
      .then((r) => r.json())
      .then((doc) => {
        editor.commands.setContent(doc.content || '');
      })
      .catch(console.error);
  }, [docKey, editor]);

  // 3) STOMP subscribe + sync
  useEffect(() => {
    if (!editor) return;

    // tear down previous
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
        // only overwrite if it’s different
        if (editor.getHTML() !== incoming) {
          editor.commands.setContent(incoming);
        }
      });
    };

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [docKey, editor]);

  if (!editor) return null;

  return (
    <div>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
