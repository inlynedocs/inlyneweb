'use client'
import React, { useState, useRef, useEffect } from "react";
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
    const cur = editor.getAttributes("textStyle").class as string | undefined;
    // class will be like "fs-16px"
    setInputSize(cur?.replace(/^fs-/, "") ?? "");
  };

  // Called on blur or Enter: apply the value (auto-append px if only digits)
  const applySize = () => {
    let size = inputSize.trim();
    if (!size) return;

    // normalize bare numbers → "24" becomes "24px"
    if (/^\d+(\.\d+)?$/.test(size)) {
      size = `${size}px`;
    }

    // If there's already a textStyle mark at the cursor, update its class,
    // otherwise set a new mark (which also becomes the "stored mark" for new typing).
    if (editor.isActive('textStyle')) {
      editor
        .chain()
        .focus()
        .updateAttributes('textStyle', { class: `fs-${size}` })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setMark('textStyle', { class: `fs-${size}` })
        .run();
    }

    // keep our input in sync
    syncSize();
  };

  // Attach and clean up listeners once
  useEffect(() => {
    editor.on("selectionUpdate", syncSize);
    editor.on("transaction", syncSize);
    syncSize();
    return () => {
      editor.off("selectionUpdate", syncSize);
      editor.off("transaction", syncSize);
    };
  }, [editor]);

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
  ];

  return (
    <div className="flex w-full items-center justify-between bg-[#f9f9f9] space-x-2 px-20 py-1 shadow-sm ">
      <div className="">
        <input
          ref={inputRef}
          list="font-sizes"
          value={inputSize}
          onChange={e => setInputSize(e.target.value)}
          onBlur={applySize}
          onKeyDown={e => e.key === "Enter" && applySize()}
          placeholder="Font size"
          className="w-20 px-3 h-full border border-gray-100 rounded text-sm"
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
          className="hover:bg-gray-200 transition"
        >
          {option.icon}
        </Toggle>
      ))}
    </div>
  );
}
