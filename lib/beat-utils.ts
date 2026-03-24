/**
 * Beat Utilities — Frontend helpers for beat/bar grid calculations.
 *
 * Used by the radio dashboard UI to display crossfade timing info
 * and preview beat-aligned transitions.
 */

/**
 * Convert a number of bars to milliseconds at a given BPM.
 * 1 bar = 4 beats (assuming 4/4 time signature).
 */
export function barsToMs(bars: number, bpm: number): number {
  if (!bpm || bpm < 60) return bars * 2000; // fallback: 2s per bar
  const msPerBeat = 60000 / bpm;
  const msPerBar = msPerBeat * 4;
  return bars * msPerBar;
}

/**
 * Snap a duration (in ms) to the nearest beat or bar boundary.
 *
 * For durations > 2000ms: snap to bar grid (4 beats).
 * For durations <= 2000ms: snap to beat grid.
 */
export function snapToBeat(durationMs: number, bpm: number): number {
  if (!bpm || bpm < 60 || bpm > 200) return durationMs;

  const msPerBeat = 60000 / bpm;
  const msPerBar = msPerBeat * 4;

  if (durationMs > 2000) {
    const bars = Math.max(1, Math.round(durationMs / msPerBar));
    return bars * msPerBar;
  } else {
    const beats = Math.max(1, Math.round(durationMs / msPerBeat));
    return beats * msPerBeat;
  }
}

/**
 * Camelot distance calculation (mirrors Python crossfade_engine).
 */
export function camelotDistance(
  keyA: string | null,
  keyB: string | null
): number {
  if (!keyA || !keyB) return 6;

  const pattern = /^(\d{1,2})([AB])$/i;
  const matchA = keyA.trim().match(pattern);
  const matchB = keyB.trim().match(pattern);

  if (!matchA || !matchB) return 6;

  const numA = parseInt(matchA[1], 10);
  const letterA = matchA[2].toUpperCase();
  const numB = parseInt(matchB[1], 10);
  const letterB = matchB[2].toUpperCase();

  if (numA < 1 || numA > 12 || numB < 1 || numB > 12) return 6;

  const circleDist = Math.min(
    Math.abs(numA - numB),
    12 - Math.abs(numA - numB)
  );

  if (letterA === letterB) return Math.min(circleDist, 6);
  if (numA === numB) return 1; // relative major/minor
  return Math.min(circleDist + 1, 6);
}

/**
 * Calculate DJ-style crossfade duration in milliseconds.
 *
 * Uses BPM compatibility and Camelot key distance to determine
 * the optimal overlap for a music→music transition.
 *
 * Returns an object with overlap, fade-out, and fade-in durations.
 */
export function calculateDjCrossfadeMs(
  bpmA: number | null,
  bpmB: number | null,
  keyA: string | null,
  keyB: string | null
): {
  overlapMs: number;
  fadeOutMs: number;
  fadeInMs: number;
  keyDistance: number;
  bpmDiffPct: number;
} {
  const safeBpmA =
    bpmA && bpmA >= 60 && bpmA <= 200 ? bpmA : null;
  const safeBpmB =
    bpmB && bpmB >= 60 && bpmB <= 200 ? bpmB : null;

  // BPM compatibility
  const bpmDiffPct =
    safeBpmA && safeBpmB
      ? (Math.abs(safeBpmA - safeBpmB) / Math.max(safeBpmA, safeBpmB)) * 100
      : 0;

  // Key compatibility
  const keyDistance = camelotDistance(keyA, keyB);

  // Base overlap in bars
  let overlapBars: number;
  if (keyDistance <= 1) overlapBars = 8;
  else if (keyDistance <= 3) overlapBars = 4;
  else if (keyDistance <= 5) overlapBars = 2;
  else overlapBars = 0.5;

  // BPM penalty
  if (bpmDiffPct > 12) overlapBars = Math.min(overlapBars, 1);
  else if (bpmDiffPct > 6) overlapBars = Math.min(overlapBars, 2);

  // Calculate ms
  const avgBpm = ((safeBpmA || 120) + (safeBpmB || 120)) / 2;
  let overlapMs = barsToMs(overlapBars, avgBpm);
  overlapMs = snapToBeat(overlapMs, avgBpm);

  return {
    overlapMs,
    fadeOutMs: overlapMs,
    fadeInMs: 0, // Track B ALWAYS at full volume
    keyDistance,
    bpmDiffPct: Math.round(bpmDiffPct * 10) / 10,
  };
}
