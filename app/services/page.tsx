"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  serviceId: string;
  label: string;
  shortlabel: string;
  pty: number;
  language: number;
}

const PTY_LABELS: Record<number, string> = {
  0: "Geen / Ongedefinieerd",
  1: "Nieuws",
  2: "Actueel",
  3: "Informatie",
  4: "Sport",
  5: "Educatie",
  6: "Drama",
  7: "Cultuur",
  8: "Wetenschap",
  9: "Praatprogramma",
  10: "Pop",
  11: "Rock",
  12: "Easy Listening",
  13: "Lichte Klassiek",
  14: "Serieuze Klassiek",
  15: "Andere Muziek",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
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
      pty: 0,
      language: 0,
    });
    setIsNew(true);
  }

  function openEdit(svc: Service) {
    setEditing({ ...svc });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch("/api/services", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const updated = await fetch("/api/services").then((r) => r.json());
      setServices(updated);
      setEditing(null);
    }
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
        <h1 className="text-2xl font-bold">Services</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          + Nieuwe Service
        </button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Geen services geconfigureerd. Klik op &quot;Nieuwe Service&quot; om te beginnen.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Service ID</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Label</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Type</th>
                <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{svc.id}</td>
                  <td className="px-4 py-3 font-mono text-sm">{svc.serviceId}</td>
                  <td className="px-4 py-3 text-sm font-medium">{svc.label}</td>
                  <td className="px-4 py-3 text-sm">{PTY_LABELS[svc.pty] || `PTY ${svc.pty}`}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(svc)}
                      className="text-blue-500 hover:text-blue-700 text-sm mr-3"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDelete(svc.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isNew ? "Nieuwe Service" : "Service Bewerken"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID (uniek)</label>
                <input
                  type="text"
                  value={editing.id}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  disabled={!isNew}
                  placeholder="srv-radio1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service ID (hex)</label>
                <input
                  type="text"
                  value={editing.serviceId}
                  onChange={(e) => setEditing({ ...editing, serviceId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="0x4daa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  maxLength={16}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Label</label>
                <input
                  type="text"
                  value={editing.shortlabel}
                  onChange={(e) => setEditing({ ...editing, shortlabel: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Programme Type</label>
                <select
                  value={editing.pty}
                  onChange={(e) => setEditing({ ...editing, pty: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  {Object.entries(PTY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
                <input
                  type="number"
                  value={editing.language}
                  onChange={(e) => setEditing({ ...editing, language: Number(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  min={0}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditing(null)}
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
