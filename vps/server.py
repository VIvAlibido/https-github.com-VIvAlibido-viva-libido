"""
Hearty Radio — Main Server

Primary Liquidsoap automation server.
Uses the shared crossfade_engine for harmonic music→music transitions.
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

DB_PATH = '/var/lib/hearty/main.db'


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


_current_track = {
    'id': None, 'bpm': None, 'key': None, 'title': None, 'artist': None,
}

_latest_cue = {}


@app.route('/cue/latest', methods=['GET'])
def cue_latest():
    return jsonify(_latest_cue)


@app.route('/cue/latest', methods=['POST'])
def cue_update():
    global _latest_cue
    _latest_cue = request.get_json(force=True)
    return jsonify({'status': 'ok'})


@app.route('/get_next', methods=['GET'])
def get_next():
    """Return the next track with harmonic crossfade annotations."""
    db = get_db()
    try:
        row = db.execute(
            'SELECT id, title, artist, filepath, bpm, key, '
            'duration_s, liq_cross_duration, fade_out_override '
            'FROM tracks WHERE id != ? ORDER BY RANDOM() LIMIT 1',
            (_current_track.get('id') or 0,)
        ).fetchone()
    finally:
        db.close()

    if not row:
        return jsonify({'error': 'no tracks available'}), 404

    next_track = dict(row)

    # Music→music harmonic crossfade
    crossfade = calculate_harmonic_crossfade(
        bpm_a=_current_track.get('bpm'),
        bpm_b=next_track.get('bpm'),
        key_a=_current_track.get('key'),
        key_b=next_track.get('key'),
    )
    annotations = build_annotations(crossfade)

    if next_track.get('fade_out_override'):
        annotations['liq_fade_out'] = str(next_track['fade_out_override'])

    # Build annotate URI
    ann_parts = [f'{k}="{v}"' for k, v in annotations.items()]
    filepath = next_track.get('filepath', '')
    annotate_uri = f'annotate:{",".join(ann_parts)}:{filepath}'

    response = {
        'id': next_track['id'],
        'title': next_track['title'],
        'artist': next_track['artist'],
        'filepath': filepath,
        'annotate_uri': annotate_uri,
        'bpm': next_track.get('bpm'),
        'key': next_track.get('key'),
        'duration_s': next_track.get('duration_s'),
        'annotations': annotations,
        'crossfade': crossfade,
    }

    logger.info(
        "Served: %s - %s | overlap=%.1fs key_dist=%d",
        next_track.get('artist', '?'), next_track.get('title', '?'),
        crossfade['overlap_s'], crossfade['key_distance'],
    )

    _current_track.update({
        'id': next_track['id'],
        'bpm': next_track.get('bpm'),
        'key': next_track.get('key'),
        'title': next_track.get('title'),
        'artist': next_track.get('artist'),
    })

    return jsonify(response)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'server': 'main'})


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(name)s] %(levelname)s: %(message)s',
    )
    app.run(host='0.0.0.0', port=8000)
