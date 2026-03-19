"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "./components/StatusBadge";

interface MuxStatus {
  running: boolean;
  pid?: number;
  uptime?: number;
  timestamp?: string;
  frameCount?: number;
}

interface Statistics {
  ensembleLabel: string;
  cuUsed: number;
  cuTotal: number;
  subchannels: Array<{
    id: string;
    label: string;
    bitrate: number;
    bufferState: number;
    overruns: number;
    underruns: number;
    inputState: string;
  }>;
}

export default function Dashboard() {
  const [status, setStatus] = useState<MuxStatus | null>(null);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [statusRes, statsRes] = await Promise.all([
      fetch("/api/status"),
      fetch("/api/statistics"),
    ]);
    setStatus(await statusRes.json());
    setStats(await statsRes.json());
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function toggleMux() {
    setLoading(true);
    const action = status?.running ? "stop" : "start";
    const res = await fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setStatus(await res.json());
    setLoading(false);
  }

  function formatUptime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Status card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Multiplexer Status</div>
          <div className="flex items-center justify-between">
            <StatusBadge status={status?.running ? "running" : "stopped"} />
            <button
              onClick={toggleMux}
              disabled={loading}
              className={`px-4 py-1.5 rounded text-sm font-medium text-white transition-colors ${
                status?.running
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              } disabled:opacity-50`}
            >
              {loading ? "..." : status?.running ? "Stop" : "Start"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Uptime</div>
          <div className="text-lg font-semibold">
            {status?.running ? formatUptime(status.uptime || 0) : "--"}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">PID</div>
          <div className="text-lg font-semibold font-mono">
            {status?.pid || "--"}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Frames Generated</div>
          <div className="text-lg font-semibold font-mono">
            {status?.frameCount?.toLocaleString() || "0"}
          </div>
        </div>
      </div>

      {/* Capacity */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">
            Ensemble: {stats.ensembleLabel}
          </h2>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Capacity Units (CU)</span>
              <span>
                {stats.cuUsed} / {stats.cuTotal} CU ({Math.round((stats.cuUsed / stats.cuTotal) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  stats.cuUsed / stats.cuTotal > 0.9
                    ? "bg-red-500"
                    : stats.cuUsed / stats.cuTotal > 0.7
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (stats.cuUsed / stats.cuTotal) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subchannel status table */}
      {stats && stats.subchannels.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Subchannel Status</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Bitrate</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Buffer</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Overruns</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Underruns</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.subchannels.map((sc) => (
                <tr key={sc.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-sm">{sc.id}</td>
                  <td className="px-4 py-2 text-sm">{sc.bitrate} kbps</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${sc.bufferState}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{sc.bufferState}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">{sc.overruns}</td>
                  <td className="px-4 py-2 text-sm">{sc.underruns}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={sc.inputState as "ok" | "error" | "disconnected" | "buffering"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats && stats.subchannels.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p>Geen subchannels geconfigureerd. Ga naar Subchannels om er een toe te voegen.</p>
        </div>
      )}
    </div>
  );
}
