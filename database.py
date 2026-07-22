"""
database.py

Lightweight SQLite storage for analyzed tracks. Good enough for an MVP
with hundreds/low-thousands of tracks; swap for Postgres later if needed --
the function signatures here won't need to change.
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).parent / "tracks.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS tracks (
            track_id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            bpm REAL,
            key TEXT,
            scale TEXT,
            camelot TEXT,
            key_strength REAL,
            loudness REAL,
            danceability REAL,
            dynamic_complexity REAL,
            duration REAL,
            raw_json TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def save_track(track_id: str, filename: str, features: dict):
    conn = get_conn()
    conn.execute(
        """
        INSERT OR REPLACE INTO tracks
        (track_id, filename, bpm, key, scale, camelot, key_strength,
         loudness, danceability, dynamic_complexity, duration, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            track_id,
            filename,
            features["bpm"],
            features["key"],
            features["scale"],
            features["camelot"],
            features["key_strength"],
            features["loudness"],
            features["danceability"],
            features["dynamic_complexity"],
            features["duration"],
            json.dumps(features),
        ),
    )
    conn.commit()
    conn.close()


def get_track(track_id: str) -> dict | None:
    conn = get_conn()
    row = conn.execute("SELECT * FROM tracks WHERE track_id = ?", (track_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def list_tracks() -> list[dict]:
    conn = get_conn()
    rows = conn.execute("SELECT * FROM tracks ORDER BY rowid DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_track(track_id: str):
    conn = get_conn()
    conn.execute("DELETE FROM tracks WHERE track_id = ?", (track_id,))
    conn.commit()
    conn.close()
