'use client'

import { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold')
            ? 'px-3 py-1 rounded bg-brand-olive text-brand-ivory'
            : 'px-3 py-1 rounded hover:bg-brand-olive/20'
        }
      >
        B
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'px-3 py-1 rounded bg-brand-olive text-brand-ivory'
            : 'px-3 py-1 rounded hover:bg-brand-olive/20'
        }
      >
        I
      </button>
      <button
        onClick={() => {
          const url = window.prompt('Enter image URL')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }}
        className="px-3 py-1 rounded hover:bg-brand-olive/20"
      >
        Img
      </button>
    </div>
  )
}
