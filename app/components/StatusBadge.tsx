"use client";

interface StatusBadgeProps {
  status: "ok" | "buffering" | "error" | "disconnected" | "running" | "stopped";
}

const statusConfig = {
  ok: { color: "bg-green-500", label: "OK" },
  running: { color: "bg-green-500", label: "Running" },
  buffering: { color: "bg-yellow-500", label: "Buffering" },
  error: { color: "bg-red-500", label: "Error" },
  disconnected: { color: "bg-gray-500", label: "Disconnected" },
  stopped: { color: "bg-gray-500", label: "Stopped" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${config.color} ${status === "ok" || status === "running" ? "animate-pulse" : ""}`} />
      <span className="text-sm">{config.label}</span>
    </span>
  );
}
