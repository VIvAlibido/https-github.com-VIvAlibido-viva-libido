// In-memory config store (in production, use a database or file persistence)
import { MuxConfig, DEFAULT_CONFIG, MuxStatus, MuxStatistics, SubchannelStats } from "./types";
import { generateMuxFile } from "./mux-file-generator";
import * as fs from "fs";
import * as path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "mux-config.json");
const MUX_FILE_PATH = path.join(process.cwd(), "data", "dabmux.mux");

function ensureDataDir() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadConfig(): MuxConfig {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(data) as MuxConfig;
    }
  } catch {
    // Fall through to default
  }
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(config: MuxConfig): void {
  ensureDataDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  // Also generate the .mux file for ODR-DabMux
  const muxContent = generateMuxFile(config);
  fs.writeFileSync(MUX_FILE_PATH, muxContent);
}

// Simulated mux process status
let muxStatus: MuxStatus = {
  running: false,
  timestamp: new Date().toISOString(),
  frameCount: 0,
};

let muxStartTime: Date | null = null;

export function getMuxStatus(): MuxStatus {
  if (muxStatus.running && muxStartTime) {
    muxStatus.uptime = Math.floor(
      (Date.now() - muxStartTime.getTime()) / 1000
    );
    muxStatus.frameCount = Math.floor(muxStatus.uptime * (1000 / 24)); // ~41.67 frames/sec
  }
  muxStatus.timestamp = new Date().toISOString();
  return { ...muxStatus };
}

export function startMux(): MuxStatus {
  muxStatus.running = true;
  muxStatus.pid = 10000 + Math.floor(Math.random() * 50000);
  muxStartTime = new Date();
  muxStatus.frameCount = 0;
  return getMuxStatus();
}

export function stopMux(): MuxStatus {
  muxStatus.running = false;
  muxStatus.pid = undefined;
  muxStartTime = null;
  muxStatus.uptime = 0;
  muxStatus.frameCount = 0;
  return getMuxStatus();
}

export function getStatistics(): MuxStatistics {
  const config = loadConfig();
  const subchannels: SubchannelStats[] = config.subchannels.map((sc) => {
    const isRunning = muxStatus.running;
    return {
      id: sc.id,
      label: sc.id,
      bitrate: sc.bitrate,
      bufferState: isRunning ? 70 + Math.floor(Math.random() * 30) : 0,
      overruns: isRunning ? Math.floor(Math.random() * 3) : 0,
      underruns: isRunning ? Math.floor(Math.random() * 2) : 0,
      inputState: isRunning ? "ok" : "disconnected",
    };
  });

  // Calculate CU usage (capacity units)
  // Mode 1: 864 CU total
  const cuTotal = 864;
  const cuUsed = config.subchannels.reduce((sum, sc) => {
    // Rough approximation: bitrate / 8 = CU
    return sum + Math.ceil(sc.bitrate / 8);
  }, 0);

  return {
    timestamp: new Date().toISOString(),
    ensembleLabel: config.ensemble.label,
    subchannels,
    cuUsed,
    cuTotal,
  };
}
