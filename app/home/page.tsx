'use client';

import React from 'react';
import Sidebar from '../components/Sidebar';

const documents = [
  'Proposal.pdf',
  'Report.docx',
  'Plan.xlsx',
  'Summary.txt',
  'Budget.pdf',
  'Presentation.pptx',
];

export default function InlyneHomepage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar documents={documents} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Document Overview</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc}
              className="bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden"
            >
              <div className="h-40 bg-gray-50 flex items-center justify-center">
                {/* Preview placeholder or image thumbnail */}
                <img
                  src={`/previews/${doc}.png`}
                  alt={`${doc} preview`}
                  className="max-h-full"
                  onError={(e) => {
                    // Fallback icon if no preview image
                    (e.currentTarget as HTMLImageElement).src =
                      '/icons/document_placeholder.svg';
                  }}
                />
              </div>
              <div className="p-4 flex-1 flex items-center justify-center">
                <h3 className="text-lg font-medium text-center truncate">
                  {doc}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
