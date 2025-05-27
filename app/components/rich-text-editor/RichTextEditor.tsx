'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit                    from '@tiptap/starter-kit';
import TextStyleBase                 from '@tiptap/extension-text-style';
import Color                         from '@tiptap/extension-color';
import TextAlign                     from '@tiptap/extension-text-align';
import Highlight                     from '@tiptap/extension-highlight';
import Image                         from '@tiptap/extension-image';
import Placeholder                   from '@tiptap/extension-placeholder';
import MenuBar                       from './Menubar';

import SockJS                        from 'sockjs-client';
import { Client, IMessage }         from '@stomp/stompjs';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.inlyne.link';
const WS_URL   = `${API_BASE}/ws`;

// 3) Extend TextStyle to honor `class` attributes
const TextStyle = TextStyleBase.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class') ?? undefined,
        renderHTML: attributes => {
          return attributes.class ? { class: attributes.class } : {};
        },
      },
    };
  },
});

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('token') ?? undefined : undefined;

interface Props {
  content : string;
  onChange: (html: string) => void;
  docKey  : string;
}

export default function RichTextEditor({ content, onChange, docKey }: Props) {
  const stompRef    = useRef<Client|null>(null);
  const suppressRef = useRef(false);

  const editor = useEditor({
    content,
    immediatelyRender: false,
    autofocus        : 'end',
    extensions: [
      StarterKit.configure({
        history: false,
        bulletList:   { HTMLAttributes: { class: 'list-disc ml-5'    } },
        orderedList:  { HTMLAttributes: { class: 'list-decimal ml-5' } },
      }),
      TextStyle,   // ← use extended TextStyle here
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image,
      Placeholder.configure({ placeholder: 'Start writing here…' }),
    ],
    editorProps: {
      attributes: {
        class:
          'min-h-screen flex-1 overflow-auto p-6 w-80vw ' +
          'bg-white rounded-b-lg focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      console.log('Current font-size class:', editor.getAttributes('textStyle').class);
      const html = editor.getHTML();
      onChange(html);

      if (suppressRef.current) return;

      if (stompRef.current?.connected) {
        stompRef.current.publish({
          destination: `/app/edit/${docKey}`,
          body       : JSON.stringify({ content: html }),
        });
      }

      const token = getToken();
      if (token) {
        fetch(
          `${API_BASE}/docs?requestType=updateDoc&key=${encodeURIComponent(docKey)}`,
          {
            method : 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization : `Bearer ${token}`,
            },
          }
        ).catch(err => console.error('Auto-save failed', err));
      }
    },
  });

  useEffect(() => {
    if (!editor) return;
    stompRef.current?.deactivate();

    const client = new Client({
      webSocketFactory : () => new SockJS(WS_URL),
      reconnectDelay   : 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      connectHeaders   : getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
      debug            : msg => console.log('[STOMP]', msg),
      onConnect() {
        client.subscribe(`/topic/docs/${docKey}`, (frame: IMessage) => {
          const { content: remote } = JSON.parse(frame.body);
          if (!remote || remote === editor.getHTML()) return;
          suppressRef.current = true;
          editor.commands.setContent(remote, false);
          onChange(remote);
          suppressRef.current = false;
        });

        fetch(
          `${API_BASE}/docs?requestType=getDoc&key=${encodeURIComponent(docKey)}`,
          { headers: { Accept: 'application/json' } }
        )
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data: { doc?: {content: string} }) => {
            const saved = data.doc?.content || '';
            if (saved !== editor.getHTML()) {
              suppressRef.current = true;
              editor.commands.setContent(saved, false);
              onChange(saved);
              suppressRef.current = false;
            }
          })
          .catch(err => console.error('Failed to load doc', err));
      },
      onStompError: frame => console.error('STOMP error', frame.headers['message'], frame.body),
    });

    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [editor, docKey, onChange]);

  if (!editor) return null;
  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <div className="flex items-center bg-white shadow-sm rounded-t-lg">
        <MenuBar editor={editor} />
      </div>
      <div className="tiptap-editor flex-1 overflow-auto bg-white p-6 rounded-b-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
