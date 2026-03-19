"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "../components/StatusBadge";

interface SubchannelStats {
  id: string;
  label: string;
  bitrate: number;
  bufferState: number;
  overruns: number;
  underruns: number;
  inputState: string;
}

interface Statistics {
  timestamp: string;
  ensembleLabel: string;
  cuUsed: number;
  cuTotal: number;
  subchannels: SubchannelStats[];
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [history, setHistory] = useState<Array<{ time: string; cuUsed: number }>>([]);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/statistics");
    const data = await res.json();
    setStats(data);
    setHistory((prev) => {
      const next = [...prev, { time: new Date().toLocaleTimeString(), cuUsed: data.cuUsed }];
      return next.slice(-20); // Keep last 20 data points
    });
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (!stats) return <div className="text-gray-500">Laden...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Ensemble</div>
          <div className="text-lg font-semibold">{stats.ensembleLabel}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">CU Gebruik</div>
          <div className="text-lg font-semibold">
            {stats.cuUsed} / {stats.cuTotal}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({Math.round((stats.cuUsed / stats.cuTotal) * 100)}%)
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Actieve Subchannels</div>
          <div className="text-lg font-semibold">{stats.subchannels.length}</div>
        </div>
      </div>

      {/* CU History (text-based chart) */}
      {history.length > 1 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">CU Gebruik Over Tijd</h2>
          <div className="flex items-end gap-1 h-32">
            {history.map((point, i) => {
              const pct = stats.cuTotal > 0 ? (point.cuUsed / stats.cuTotal) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-emerald-500 rounded-t min-h-[2px]"
                    style={{ height: `${Math.max(2, pct)}%` }}
                    title={`${point.cuUsed} CU at ${point.time}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{history[0]?.time}</span>
            <span>{history[history.length - 1]?.time}</span>
          </div>
        </div>
      )}

      {/* Subchannel details */}
      {stats.subchannels.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold">Subchannel Details</h2>
          </div>
          <div className="divide-y">
            {stats.subchannels.map((sc) => (
              <div key={sc.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium">{sc.id}</span>
                    <span className="text-sm text-gray-500">{sc.bitrate} kbps</span>
                    <StatusBadge status={sc.inputState as "ok" | "error" | "disconnected" | "buffering"} />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-orange-600">Overruns: {sc.overruns}</span>
                    <span className="text-red-600">Underruns: {sc.underruns}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">Buffer:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        sc.bufferState > 80 ? "bg-emerald-500" : sc.bufferState > 40 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${sc.bufferState}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">{sc.bufferState}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Geen subchannels geconfigureerd om statistieken te tonen.
        </div>
      )}
    </div>
  );
}
