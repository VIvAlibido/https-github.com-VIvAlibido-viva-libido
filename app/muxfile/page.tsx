"use client";

import { useEffect, useState } from "react";

export default function MuxFilePage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/muxfile")
      .then((r) => r.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      });
  }, []);

  function handleRefresh() {
    setLoading(true);
    fetch("/api/muxfile")
      .then((r) => r.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      });
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dabmux.mux";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(content);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Generated Config File</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Vernieuwen
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Kopieer
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
          >
            Download .mux
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-3 border-b bg-gray-50 rounded-t-lg">
          <span className="text-sm font-mono text-gray-600">dabmux.mux</span>
          <span className="text-xs text-gray-400 ml-2">
            (ODR-DabMux configuratie formaat)
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : (
          <pre className="p-4 text-sm font-mono text-gray-800 overflow-x-auto whitespace-pre leading-relaxed">
            {content}
          </pre>
        )}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-1">Gebruik</h3>
        <p className="text-sm text-blue-700">
          Dit bestand is compatibel met ODR-DabMux. Start de multiplexer met:
        </p>
        <code className="block mt-2 bg-blue-100 rounded px-3 py-2 text-sm font-mono text-blue-900">
          odr-dabmux dabmux.mux
        </code>
      </div>
    </div>
  );
}
