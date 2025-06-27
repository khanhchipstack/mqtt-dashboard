"use client";

import React from 'react';

interface PlainTextViewerProps {
  data: string; // Original string payload
}

const PlainTextViewer: React.FC<PlainTextViewerProps> = ({ data }) => {
  return (
    <pre className="whitespace-pre-wrap break-words text-sm p-3 bg-gray-900 rounded-md overflow-auto h-full text-white">
      <code>{data}</code>
    </pre>
  );
};

export default PlainTextViewer;