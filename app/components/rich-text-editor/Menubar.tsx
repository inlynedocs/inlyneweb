'use client'
import React, { useState, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Type,
  Image as ImgIcon,
  Droplet,
} from "lucide-react";
import { Toggle } from "../ui/Toggle"
import { Editor } from "@tiptap/react";

const PRESET_SIZES = ["8px","10px","12px","14px","16px","18px","24px","32px","48px"];

export default function MenuBar({ editor }: { editor: Editor | null }) {
  const [inputSize, setInputSize] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  if (!editor) {
    return null;
  }

  // Keep the input in sync when cursor moves
  const syncSize = () => {
    const cur = editor.getAttributes("textStyle").fontSize as string | undefined;
    setInputSize(cur || "");
  };

  // Called on blur or Enter: apply the value
  const applySize = () => {
    const size = inputSize.trim();
    if (size) {
      editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
    }
    syncSize();
  };

  editor.on("selectionUpdate", syncSize);
  editor.on("transaction", syncSize);

  const Options = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      preesed: editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      preesed: editor.isActive("heading", { level: 2 }),
    },
    {
      icon: <Heading3 className="size-4" />,
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      preesed: editor.isActive("heading", { level: 3 }),
    },
    {
      icon: <Bold className="size-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      preesed: editor.isActive("bold"),
    },
    {
      icon: <Italic className="size-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      preesed: editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="size-4" />,
      onClick: () => editor.chain().focus().toggleStrike().run(),
      preesed: editor.isActive("strike"),
    },
    {
      icon: <AlignLeft className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("left").run(),
      preesed: editor.isActive({ textAlign: "left" }),
    },
    {
      icon: <AlignCenter className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("center").run(),
      preesed: editor.isActive({ textAlign: "center" }),
    },
    {
      icon: <AlignRight className="size-4" />,
      onClick: () => editor.chain().focus().setTextAlign("right").run(),
      preesed: editor.isActive({ textAlign: "right" }),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      preesed: editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="size-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      preesed: editor.isActive("orderedList"),
    },
    {
      icon: <Droplet className="size-4" />,
      onClick: () => {
        const color = prompt("Enter text color (hex or CSS name)", "#000000");
        if (color) editor.chain().focus().setMark("textStyle", { color }).run();
      },
      preesed: false,
    },
    {
      icon: <Highlighter className="size-4" />,
      onClick: () => editor.chain().focus().toggleHighlight().run(),
      preesed: editor.isActive("highlight"),
    },
    {
      icon: <ImgIcon className="size-4" />,
      onClick: () => {
        const url = prompt("Enter image URL");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
      preesed: false,
    },
    {
      icon: <Type className="size-4" />,
      onClick: () => {
        const size = prompt("Enter font size (e.g. 16px or 1.2em)", "16px");
        if (size) editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
      },
      preesed: false,
    },
  ];

  return (
    <div className="border w-full bg-slate-50 space-x-2 ">
      <div className="relative">
        <input
          ref={inputRef}
          list="font-sizes"
          value={inputSize}
          onChange={e => setInputSize(e.target.value)}
          onBlur={applySize}
          onKeyDown={e => e.key === "Enter" && applySize()}
          placeholder="Font size"
          className="w-20 px-2 py-1 border rounded text-sm"
        />
        <datalist id="font-sizes">
          {PRESET_SIZES.map(sz => <option key={sz} value={sz} />)}
        </datalist>
      </div>
      
      {Options.map((option, index) => (
        <Toggle
          key={index}
          pressed={option.preesed}
          onPressedChange={option.onClick}
          className="hover:bg-brand-olive/20 transition"
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}