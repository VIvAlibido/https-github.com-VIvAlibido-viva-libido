"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "./components/StatusBadge";

interface MuxStatus {
  running: boolean;
  pid?: number;
  uptime?: number;
  frameCount?: number;
}

interface Statistics {
  ensembleLabel: string;
  cuUsed: number;
  cuTotal: number;
  subchannels: Array<{
    id: string;
    bitrate: number;
    bufferState: number;
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
    return h > 0 ? `${h}u ${m}m` : `${m}m`;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Big start/stop button + status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <StatusBadge status={status?.running ? "running" : "stopped"} />
              {status?.running && (
                <span className="text-sm text-gray-500">
                  Uptime: {formatUptime(status.uptime || 0)}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {stats?.ensembleLabel || "Viva Libido DAB"}
              {stats && ` - ${stats.cuUsed}/${stats.cuTotal} CU`}
            </p>
          </div>
          <button
            onClick={toggleMux}
            disabled={loading}
            className={`px-8 py-3 rounded-lg text-lg font-semibold text-white transition-colors ${
              status?.running
                ? "bg-red-500 hover:bg-red-600"
                : "bg-emerald-500 hover:bg-emerald-600"
            } disabled:opacity-50`}
          >
            {loading ? "..." : status?.running ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {/* Subchannel overview */}
      {stats && stats.subchannels.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold">Actieve Zenders</h2>
          </div>
          <div className="divide-y">
            {stats.subchannels.map((sc) => (
              <div key={sc.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <StatusBadge status={sc.inputState as "ok" | "error" | "disconnected" | "buffering"} />
                  <span className="font-medium">{sc.id}</span>
                  <span className="text-sm text-gray-500">{sc.bitrate} kbps</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${sc.bufferState}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8">{sc.bufferState}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats && stats.subchannels.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p>Nog geen zenders. Ga naar &quot;Zenders&quot; om er een toe te voegen.</p>
        </div>
      )}
    </div>
  );
}
