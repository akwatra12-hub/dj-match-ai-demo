# DJ Track Matcher — MVP

A working prototype: upload tracks, get BPM/key analysis, and see ranked
harmonic/tempo-compatible matches from your library. No dependency on
Spotify or any third-party metadata API — analysis runs entirely on your
own audio files via Essentia.

## Setup

```bash
pip install fastapi uvicorn python-multipart essentia
```

## Run

```bash
cd dj_track_matcher
uvicorn app:app --reload
```

Open **http://127.0.0.1:8000** in a browser.

## How it works

- `audio_analysis.py` — extracts BPM, key, Camelot code, loudness,
  danceability, and dynamic complexity from an audio file using Essentia.
- `matching_engine.py` — rule-based scoring: Camelot wheel harmony (45pts),
  tempo compatibility incl. half/double-time (35pts), energy closeness (20pts).
- `database.py` — SQLite storage for the track library (swap for Postgres
  later without changing the calling code).
- `app.py` — FastAPI backend wiring it together, with `/upload`, `/library`,
  and `/matches/{track_id}` endpoints.
- `static/index.html` — a single-page UI: upload a track, browse your
  library, click "Find matches" to see ranked compatible tracks with
  the reasons for each match.

## Tested

This has been run end-to-end (upload -> analyze -> store -> match) against
real audio files with known BPM/key, confirming correct detection and
correct compatibility ranking (matches with correct key+tempo score highest,
wrong-tempo tracks are correctly penalized).

## Known limitations to fix before real use

- No auth — anyone with network access can upload/view the library.
- Essentia's beat-tracking can misfire on unusual signals (e.g. very
  synthetic or heavily filtered audio) — worth validating against a set
  of real commercial tracks with known BPM before trusting it in production.
- No de-duplication — re-uploading the same file creates a new entry.
- Camelot mapping assumes Essentia's key output uses standard note names
  (sharps); double-check enharmonic edge cases (e.g. Db vs C#) against a
  larger test set.

## Suggested next steps

1. Test against ~20-30 real tracks with known BPM/key (from Mixed In Key
   or similar) to validate Essentia's accuracy against your genre of choice.
2. Add basic auth + per-user libraries.
3. Add a CLAP or MERT audio-embedding similarity term to the matching
   engine for "vibe" matching beyond pure theory compatibility.
4. Move from SQLite to Postgres + a proper file storage bucket (S3, etc.)
   once you're past prototyping.
