'use client';

import { useState } from 'react';

interface GenerateLinkProps {
    content: string;
}

export default function GenerateLink({ content }: GenerateLinkProps) {
    const [link, setLink] = useState<string | null>(null);

    const handleGenerate = () => {
        // TODO: replace with your real POST→API logic to get a docKey
        const key = btoa(content).slice(0, 8);
        const url = `${window.location.origin}/${key}`;
        setLink(url);
        navigator.clipboard.writeText(url);
        alert('🔗 Link copied to clipboard!');
    };

    return (
        <div className="mt-6 flex flex-col items-end space-y-2">
            <button
                onClick={handleGenerate}
                className="
                    cursor-pointer
                    inline-flex items-center gap-2
                    px-4 py-2 bg-brand-orange text-brand-ivory rounded-lg
                    shadow-lg transform transition
                    hover:scale-105 hover:bg-brand-orange/80
                    active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-brand-orange
                "
            >
                Generate Link
            </button>
            {link && (
                <a
                    href={link}
                    className="
                        cursor-pointer
                        text-sm text-brand-olive underline
                        hover:text-brand-olive/80 transition
                    "
                >
                    {link}
                </a>
            )}
        </div>
    );
}