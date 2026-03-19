"use client";

import { useEffect, useState } from "react";

interface Ensemble {
  id: string;
  ecc: string;
  label: string;
  shortlabel: string;
  lto: number;
}

interface General {
  dabmode: number;
  nbframes: number;
  syslog: boolean;
  tist: boolean;
  managementport: number;
}

interface RemoteControl {
  telnetEnabled: boolean;
  telnetPort: number;
  zmqEnabled: boolean;
  zmqEndpoint: string;
}

export default function EnsemblePage() {
  const [ensemble, setEnsemble] = useState<Ensemble>({
    id: "0x4fff", ecc: "0xe1", label: "", shortlabel: "", lto: 1,
  });
  const [general, setGeneral] = useState<General>({
    dabmode: 1, nbframes: 0, syslog: false, tist: true, managementport: 12720,
  });
  const [rc, setRc] = useState<RemoteControl>({
    telnetEnabled: true, telnetPort: 12721, zmqEnabled: true, zmqEndpoint: "tcp://lo:12722",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setEnsemble(data.ensemble);
        setGeneral(data.general);
        setRc(data.remotecontrol);
      });
  }, []);

  async function handleSave() {
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ensemble, general, remotecontrol: rc }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Ensemble Configuration</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          {saved ? "Opgeslagen!" : "Opslaan"}
        </button>
      </div>

      {/* Ensemble Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Ensemble</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ensemble ID (hex)</label>
            <input
              type="text"
              value={ensemble.id}
              onChange={(e) => setEnsemble({ ...ensemble, id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="0x4fff"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ECC (hex)</label>
            <input
              type="text"
              value={ensemble.ecc}
              onChange={(e) => setEnsemble({ ...ensemble, ecc: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="0xe1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              type="text"
              value={ensemble.label}
              onChange={(e) => setEnsemble({ ...ensemble, label: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              maxLength={16}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Label</label>
            <input
              type="text"
              value={ensemble.shortlabel}
              onChange={(e) => setEnsemble({ ...ensemble, shortlabel: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              maxLength={8}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Time Offset (hours)</label>
            <input
              type="number"
              value={ensemble.lto}
              onChange={(e) => setEnsemble({ ...ensemble, lto: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              min={-12}
              max={12}
            />
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DAB Mode</label>
            <select
              value={general.dabmode}
              onChange={(e) => setGeneral({ ...general, dabmode: Number(e.target.value) as 1|2|3|4 })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value={1}>Mode 1 (1.536 MHz, 864 CU)</option>
              <option value={2}>Mode 2 (384 kHz, 216 CU)</option>
              <option value={3}>Mode 3 (192 kHz, 108 CU)</option>
              <option value={4}>Mode 4 (768 kHz, 432 CU)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Management Port</label>
            <input
              type="number"
              value={general.managementport}
              onChange={(e) => setGeneral({ ...general, managementport: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={general.tist}
                onChange={(e) => setGeneral({ ...general, tist: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">TIST (Timestamps)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={general.syslog}
                onChange={(e) => setGeneral({ ...general, syslog: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Syslog</span>
            </label>
          </div>
        </div>
      </div>

      {/* Remote Control */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Remote Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={rc.telnetEnabled}
                onChange={(e) => setRc({ ...rc, telnetEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">Telnet Remote Control</span>
            </label>
            {rc.telnetEnabled && (
              <input
                type="number"
                value={rc.telnetPort}
                onChange={(e) => setRc({ ...rc, telnetPort: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="12721"
              />
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={rc.zmqEnabled}
                onChange={(e) => setRc({ ...rc, zmqEnabled: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm font-medium">ZMQ Remote Control</span>
            </label>
            {rc.zmqEnabled && (
              <input
                type="text"
                value={rc.zmqEndpoint}
                onChange={(e) => setRc({ ...rc, zmqEndpoint: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="tcp://lo:12722"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
