"""
Harmonic Crossfade Engine — Shared module for all Hearty radio servers.

Calculates professional music→music crossfade parameters based on:
- BPM compatibility (tempo matching)
- Key compatibility (Camelot wheel harmonic mixing)
- Beat/bar grid snapping (transitions land on musical boundaries)

Used by server_cocktail.py, server.py, and server_melodica.py to generate
Liquidsoap-compatible annotations (liq_cross_duration, liq_fade_out).

Track B ALWAYS starts at full volume (fade_in = 0).
"""

import re
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Camelot Wheel — maps Camelot codes to (number, letter) for distance calc
# ---------------------------------------------------------------------------
CAMELOT_PATTERN = re.compile(r'^(\d{1,2})([AB])$', re.IGNORECASE)


def _parse_camelot(key: str) -> tuple[int, str] | None:
    """Parse a Camelot notation string like '8A' into (8, 'A')."""
    if not key:
        return None
    m = CAMELOT_PATTERN.match(key.strip())
    if not m:
        return None
    num = int(m.group(1))
    letter = m.group(2).upper()
    if num < 1 or num > 12:
        return None
    return (num, letter)


def camelot_distance(key_a: str | None, key_b: str | None) -> int:
    """
    Calculate the harmonic distance between two Camelot keys.

    Returns 0-6 where:
      0 = same key (perfect)
      1 = adjacent on Camelot wheel (perfect mix)
      2-3 = good harmonic compatibility
      4-5 = acceptable but noticeable
      6 = maximum distance (clash)

    Returns 6 (worst) if either key is missing/invalid.
    """
    if not key_a or not key_b:
        return 6  # unknown → treat as clash, use short crossfade

    parsed_a = _parse_camelot(key_a)
    parsed_b = _parse_camelot(key_b)
    if not parsed_a or not parsed_b:
        return 6

    num_a, letter_a = parsed_a
    num_b, letter_b = parsed_b

    # Circular distance on the 12-position wheel
    circle_dist = min(abs(num_a - num_b), 12 - abs(num_a - num_b))

    # Same letter (both major or both minor)
    if letter_a == letter_b:
        return min(circle_dist, 6)

    # Cross-mode (A↔B): same number = relative major/minor (distance 1)
    if num_a == num_b:
        return 1

    # Cross-mode with different numbers: add 1 for the mode change
    return min(circle_dist + 1, 6)


# ---------------------------------------------------------------------------
# Beat/Bar Grid Snapping
# ---------------------------------------------------------------------------

def snap_to_beat(overlap_ms: float, bpm: float) -> float:
    """
    Snap an overlap duration to the nearest bar (4 beats) or beat boundary.

    For overlaps > 2000ms: snap to nearest bar (4 beats).
    For overlaps <= 2000ms: snap to nearest beat.
    Always returns at least 1 beat duration.
    """
    if not bpm or bpm < 60 or bpm > 200:
        return overlap_ms

    ms_per_beat = 60000.0 / bpm
    ms_per_bar = ms_per_beat * 4

    if overlap_ms > 2000:
        # Snap to bar grid
        bars = max(1, round(overlap_ms / ms_per_bar))
        return bars * ms_per_bar
    else:
        # Snap to beat grid
        beats = max(1, round(overlap_ms / ms_per_beat))
        return beats * ms_per_beat


# ---------------------------------------------------------------------------
# Harmonic Crossfade Calculator
# ---------------------------------------------------------------------------

def calculate_harmonic_crossfade(
    bpm_a: float | None,
    bpm_b: float | None,
    key_a: str | None,
    key_b: str | None,
) -> dict:
    """
    Calculate professional crossfade parameters for a music→music transition.

    Based on BPM compatibility and Camelot key distance, determines:
    - overlap_s: how long both tracks play simultaneously
    - fade_out_s: Track A fade-out duration (= overlap)
    - fade_in_s: Track B fade-in duration (ALWAYS 0 — full volume from start)
    - key_distance: Camelot distance (0-6)
    - bpm_diff_pct: BPM difference as percentage

    Crossfade strategy by key distance:
    ┌──────────────┬──────────┬───────────┬──────────────────────────┐
    │ Key Distance  │ Bars     │ ~Duration │ Result                   │
    ├──────────────┼──────────┼───────────┼──────────────────────────┤
    │ 0-1 (perfect) │ 8 bars   │ 6-8s      │ Seamless DJ blend        │
    │ 2-3 (good)    │ 4 bars   │ 3-4s      │ Professional radio       │
    │ 4-5 (ok)      │ 2 bars   │ 2s        │ Quick crossfade          │
    │ 6 (clash)     │ 0.5 bar  │ 0.5-1s    │ Fast cut, intentional    │
    └──────────────┴──────────┴───────────┴──────────────────────────┘

    BPM penalty: if BPM differs >6%, overlap is reduced to prevent
    audible tempo clashes during the blend.
    """
    safe_bpm_a = bpm_a if bpm_a and 60 <= bpm_a <= 200 else None
    safe_bpm_b = bpm_b if bpm_b and 60 <= bpm_b <= 200 else None

    # BPM compatibility
    if safe_bpm_a and safe_bpm_b:
        bpm_diff_pct = abs(safe_bpm_a - safe_bpm_b) / max(safe_bpm_a, safe_bpm_b) * 100
    else:
        bpm_diff_pct = 0  # unknown → no penalty

    # Key compatibility (Camelot distance)
    key_dist = camelot_distance(key_a, key_b)

    # Base overlap from key match (in bars)
    if key_dist <= 1:
        base_overlap_bars = 8    # perfect → long blend
    elif key_dist <= 3:
        base_overlap_bars = 4    # good → medium
    elif key_dist <= 5:
        base_overlap_bars = 2    # acceptable → short
    else:
        base_overlap_bars = 0.5  # clash → quick cut

    # BPM penalty: reduce overlap if tempo mismatch
    if bpm_diff_pct > 12:
        base_overlap_bars = min(base_overlap_bars, 1)
    elif bpm_diff_pct > 6:
        base_overlap_bars = min(base_overlap_bars, 2)

    # Calculate in ms using average BPM (default 120 if unknown)
    avg_bpm = ((safe_bpm_a or 120) + (safe_bpm_b or 120)) / 2
    ms_per_bar = (60000.0 / avg_bpm) * 4
    overlap_ms = base_overlap_bars * ms_per_bar

    # Snap to bar/beat grid
    overlap_ms = snap_to_beat(overlap_ms, avg_bpm)

    # Fade-out = full overlap window (Track A fades over entire overlap)
    fade_out_ms = overlap_ms

    result = {
        'overlap_s': round(overlap_ms / 1000, 3),
        'fade_out_s': round(fade_out_ms / 1000, 3),
        'fade_in_s': 0.0,           # NEVER fade in — Track B at full volume
        'key_distance': key_dist,
        'bpm_diff_pct': round(bpm_diff_pct, 1),
        'avg_bpm': round(avg_bpm, 1),
        'overlap_bars': base_overlap_bars,
    }

    logger.info(
        "Crossfade: key=%s→%s (dist=%d) bpm=%.0f→%.0f (diff=%.1f%%) "
        "→ overlap=%.1fs (%s bars) fade_out=%.1fs fade_in=0s",
        key_a or '?', key_b or '?', key_dist,
        safe_bpm_a or 0, safe_bpm_b or 0, bpm_diff_pct,
        result['overlap_s'], base_overlap_bars,
        result['fade_out_s'],
    )

    return result


def build_annotations(crossfade: dict) -> dict:
    """
    Convert crossfade parameters to Liquidsoap annotation dict.

    Returns annotations that Liquidsoap already respects:
    - liq_cross_duration: overlap duration in seconds
    - liq_fade_out: fade-out duration for outgoing track
    - liq_fade_in: fade-in duration for incoming track (always 0)
    """
    return {
        'liq_cross_duration': str(crossfade['overlap_s']),
        'liq_fade_out': str(crossfade['fade_out_s']),
        'liq_fade_in': '0.0',
    }
