// src/components/clients/mqtt/MessageViewers/Base64Viewer.tsx
"use client";

import React from 'react';

interface Base64ViewerProps {
  data: string; // Original string payload
}

const Base64Viewer: React.FC<Base64ViewerProps> = ({ data }) => {
  const toBase64 = (str: string): string => {
    try {
      return Buffer.from(str).toString('base64');
    } catch (e) {
      return `Error encoding to Base64: ${e}`;
    }
  };

  const base64String = toBase64(data);

  return (
    <pre className="whitespace-pre-wrap break-words text-sm p-3 bg-gray-900 rounded-md overflow-auto h-full text-purple-300">
      <code>{base64String}</code>
    </pre>
  );
};

export default Base64Viewer;