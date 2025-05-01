// app/components/Textbox.tsx
'use client';

import { useState } from 'react';
import RichTextEditor from './rich-text-editor/RichTextEditor';

export default function Textbox() {
  const [html, setHtml] = useState('<p></p>');
  const [link, setLink] = useState<string|null>(null);

  function generateLink() {
    // TODO: actually POST html → API to get real docKey
    const fakeKey = btoa(html).slice(0, 8);
    setLink(`${window.location.origin}/${fakeKey}`);
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-brand-cream rounded-2xl shadow-lg">
      <RichTextEditor content={html} onUpdate={setHtml} />

      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={generateLink}
          className="cursor-pointer px-4 py-2 bg-brand-orange text-brand-ivory rounded-lg hover:bg-brand-orange/90 transition"
        >
          Generate Link
        </button>
        {link && (
          <a href={link} className="text-brand-olive underline hover:text-brand-olive/80">
            {link}
          </a>
        )}
      </div>
    </div>
  );
}
