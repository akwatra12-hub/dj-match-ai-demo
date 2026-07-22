"""
app.py

FastAPI backend for the DJ track-matching MVP.

Run locally:
    pip install fastapi uvicorn python-multipart essentia
    uvicorn app:app --reload

Then open http://127.0.0.1:8000 in a browser.

Endpoints:
    POST /upload            -- upload an audio file, analyze it, store it
    GET  /library            -- list all analyzed tracks
    GET  /matches/{track_id} -- get ranked compatible tracks for a given track
    DELETE /tracks/{track_id}-- remove a track from the library
"""

import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from audio_analysis import extract_features
from matching_engine import find_matches
import database as db

UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(title="DJ Track Matcher")
db.init_db()


@app.post("/upload")
async def upload_track(file: UploadFile = File(...)):
    """Accepts an audio file, runs feature extraction, stores the result."""
    if not file.filename.lower().endswith((".mp3", ".wav", ".flac", ".m4a", ".aiff")):
        raise HTTPException(400, "Unsupported file type. Use mp3, wav, flac, m4a, or aiff.")

    track_id = str(uuid.uuid4())[:8]
    dest_path = UPLOAD_DIR / f"{track_id}_{file.filename}"

    with dest_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        features = extract_features(str(dest_path))
    except Exception as e:
        dest_path.unlink(missing_ok=True)
        raise HTTPException(422, f"Could not analyze audio: {e}")

    db.save_track(track_id, file.filename, features)

    return {"track_id": track_id, "filename": file.filename, **features}


@app.get("/library")
async def get_library():
    return db.list_tracks()


@app.get("/matches/{track_id}")
async def get_matches(track_id: str, top_n: int = 10):
    target = db.get_track(track_id)
    if not target:
        raise HTTPException(404, "Track not found")

    library = db.list_tracks()
    matches = find_matches(target, library, top_n=top_n)

    # Attach filenames for display, since matching_engine only knows track_ids.
    lookup = {t["track_id"]: t for t in library}
    results = []
    for m in matches:
        t = lookup.get(m.track_id, {})
        results.append({
            "track_id": m.track_id,
            "filename": t.get("filename", "unknown"),
            "score": m.score,
            "reasons": m.reasons,
            "bpm": t.get("bpm"),
            "camelot": t.get("camelot"),
        })

    return {"target": target, "matches": results}


@app.delete("/tracks/{track_id}")
async def remove_track(track_id: str):
    db.delete_track(track_id)
    return {"status": "deleted"}


# --- Simple frontend ---
@app.get("/", response_class=HTMLResponse)
async def index():
    return (Path(__file__).parent / "index.html").read_text()

app.mount("/static", StaticFiles(directory=str(Path(__file__).parent)), name="static")
