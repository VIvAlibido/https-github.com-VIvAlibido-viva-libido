"""Tests for the Harmonic Crossfade Engine."""

import pytest
from crossfade_engine import (
    _parse_camelot,
    camelot_distance,
    snap_to_beat,
    calculate_harmonic_crossfade,
    build_annotations,
)


# ---------------------------------------------------------------------------
# Camelot parsing
# ---------------------------------------------------------------------------

class TestParseCamelot:
    def test_valid_keys(self):
        assert _parse_camelot('8A') == (8, 'A')
        assert _parse_camelot('12B') == (12, 'B')
        assert _parse_camelot('1a') == (1, 'A')

    def test_invalid_keys(self):
        assert _parse_camelot('') is None
        assert _parse_camelot('0A') is None
        assert _parse_camelot('13B') is None
        assert _parse_camelot('Am') is None
        assert _parse_camelot(None) is None


# ---------------------------------------------------------------------------
# Camelot distance
# ---------------------------------------------------------------------------

class TestCamelotDistance:
    def test_same_key(self):
        assert camelot_distance('8A', '8A') == 0

    def test_adjacent_same_mode(self):
        assert camelot_distance('8A', '9A') == 1
        assert camelot_distance('8A', '7A') == 1

    def test_relative_major_minor(self):
        assert camelot_distance('8A', '8B') == 1

    def test_wrap_around(self):
        assert camelot_distance('1A', '12A') == 1
        assert camelot_distance('12B', '1B') == 1

    def test_medium_distance(self):
        assert camelot_distance('8A', '10A') == 2
        assert camelot_distance('8A', '5A') == 3

    def test_far_distance(self):
        assert camelot_distance('1A', '7A') == 6

    def test_missing_keys(self):
        assert camelot_distance(None, '8A') == 6
        assert camelot_distance('8A', None) == 6
        assert camelot_distance(None, None) == 6


# ---------------------------------------------------------------------------
# Beat snapping
# ---------------------------------------------------------------------------

class TestSnapToBeat:
    def test_snap_to_bar(self):
        # At 120 BPM: 1 bar = 2000ms
        result = snap_to_beat(3500, 120)
        assert result == 4000  # 2 bars

    def test_snap_to_beat_short(self):
        # At 120 BPM: 1 beat = 500ms
        result = snap_to_beat(800, 120)
        assert result == 1000  # 2 beats

    def test_invalid_bpm(self):
        result = snap_to_beat(3000, 0)
        assert result == 3000  # unchanged

    def test_minimum_one_beat(self):
        result = snap_to_beat(100, 120)
        assert result == 500  # 1 beat minimum


# ---------------------------------------------------------------------------
# Harmonic crossfade calculation
# ---------------------------------------------------------------------------

class TestCalculateHarmonicCrossfade:
    def test_perfect_key_match(self):
        """Same key, similar BPM → long blend (~8 bars)."""
        result = calculate_harmonic_crossfade(120, 120, '8A', '8A')
        assert result['key_distance'] == 0
        assert result['fade_in_s'] == 0.0
        assert result['overlap_bars'] == 8
        # 8 bars at 120 BPM = 16s → snapped = 16s
        assert result['overlap_s'] == 16.0

    def test_adjacent_key(self):
        """Adjacent key → also 8 bars (distance 1)."""
        result = calculate_harmonic_crossfade(120, 120, '8A', '9A')
        assert result['key_distance'] == 1
        assert result['overlap_bars'] == 8

    def test_good_key_match(self):
        """Key distance 2-3 → 4 bars."""
        result = calculate_harmonic_crossfade(120, 120, '8A', '10A')
        assert result['key_distance'] == 2
        assert result['overlap_bars'] == 4

    def test_key_clash(self):
        """Key distance 6 → quick cut (0.5 bars)."""
        result = calculate_harmonic_crossfade(120, 120, '1A', '7A')
        assert result['key_distance'] == 6
        assert result['overlap_bars'] == 0.5
        assert result['overlap_s'] < 1.5

    def test_bpm_penalty_large(self):
        """BPM diff >12% → max 1 bar regardless of key."""
        result = calculate_harmonic_crossfade(100, 120, '8A', '8A')
        assert result['bpm_diff_pct'] > 12
        assert result['overlap_bars'] <= 1

    def test_bpm_penalty_medium(self):
        """BPM diff 6-12% → max 2 bars."""
        result = calculate_harmonic_crossfade(120, 130, '8A', '8A')
        assert result['bpm_diff_pct'] > 6
        assert result['overlap_bars'] <= 2

    def test_fade_in_always_zero(self):
        """Track B ALWAYS starts at full volume."""
        for key in ['8A', '1B', '12A', '6B']:
            result = calculate_harmonic_crossfade(120, 120, '8A', key)
            assert result['fade_in_s'] == 0.0

    def test_missing_data(self):
        """Missing BPM/key → conservative short crossfade."""
        result = calculate_harmonic_crossfade(None, None, None, None)
        assert result['key_distance'] == 6
        assert result['fade_in_s'] == 0.0


# ---------------------------------------------------------------------------
# Annotation building
# ---------------------------------------------------------------------------

class TestBuildAnnotations:
    def test_basic(self):
        crossfade = {
            'overlap_s': 8.0,
            'fade_out_s': 8.0,
            'fade_in_s': 0.0,
        }
        ann = build_annotations(crossfade)
        assert ann['liq_cross_duration'] == '8.0'
        assert ann['liq_fade_out'] == '8.0'
        assert ann['liq_fade_in'] == '0.0'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
