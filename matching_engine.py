"""
matching_engine.py

Given a target track's extracted features (from audio_analysis.py) and a
library of other analyzed tracks, rank the library by DJ-mix compatibility:
harmonic (Camelot) fit, tempo fit, and energy/danceability closeness.

This is deliberately rule-based and dependency-free -- no ML model needed
for a working MVP. A vector-embedding similarity layer (CLAP/MERT) can be
added later as an extra scoring term without changing this structure.
"""

from dataclasses import dataclass


# Camelot wheel adjacency: for a given code, which codes mix well.
# Rule: same number (relative major/minor), +/-1 number same letter
# (adjacent keys), or same number different letter (relative major/minor
# switch) are all considered harmonically compatible.
def camelot_compatible(a: str, b: str) -> bool:
    if a == "?" or b == "?":
        return False
    if a == b:
        return True
    a_num, a_letter = int(a[:-1]), a[-1]
    b_num, b_letter = int(b[:-1]), b[-1]

    same_letter_adjacent = (
        a_letter == b_letter and abs(a_num - b_num) in (0, 1, 11)  # wraps 12->1
    )
    relative_switch = (a_num == b_num and a_letter != b_letter)

    return same_letter_adjacent or relative_switch


def bpm_compatible(a_bpm: float, b_bpm: float, tolerance_pct: float = 6.0) -> bool:
    """
    DJs typically pitch-shift up to ~6% without it sounding off.
    Also treat half-time/double-time tracks (e.g. 85 vs 170 bpm) as
    compatible, since that's a common DJ trick.
    """
    for factor in (1, 2, 0.5):
        target = b_bpm * factor
        if abs(a_bpm - target) / target * 100 <= tolerance_pct:
            return True
    return False


@dataclass
class MatchResult:
    track_id: str
    score: float
    reasons: list


def score_match(target: dict, candidate: dict) -> MatchResult:
    """
    Score a candidate track's compatibility with the target track.
    Returns a MatchResult with a 0-100 score and human-readable reasons,
    so the UI can explain *why* something was recommended (important for
    DJs to trust the suggestion rather than treat it as a black box).
    """
    score = 0.0
    reasons = []

    # Harmonic compatibility -- weighted heaviest, it's the DJ's primary rule.
    if camelot_compatible(target["camelot"], candidate["camelot"]):
        score += 45
        reasons.append(f"Harmonically compatible ({target['camelot']} -> {candidate['camelot']})")

    # Tempo compatibility.
    if bpm_compatible(target["bpm"], candidate["bpm"]):
        score += 35
        reasons.append(f"Tempo compatible ({target['bpm']} vs {candidate['bpm']} BPM)")

    # Energy/danceability closeness -- softer signal, keeps the set's vibe consistent.
    energy_diff = abs(target["danceability"] - candidate["danceability"])
    energy_score = max(0, 20 - energy_diff * 10)
    score += energy_score
    if energy_score > 12:
        reasons.append("Similar energy/danceability")

    return MatchResult(track_id=candidate.get("track_id", "unknown"), score=round(score, 1), reasons=reasons)


def find_matches(target: dict, library: list[dict], top_n: int = 10) -> list[MatchResult]:
    """
    library: list of feature dicts (each must include a 'track_id' key
    plus the fields produced by audio_analysis.extract_features).
    """
    results = [score_match(target, c) for c in library if c.get("track_id") != target.get("track_id")]
    results.sort(key=lambda r: r.score, reverse=True)
    return results[:top_n]


if __name__ == "__main__":
    # Small demo with fabricated feature dicts (normally these would come
    # from running audio_analysis.extract_features on real files).
    target = {"track_id": "target", "bpm": 128.0, "camelot": "8A", "danceability": 4.4}

    library = [
        {"track_id": "trackA", "bpm": 127.5, "camelot": "8A", "danceability": 4.3},   # great match
        {"track_id": "trackB", "bpm": 128.0, "camelot": "9A", "danceability": 4.0},   # harmonic neighbor
        {"track_id": "trackC", "bpm": 174.0, "camelot": "8A", "danceability": 4.2},   # wrong tempo
        {"track_id": "trackD", "bpm": 128.2, "camelot": "3B", "danceability": 4.5},   # wrong key
        {"track_id": "trackE", "bpm": 64.0, "camelot": "8A", "danceability": 4.1},    # half-time match
    ]

    for m in find_matches(target, library):
        print(f"{m.track_id}: score={m.score}  {m.reasons}")
