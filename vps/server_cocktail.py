"""
Hearty Radio — Cocktail Server

Liquidsoap automation server for the Cocktail radio channel.
Handles track scheduling, crossfade calculation, and Liquidsoap annotations.

Crossfade logic:
- When a jingle is inserted: jingle handles the transition
- When music→music (no jingle): harmonic crossfade engine calculates
  optimal overlap based on BPM + key compatibility
- Track B ALWAYS starts at full volume (fade_in = 0)
"""

import json
import logging
import sqlite3
from flask import Flask, request, jsonify

from crossfade_engine import (
    camelot_distance,
    calculate_harmonic_crossfade,
    build_annotations,
)

app = Flask(__name__)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Database helpers
# ---------------------------------------------------------------------------

DB_PATH = '/var/lib/hearty/cocktail.db'


def get_db():
    """Get a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_track_by_id(track_id: int) -> dict | None:
    """Fetch a track record including BPM and key."""
    db = get_db()
    try:
        row = db.execute(
            'SELECT id, title, artist, filepath, bpm, key, '
            'duration_s, liq_cross_duration, fade_out_override '
            'FROM tracks WHERE id = ?',
            (track_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Current track state (in production this would be in Redis/DB)
# ---------------------------------------------------------------------------

_current_track = {
    'id': None,
    'bpm': None,
    'key': None,
    'title': None,
    'artist': None,
}


def _update_current_track(track: dict):
    """Update the in-memory current track state."""
    _current_track['id'] = track.get('id')
    _current_track['bpm'] = track.get('bpm')
    _current_track['key'] = track.get('key')
    _current_track['title'] = track.get('title')
    _current_track['artist'] = track.get('artist')


# ---------------------------------------------------------------------------
# Cue endpoint — Liquidsoap reads fade_out overrides from here
# ---------------------------------------------------------------------------

_latest_cue = {}


@app.route('/cue/latest', methods=['GET'])
def cue_latest():
    """
    Return the latest cue point data.
    Liquidsoap polls this to get fade_out overrides per track.
    """
    return jsonify(_latest_cue)


@app.route('/cue/latest', methods=['POST'])
def cue_update():
    """Update the latest cue point data."""
    global _latest_cue
    _latest_cue = request.get_json(force=True)
    return jsonify({'status': 'ok'})


# ---------------------------------------------------------------------------
# get_next — Main endpoint: Liquidsoap calls this to get the next track
# ---------------------------------------------------------------------------

@app.route('/get_next', methods=['GET'])
def get_next():
    """
    Return the next track for Liquidsoap with crossfade annotations.

    When there is no jingle between tracks (music→music transition),
    the harmonic crossfade engine calculates optimal parameters:

    1. Read BPM and key of current track (Track A) and next track (Track B)
    2. Calculate Camelot distance for key compatibility
    3. Calculate BPM difference percentage
    4. Determine overlap duration (snapped to bar/beat grid)
    5. Set fade_out = overlap, fade_in = 0 (Track B at full volume)
    6. Return as Liquidsoap annotations

    Liquidsoap respects these annotations natively:
    - liq_cross_duration: overlap window
    - liq_fade_out: outgoing track fade
    - liq_fade_in: incoming track fade (always 0)
    """
    # In production: scheduler picks next track from playlist/rotation
    next_track = _select_next_track()

    if not next_track:
        logger.warning("No next track available")
        return jsonify({'error': 'no tracks available'}), 404

    # Check if a jingle should be inserted
    jingle = _check_jingle_insertion()

    if jingle:
        # Jingle handles the transition — use jingle's own crossfade settings
        _update_current_track(next_track)
        return jsonify({
            'type': 'jingle_then_track',
            'jingle': jingle,
            'track': _format_track_response(next_track, use_default_crossfade=True),
        })

    # Music→music transition: calculate harmonic crossfade
    crossfade = calculate_harmonic_crossfade(
        bpm_a=_current_track.get('bpm'),
        bpm_b=next_track.get('bpm'),
        key_a=_current_track.get('key'),
        key_b=next_track.get('key'),
    )

    annotations = build_annotations(crossfade)

    # Check for manual fade_out override from /cue/latest
    if next_track.get('fade_out_override'):
        annotations['liq_fade_out'] = str(next_track['fade_out_override'])

    response = _format_track_response(next_track, annotations=annotations)
    response['crossfade'] = crossfade  # Include for logging/debugging

    logger.info(
        "Served next track: %s - %s | overlap=%.1fs key_dist=%d bpm_diff=%.1f%%",
        next_track.get('artist', '?'),
        next_track.get('title', '?'),
        crossfade['overlap_s'],
        crossfade['key_distance'],
        crossfade['bpm_diff_pct'],
    )

    _update_current_track(next_track)

    return jsonify(response)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _select_next_track() -> dict | None:
    """
    Select the next track from the rotation/playlist.
    In production: complex scheduling logic with rotation rules,
    dayparting, artist separation, etc.
    """
    db = get_db()
    try:
        # Simplified: pick a random track not recently played
        row = db.execute(
            'SELECT id, title, artist, filepath, bpm, key, '
            'duration_s, liq_cross_duration, fade_out_override '
            'FROM tracks '
            'WHERE id != ? '
            'ORDER BY RANDOM() LIMIT 1',
            (_current_track.get('id') or 0,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        db.close()


def _check_jingle_insertion() -> dict | None:
    """
    Check if a jingle should be inserted before the next track.
    Returns jingle dict or None.
    In production: checks jingle rotation rules, timing, etc.
    """
    # Placeholder — jingle insertion logic would go here
    return None


def _format_track_response(
    track: dict,
    annotations: dict | None = None,
    use_default_crossfade: bool = False,
) -> dict:
    """
    Format a track dict into the JSON response for Liquidsoap.

    The annotate URI format that Liquidsoap expects:
    annotate:liq_cross_duration="8.0",liq_fade_out="8.0",liq_fade_in="0.0":/path/to/file.mp3
    """
    if use_default_crossfade:
        annotations = {
            'liq_cross_duration': '3.0',
            'liq_fade_out': '3.0',
            'liq_fade_in': '0.0',
        }
    elif not annotations:
        annotations = {}

    # Build annotate URI for Liquidsoap
    ann_parts = [f'{k}="{v}"' for k, v in annotations.items()]
    ann_str = ','.join(ann_parts)
    filepath = track.get('filepath', '')
    annotate_uri = f'annotate:{ann_str}:{filepath}' if ann_str else filepath

    return {
        'id': track.get('id'),
        'title': track.get('title'),
        'artist': track.get('artist'),
        'filepath': filepath,
        'annotate_uri': annotate_uri,
        'bpm': track.get('bpm'),
        'key': track.get('key'),
        'duration_s': track.get('duration_s'),
        'annotations': annotations,
    }


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'server': 'cocktail'})


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    )
    app.run(host='0.0.0.0', port=8001)
