// app/components/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useState } from 'react';

export default function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({ placeholder: 'Type your documentation here…' }),
    ],
    content: '',
  });

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
            const url = window.prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="cursor-pointer px-3 py-1 rounded hover:bg-brand-olive/20 focus:ring-2 focus:ring-brand-orange transition"
        >
          Img
        </button>
      </div>

      {/* Editable area is the EditorContent itself */}
      <EditorContent
        editor={editor}
        className="
          border-2 border-brand-olive rounded-lg
          bg-brand-ivory p-4 min-h-[12rem]
          outline-none
          focus:outline-none focus:ring-2 focus:ring-brand-orange
          transition
        "
      />

      {/* Generate Link */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => {
            const html = editor.getHTML();
            const link = `${window.location.origin}/document/${encodeURIComponent(html)}`;
            navigator.clipboard.writeText(link);
            alert('🔗 Link copied to clipboard!');
          }}
          className="
            cursor-pointer px-6 py-3 bg-brand-orange text-brand-ivory rounded-lg
            hover:bg-brand-orange/90 focus:ring-2 focus:ring-brand-orange
            transition focus:outline-none
          "
        >
          Generate Link
        </button>
      </div>
    </div>
  );
}
