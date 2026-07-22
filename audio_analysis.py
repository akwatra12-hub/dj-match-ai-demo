"""
audio_analysis.py

Core audio feature extraction for the DJ track-matching tool.
Uses Essentia (open-source MIR library) to extract BPM, key, and energy
directly from audio files -- no dependency on Spotify or any third-party
metadata API.

Install:
    pip install essentia --break-system-packages   (on Debian/Ubuntu envs)
    pip install essentia                            (elsewhere)

Usage:
    from audio_analysis import extract_features
    features = extract_features("track.mp3")
    print(features)
"""

import essentia
import essentia.standard as es

essentia.log.infoActive = False  # quiet Essentia's internal logging


def extract_features(audio_path: str) -> dict:
    """
    Extract BPM, musical key, Camelot code, and energy-related features
    from a single audio file.

    Returns a dict with:
        bpm            float, beats per minute
        key            str, e.g. "A"
        scale          str, "major" or "minor"
        camelot        str, e.g. "11A"  (Camelot wheel notation)
        key_strength   float 0-1, confidence of the key detection
        loudness       float, integrated loudness (LUFS-ish, via ReplayGain)
        danceability   float, 0-3 range (Essentia's DFA-based measure)
        dynamic_complexity  float, higher = more dynamic range/variation
        duration       float, seconds
    """
    # MonoLoader resamples to 44.1kHz mono, which is what most Essentia
    # algorithms expect.
    loader = es.MonoLoader(filename=audio_path)
    audio = loader()

    # --- Tempo (BPM) ---
    rhythm_extractor = es.RhythmExtractor2013(method="multifeature")
    bpm, beats, beats_confidence, _, beats_intervals = rhythm_extractor(audio)

    # --- Key detection ---
    key_extractor = es.KeyExtractor()
    key, scale, key_strength = key_extractor(audio)

    # --- Loudness / danceability / dynamic complexity ---
    loudness = es.Loudness()(audio)
    danceability, _ = es.Danceability()(audio)
    dynamic_complexity, _ = es.DynamicComplexity()(audio)

    duration = len(audio) / 44100.0

    return {
        "bpm": round(float(bpm), 2),
        "key": key,
        "scale": scale,
        "camelot": to_camelot(key, scale),
        "key_strength": round(float(key_strength), 3),
        "loudness": round(float(loudness), 2),
        "danceability": round(float(danceability), 3),
        "dynamic_complexity": round(float(dynamic_complexity), 3),
        "duration": round(duration, 1),
    }


# ---------------------------------------------------------------------------
# Camelot wheel mapping
# ---------------------------------------------------------------------------
# The Camelot wheel is the notation DJs actually use for harmonic mixing.
# Numbers 1-12 = position on the circle of fifths; "A" = minor, "B" = major.
# Standard mapping (Essentia key names -> Camelot code).

_CAMELOT_MAJOR = {
    "B": "1B", "F#": "2B", "Gb": "2B", "Db": "3B", "C#": "3B",
    "Ab": "4B", "G#": "4B", "Eb": "5B", "D#": "5B", "Bb": "6B", "A#": "6B",
    "F": "7B", "C": "8B", "G": "9B", "D": "10B", "A": "11B", "E": "12B",
}

_CAMELOT_MINOR = {
    "Ab": "1A", "G#": "1A", "Eb": "2A", "D#": "2A", "Bb": "3A", "A#": "3A",
    "F": "4A", "C": "5A", "G": "6A", "D": "7A", "A": "8A", "E": "9A",
    "B": "10A", "F#": "11A", "Gb": "11A", "C#": "12A", "Db": "12A",
}


def to_camelot(key: str, scale: str) -> str:
    """Convert an Essentia (key, scale) pair to Camelot wheel notation."""
    table = _CAMELOT_MAJOR if scale == "major" else _CAMELOT_MINOR
    return table.get(key, "?")


if __name__ == "__main__":
    import sys
    import json

    path = sys.argv[1] if len(sys.argv) > 1 else "test.wav"
    result = extract_features(path)
    print(json.dumps(result, indent=2))
