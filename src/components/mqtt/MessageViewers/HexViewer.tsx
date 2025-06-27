"use client";

import React from 'react';

interface HexViewerProps {
  data: string; // Original string payload
}

const HexViewer: React.FC<HexViewerProps> = ({ data }) => {
  const toHex = (str: string): string => {
    return Array.from(str)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(' ');
  };

  const hexString = toHex(data);

  return (
    <pre className="whitespace-pre-wrap break-words text-sm p-3 bg-gray-900 rounded-md overflow-auto h-full text-yellow-300">
      <code>{hexString}</code>
    </pre>
  );
};

export default HexViewer;