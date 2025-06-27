"use client";

import React from 'react';

interface JsonViewerProps {
  data: any; // Can be string (if not parsed) or object
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  let jsonString = '';
  try {
    if (typeof data === 'string') {
      jsonString = JSON.stringify(JSON.parse(data), null, 2);
    } else {
      jsonString = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    jsonString = `Invalid JSON: ${data}`;
  }

  return (
    <pre className="whitespace-pre-wrap break-words text-sm p-3 bg-gray-900 rounded-md overflow-auto h-full text-green-300">
      <code>{jsonString}</code>
    </pre>
  );
};

export default JsonViewer;