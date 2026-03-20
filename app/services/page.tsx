"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  serviceId: string;
  label: string;
  shortlabel: string;
  pty: number;
  language: number;
  dlsText?: string;
  dlsAutoFromIcecast?: boolean;
  icecastUrl?: string;
  volumeNormalize?: boolean;
  volumeTarget?: number;
  volumeLimiter?: boolean;
}

interface Subchannel {
  id: string;
  type: string;
  inputType: string;
  inputUri: string;
  bitrate: number;
  protection: number;
  protectionProfile: string;
}

const PTY_LABELS: Record<number, string> = {
  0: "Geen",
  1: "Nieuws",
  3: "Informatie",
  4: "Sport",
  10: "Pop",
  11: "Rock",
  12: "Easy Listening",
  14: "Klassiek",
  15: "Andere Muziek",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [editSub, setEditSub] = useState<Subchannel | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices);
  }, []);

  function openNew() {
    setEditing({
      id: "",
      serviceId: "0x0000",
      label: "",
      shortlabel: "",
      pty: 10,
      language: 0,
      dlsText: "",
      dlsAutoFromIcecast: false,
      icecastUrl: "",
      volumeNormalize: true,
      volumeTarget: -23,
      volumeLimiter: true,
    });
    setEditSub({
      id: "",
      type: "audio",
      inputType: "zmq",
      inputUri: "tcp://localhost:9000",
      bitrate: 64,
      protection: 3,
      protectionProfile: "EEP_A",
    });
    setIsNew(true);
  }

  function openEdit(svc: Service) {
    setEditing({ ...svc });
    setEditSub(null);
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";

    if (isNew && !editing.id) {
      const slug = editing.label.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      editing.id = `srv-${slug}`;
      editing.serviceId = `0x${Math.floor(Math.random() * 65535).toString(16).padStart(4, "0")}`;
      editing.shortlabel = editing.label.substring(0, 8);
    }

    const res = await fetch("/api/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    if (res.ok && isNew && editSub) {
      editSub.id = `sub-${editing.id.replace("srv-", "")}`;
      await fetch("/api/subchannels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subchannel: editSub,
          component: {
            id: `comp-${editSub.id}`,
            serviceId: editing.id,
            subchannelId: editSub.id,
            label: editing.label,
            figType: "0x2",
          },
        }),
      });
    }

    const updated = await fetch("/api/services").then((r) => r.json());
    setServices(updated);
    setEditing(null);
    setEditSub(null);
  }

  async function handleDelete(id: string) {
    await fetch("/api/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setServices(services.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Zenders</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          + Nieuwe Zender
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Nog geen zenders. Klik op &quot;Nieuwe Zender&quot; om te beginnen.
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{svc.label}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{PTY_LABELS[svc.pty] || `Type ${svc.pty}`}</span>
                    {svc.volumeNormalize && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Volume normalisatie</span>
                    )}
                    {svc.dlsAutoFromIcecast && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">Auto DLS</span>
                    )}
                  </div>
                  {svc.dlsText && !svc.dlsAutoFromIcecast && (
                    <p className="text-sm text-gray-400 mt-1 italic">&quot;{svc.dlsText}&quot;</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(svc)} className="text-blue-500 hover:text-blue-700 text-sm">
                    Bewerken
                  </button>
                  <button onClick={() => handleDelete(svc.id)} className="text-red-500 hover:text-red-700 text-sm">
                    Verwijderen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg my-8">
            <h2 className="text-lg font-semibold mb-4">
              {isNew ? "Nieuwe Zender" : "Zender Bewerken"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zendernaam</label>
                <input
                  type="text"
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Bijv. Viva Libido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type programma</label>
                <select
                  value={editing.pty}
                  onChange={(e) => setEditing({ ...editing, pty: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {Object.entries(PTY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {isNew && editSub && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Audio Bron</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Input</label>
                      <select
                        value={editSub.inputType}
                        onChange={(e) => setEditSub({ ...editSub, inputType: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="zmq">ZeroMQ</option>
                        <option value="edi">EDI</option>
                        <option value="file">Bestand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Bitrate</label>
                      <select
                        value={editSub.bitrate}
                        onChange={(e) => setEditSub({ ...editSub, bitrate: Number(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      >
                        {[48, 56, 64, 80, 96, 128].map((b) => (
                          <option key={b} value={b}>{b} kbps{b === 64 ? " (aanbevolen)" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-sm text-gray-700 mb-1">Bron URI</label>
                    <input
                      type="text"
                      value={editSub.inputUri}
                      onChange={(e) => setEditSub({ ...editSub, inputUri: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                      placeholder="tcp://localhost:9000"
                    />
                  </div>
                </div>
              )}

              {/* DLS */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Lopende Tekst (DLS)</h3>
                <input
                  type="text"
                  value={editing.dlsText || ""}
                  onChange={(e) => setEditing({ ...editing, dlsText: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                  placeholder="Tekst op het display van de ontvanger"
                  disabled={editing.dlsAutoFromIcecast}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.dlsAutoFromIcecast || false}
                    onChange={(e) => setEditing({ ...editing, dlsAutoFromIcecast: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Automatisch van stream (artiest - titel)</span>
                </label>
                {editing.dlsAutoFromIcecast && (
                  <input
                    type="text"
                    value={editing.icecastUrl || ""}
                    onChange={(e) => setEditing({ ...editing, icecastUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono mt-2"
                    placeholder="http://localhost:8000/stream"
                  />
                )}
              </div>

              {/* Volume */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Volume</h3>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={editing.volumeNormalize ?? true}
                    onChange={(e) => setEditing({ ...editing, volumeNormalize: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Automatische normalisatie (EBU R128)</span>
                </label>
                {editing.volumeNormalize && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-500 mb-1">
                      Doelvolume: {editing.volumeTarget ?? -23} LUFS
                    </label>
                    <input
                      type="range"
                      min={-31}
                      max={-14}
                      value={editing.volumeTarget ?? -23}
                      onChange={(e) => setEditing({ ...editing, volumeTarget: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Zachter</span>
                      <span>-23 (standaard)</span>
                      <span>Harder</span>
                    </div>
                  </div>
                )}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing.volumeLimiter ?? true}
                    onChange={(e) => setEditing({ ...editing, volumeLimiter: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Piek-limiter (voorkomt vervorming)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setEditing(null); setEditSub(null); }}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
