'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import MenuBar from './Menubar';

interface RichTextEditorProps {
  content: string;
  onUpdate: (html: string) => void;
}

export default function RichTextEditor({ content, onUpdate }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Image,
      Placeholder.configure({ placeholder: 'Type your documentation here…' }),
    ],
    content,
    autofocus: 'end',
    onUpdate: ({ editor }) => onUpdate(editor.getHTML()),
  });

  if (!editor) return <p>Loading editor…</p>;

  return (
    <div className="flex flex-col max-w-3xl mx-auto mt-8 p-6 bg-brand-cream rounded-2xl shadow-lg h-[70vh]">
      {/* Toolbar */}
      <MenuBar editor={editor} />

      {/* Editor area */}
      <div className="flex-1 mt-4 overflow-auto rounded-lg focus-within:ring-2 focus-within:ring-brand-orange transition">
        <EditorContent
          editor={editor}
          style={{ caretColor: '#FF4F18' }}
          className="ProseMirror h-full p-4 bg-brand-ivory focus:outline-none border-none"
        />
      </div>
    </div>
  );
}