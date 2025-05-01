'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Highlighter,
  Heading1, Heading2, Heading3,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Strikethrough, Image as ImageIcon
} from 'lucide-react';
import { Toggle } from '../ui/Toggle';

interface MenuBarProps { editor: Editor | null }

export default function MenuBar({ editor }: MenuBarProps) {
  if (!editor) return null;

  const controls = [
    { icon: <Bold size={16}/>,   cmd: () => editor.chain().focus().toggleBold().run(),   active: editor.isActive('bold') },
    { icon: <Italic size={16}/>, cmd: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { icon: <Highlighter size={16}/>, cmd: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive('highlight') },
    { icon: <Heading1 size={16}/>, cmd: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }) },
    { icon: <Heading2 size={16}/>, cmd: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
    { icon: <Heading3 size={16}/>, cmd: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
    { icon: <List size={16}/>, cmd: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
    { icon: <ListOrdered size={16}/>, cmd: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
    { icon: <AlignLeft size={16}/>, cmd: () => editor.chain().focus().setTextAlign('left').run(), active: editor.isActive({ textAlign: 'left' }) },
    { icon: <AlignCenter size={16}/>, cmd: () => editor.chain().focus().setTextAlign('center').run(), active: editor.isActive({ textAlign: 'center' }) },
    { icon: <AlignRight size={16}/>, cmd: () => editor.chain().focus().setTextAlign('right').run(), active: editor.isActive({ textAlign: 'right' }) },
    { icon: <Strikethrough size={16}/>, cmd: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike') },
    { icon: <ImageIcon size={16}/>, cmd: () => {
        const url = window.prompt('Image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
      }, active: false },
  ];

  return (
    <div className="flex flex-wrap gap-1 border rounded-md p-2 bg-white mb-4">
      {controls.map((c,i) => (
        <Toggle key={i} pressed={c.active} onPressedChange={c.cmd} variant="outline">
          {c.icon}
        </Toggle>
      ))}
    </div>
  );
}
