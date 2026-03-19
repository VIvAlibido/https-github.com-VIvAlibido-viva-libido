"use client";

import { useEffect, useState } from "react";

interface Subchannel {
  id: string;
  type: string;
  inputType: string;
  inputUri: string;
  bitrate: number;
  protection: number;
  protectionProfile: string;
  zmqBufferSize?: number;
  zmqPrebuffering?: number;
}

interface Service {
  id: string;
  label: string;
}

export default function SubchannelsPage() {
  const [subchannels, setSubchannels] = useState<Subchannel[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Subchannel | null>(null);
  const [linkedService, setLinkedService] = useState("");
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/subchannels").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
    ]).then(([sc, svc]) => {
      setSubchannels(sc);
      setServices(svc);
    });
  }, []);

  function openNew() {
    setEditing({
      id: "",
      type: "audio",
      inputType: "zmq",
      inputUri: "tcp://localhost:9000",
      bitrate: 96,
      protection: 3,
      protectionProfile: "EEP_A",
    });
    setLinkedService("");
    setIsNew(true);
  }

  function openEdit(sc: Subchannel) {
    setEditing({ ...sc });
    setIsNew(false);
  }

  async function handleSave() {
    if (!editing) return;
    const method = isNew ? "POST" : "PUT";

    if (isNew) {
      const body: Record<string, unknown> = { subchannel: editing };
      if (linkedService) {
        body.component = {
          id: `comp-${editing.id}`,
          serviceId: linkedService,
          subchannelId: editing.id,
          label: editing.id,
          figType: "0x2",
        };
      }
      await fetch("/api/subchannels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/subchannels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
    }

    const updated = await fetch("/api/subchannels").then((r) => r.json());
    setSubchannels(updated);
    setEditing(null);
  }

  async function handleDelete(id: string) {
    await fetch("/api/subchannels", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSubchannels(subchannels.filter((s) => s.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subchannels</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          + Nieuw Subchannel
        </button>
      </div>

      {subchannels.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Geen subchannels geconfigureerd. Klik op &quot;Nieuw Subchannel&quot; om te beginnen.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Input</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">URI</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Bitrate</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Protection</th>
                <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">Acties</th>
              </tr>
            </thead>
            <tbody>
              {subchannels.map((sc) => (
                <tr key={sc.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{sc.id}</td>
                  <td className="px-4 py-3 text-sm">{sc.type}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {sc.inputType.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{sc.inputUri}</td>
                  <td className="px-4 py-3 text-sm">{sc.bitrate} kbps</td>
                  <td className="px-4 py-3 text-sm">{sc.protectionProfile} L{sc.protection}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(sc)} className="text-blue-500 hover:text-blue-700 text-sm mr-3">
                      Bewerken
                    </button>
                    <button onClick={() => handleDelete(sc.id)} className="text-red-500 hover:text-red-700 text-sm">
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {isNew ? "Nieuw Subchannel" : "Subchannel Bewerken"}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <input
                    type="text"
                    value={editing.id}
                    onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    disabled={!isNew}
                    placeholder="sub-radio1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="audio">Audio (DAB+)</option>
                    <option value="data">Data</option>
                    <option value="packet">Packet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
                  <select
                    value={editing.inputType}
                    onChange={(e) => setEditing({ ...editing, inputType: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="zmq">ZeroMQ</option>
                    <option value="edi">EDI (TCP/UDP)</option>
                    <option value="file">File</option>
                    <option value="sti">STI-D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitrate (kbps)</label>
                  <select
                    value={editing.bitrate}
                    onChange={(e) => setEditing({ ...editing, bitrate: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {[24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128, 160, 192, 224, 256].map((b) => (
                      <option key={b} value={b}>{b} kbps</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Input URI</label>
                <input
                  type="text"
                  value={editing.inputUri}
                  onChange={(e) => setEditing({ ...editing, inputUri: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  placeholder="tcp://localhost:9000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protection Profile</label>
                  <select
                    value={editing.protectionProfile}
                    onChange={(e) => setEditing({ ...editing, protectionProfile: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="EEP_A">EEP-A</option>
                    <option value="EEP_B">EEP-B</option>
                    <option value="UEP">UEP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protection Level</label>
                  <select
                    value={editing.protection}
                    onChange={(e) => setEditing({ ...editing, protection: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {[1, 2, 3, 4].map((l) => (
                      <option key={l} value={l}>Level {l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editing.inputType === "zmq" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZMQ Buffer (frames)</label>
                    <input
                      type="number"
                      value={editing.zmqBufferSize || 40}
                      onChange={(e) => setEditing({ ...editing, zmqBufferSize: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZMQ Prebuffering (frames)</label>
                    <input
                      type="number"
                      value={editing.zmqPrebuffering || 20}
                      onChange={(e) => setEditing({ ...editing, zmqPrebuffering: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}

              {isNew && services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Koppel aan Service</label>
                  <select
                    value={linkedService}
                    onChange={(e) => setLinkedService(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Geen --</option>
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.id}>{svc.label} ({svc.id})</option>
                    ))}
                  </select>
                </div>
              )}
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
