// app/components/Textbox.tsx
'use client';

import { useState } from 'react';

export default function Textbox() {
  const [text, setText] = useState('');

  const handleCreateLink = () => {
    const link = `${window.location.origin}/document/${encodeURIComponent(text)}`;
    navigator.clipboard.writeText(link);
    alert('🔗 Link copied to clipboard!');
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-brand-cream shadow-lg rounded-2xl p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your documentation here..."
        className="
          w-full h-48 p-4
          bg-brand-ivory text-brand-black
          border-2 border-brand-olive rounded-lg
          resize-none
          focus:outline-none focus:ring-2 focus:ring-brand-orange
          transition
        "
      />
      <div className="flex justify-end mt-4">
        <button
          onClick={handleCreateLink}
          className="px-6 py-3 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition"
        >
          Generate Link
        </button>
      </div>
    </div>
  );
}
