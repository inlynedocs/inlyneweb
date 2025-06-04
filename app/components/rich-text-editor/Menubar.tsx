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
import { Toggle } from "../ui/Toggle";
import { Editor } from "@tiptap/react";

const PRESET_SIZES = [
    "8px", "10px", "12px", "14px", "16px", "18px", "24px", "32px", "48px"
];

export default function MenuBar({ editor }: { editor: Editor | null }) {
    const [inputSize, setInputSize] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [colorOpen, setColorOpen] = useState<boolean>(false);
    const [colorValue, setColorValue] = useState<string>("#000000");
    const colorRef = useRef<HTMLInputElement>(null);

    const [imageOpen, setImageOpen] = useState<boolean>(false);
    const [imageValue, setImageValue] = useState<string>("");
    const imageRef = useRef<HTMLInputElement>(null);

    if (!editor) {
        return null;
    }

    // Keep the input in sync when cursor moves
    const syncSize = () => {
        const cls = editor.getAttributes("textStyle").class as string | undefined;
        setInputSize(cls?.replace(/^fs-/, "") ?? "");
    };

    // Apply font size
    const applySize = () => {
        let size = inputSize.trim();

        if (!size) {
            return;
        }

        if (/^\d+(\.\d+)?$/.test(size)) {
            size = `${size}px`;
        }

        editor
            .chain()
            .focus()
            .setMark("textStyle", { class: `fs-${size}` })
            .run();

        syncSize();
    };

    // Apply color
    const applyColor = () => {
        editor
            .chain()
            .focus()
            .setMark("textStyle", { color: colorValue })
            .run();

        setColorOpen(false);
    };

    // Apply image
    const applyImage = () => {
        if (imageValue.trim()) {
            editor.chain().focus().setImage({ src: imageValue.trim() }).run();
        }

        setImageOpen(false);
    };

    // Attach and clean up listeners once
    useEffect(() => {
        editor.on("selectionUpdate", syncSize);
        syncSize();

        return () => {
            editor.off("selectionUpdate", syncSize);
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
            icon: <Highlighter className="size-4" />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            preesed: editor.isActive("highlight"),
        },
    ];

    return (
        <div className="flex w-full items-center justify-between bg-[#f9f9f9] space-x-2 px-20 py-1 shadow-sm ">
            {/* Font-Size Dropdown */}
            <div className="relative">
                <input
                    ref={inputRef}
                    value={inputSize}
                    onChange={e => setInputSize(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                    onKeyDown={e => e.key === "Enter" && applySize()}
                    placeholder="Font size"
                    className="w-20 px-3 h-full border border-gray-100 rounded text-sm"
                />
                {dropdownOpen && (
                    <ul className="absolute top-full mt-1 w-20 max-h-40 overflow-auto bg-white border border-gray-200 rounded shadow-lg z-50">
                        {PRESET_SIZES.map(sz => (
                            <li
                                key={sz}
                                onMouseDown={e => {
                                    e.preventDefault();
                                    setInputSize(sz);
                                    applySize();
                                }}
                                className="px-3 py-1 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                {sz}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Formatting Toggles */}
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

            {/* Color Picker */}
            <div className="relative">
                <Toggle
                    pressed={colorOpen}
                    onPressedChange={() => setColorOpen(o => !o)}
                    className="hover:bg-gray-200 transition"
                >
                    <Droplet className="size-4" />
                </Toggle>
                {colorOpen && (
                    <input
                        ref={colorRef}
                        type="color"
                        value={colorValue}
                        onChange={e => setColorValue(e.target.value)}
                        onBlur={applyColor}
                        className="absolute top-full mt-1 w-8 h-8 p-0 border-none"
                    />
                )}
            </div>

            {/* Image URL */}
            <div className="relative">
                <Toggle
                    pressed={imageOpen}
                    onPressedChange={() => setImageOpen(o => !o)}
                    className="hover:bg-gray-200 transition"
                >
                    <ImgIcon className="size-4" />
                </Toggle>
                {imageOpen && (
                    <input
                        ref={imageRef}
                        type="text"
                        value={imageValue}
                        onChange={e => setImageValue(e.target.value)}
                        onBlur={applyImage}
                        onKeyDown={e => e.key === "Enter" && applyImage()}
                        placeholder="Image URL"
                        className="absolute top-full mt-1 w-40 px-2 py-1 border rounded bg-white text-sm"
                    />
                )}
            </div>
        </div>
    );
}
