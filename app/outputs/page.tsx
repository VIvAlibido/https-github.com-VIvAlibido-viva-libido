"use client";

import { useEffect, useState } from "react";

interface Output {
  id: string;
  type: string;
  enabled: boolean;
  destination?: string;
  port?: number;
  sourcePort?: number;
  fec?: number;
  interleave?: number;
}

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [editing, setEditing] = useState<Output | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch("/api/outputs").then((r) => r.json()).then(setOutputs);
  }, []);

  function openNew() {
    setEditing({
      id: "",
      type: "edi-tcp",
      enabled: true,
      port: 13000,
    });
    setIsNew(true);
  }

  function openEdit(out: Output) {
    setEditing({ ...out });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch("/api/outputs", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      const updated = await fetch("/api/outputs").then((r) => r.json());
      setOutputs(updated);
      setEditing(null);
    }
  }

  async function handleDelete(id: string) {
    await fetch("/api/outputs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setOutputs(outputs.filter((o) => o.id !== id));
  }

  async function toggleEnabled(out: Output) {
    const updated = { ...out, enabled: !out.enabled };
    await fetch("/api/outputs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setOutputs(outputs.map((o) => (o.id === out.id ? updated : o)));
  }

  const typeLabels: Record<string, string> = {
    "edi-tcp": "EDI over TCP",
    "edi-udp": "EDI over UDP",
    zmq: "ZeroMQ",
    "eti-tcp": "ETI over TCP",
    simul: "Simul (throttle)",
    throttle: "Throttle",
    file: "File",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Outputs</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          + Nieuwe Output
        </button>
      </div>

      {outputs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Geen outputs geconfigureerd.
        </div>
      ) : (
        <div className="grid gap-4">
          {outputs.map((out) => (
            <div key={out.id} className={`bg-white rounded-lg shadow p-4 border-l-4 ${out.enabled ? "border-emerald-500" : "border-gray-300"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold font-mono">{out.id}</h3>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {typeLabels[out.type] || out.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${out.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {out.enabled ? "Actief" : "Inactief"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {out.destination && <span>Bestemming: {out.destination}</span>}
                    {out.port && <span className="ml-3">Poort: {out.port}</span>}
                    {out.fec !== undefined && <span className="ml-3">FEC: {out.fec}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleEnabled(out)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      out.enabled ? "bg-gray-200 hover:bg-gray-300" : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                    }`}
                  >
                    {out.enabled ? "Deactiveer" : "Activeer"}
                  </button>
                  <button onClick={() => openEdit(out)} className="text-blue-500 hover:text-blue-700 text-sm">
                    Bewerken
                  </button>
                  <button onClick={() => handleDelete(out.id)} className="text-red-500 hover:text-red-700 text-sm">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isNew ? "Nieuwe Output" : "Output Bewerken"}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <input
                  type="text"
                  value={editing.id}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  disabled={!isNew}
                  placeholder="edi-out-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="edi-tcp">EDI over TCP</option>
                  <option value="edi-udp">EDI over UDP</option>
                  <option value="zmq">ZeroMQ</option>
                  <option value="eti-tcp">ETI over TCP</option>
                  <option value="throttle">Throttle (simul://)</option>
                  <option value="file">File</option>
                </select>
              </div>

              {(editing.type === "edi-tcp" || editing.type === "edi-udp" || editing.type === "zmq" || editing.type === "eti-tcp") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poort</label>
                  <input
                    type="number"
                    value={editing.port || ""}
                    onChange={(e) => setEditing({ ...editing, port: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}

              {(editing.type === "edi-udp" || editing.type === "file") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editing.type === "file" ? "Bestandspad" : "Bestemming (IP)"}
                  </label>
                  <input
                    type="text"
                    value={editing.destination || ""}
                    onChange={(e) => setEditing({ ...editing, destination: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder={editing.type === "file" ? "/tmp/dabmux.eti" : "127.0.0.1"}
                  />
                </div>
              )}

              {(editing.type === "edi-tcp" || editing.type === "edi-udp") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FEC (Reed-Solomon)</label>
                  <input
                    type="number"
                    value={editing.fec ?? ""}
                    onChange={(e) => setEditing({ ...editing, fec: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0"
                    min={0}
                  />
                </div>
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Actief</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
                Annuleren
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
