"use client";

import { useEffect, useState, useRef } from "react";

interface Ensemble {
  id: string;
  ecc: string;
  label: string;
  shortlabel: string;
  lto: number;
}

export default function SettingsPage() {
  const [ensemble, setEnsemble] = useState<Ensemble>({
    id: "0x4fff", ecc: "0xe1", label: "", shortlabel: "", lto: 1,
  });
  const [saved, setSaved] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setEnsemble(data.ensemble));
    fetch("/api/logo")
      .then((r) => r.json())
      .then((data) => { if (data.logoUrl) setLogoUrl(data.logoUrl); })
      .catch(() => {});
  }, []);

  async function handleSave() {
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ensemble }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);
    const res = await fetch("/api/logo", { method: "POST", body: formData });
    const data = await res.json();
    if (data.logoUrl) setLogoUrl(data.logoUrl);
    setUploading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Instellingen</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {saved ? "Opgeslagen!" : "Opslaan"}
        </button>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Station Logo</h2>
        <div className="flex items-center gap-6">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors overflow-hidden"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Upload</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Klik om een logo te uploaden (PNG, JPG)
            </p>
            <p className="text-xs text-gray-400">
              {uploading ? "Uploaden..." : "Wordt getoond in de sidebar en op het DAB+ signaal"}
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Ensemble Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Ensemble / Zendernaam</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naam (max 16 tekens)</label>
            <input
              type="text"
              value={ensemble.label}
              onChange={(e) => setEnsemble({ ...ensemble, label: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              maxLength={16}
              placeholder="Viva Libido DAB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Korte naam (max 8 tekens)</label>
            <input
              type="text"
              value={ensemble.shortlabel}
              onChange={(e) => setEnsemble({ ...ensemble, shortlabel: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              maxLength={8}
              placeholder="VivaDAB"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ensemble ID</label>
            <input
              type="text"
              value={ensemble.id}
              onChange={(e) => setEnsemble({ ...ensemble, id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="0x4fff"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Land Code (ECC)</label>
            <input
              type="text"
              value={ensemble.ecc}
              onChange={(e) => setEnsemble({ ...ensemble, ecc: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
              placeholder="0xe1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
