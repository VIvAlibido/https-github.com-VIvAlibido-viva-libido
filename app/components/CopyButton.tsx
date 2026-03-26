'use client';

import { useState } from 'react';

export default function CopyButton({ text, label = 'Kopiëren' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {copied ? 'Gekopieerd!' : label}
    </button>
  );
}
