import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/muse")

def get_db_connection():
    """Returns a new psycopg2 connection using RealDictCursor for dict-like rows."""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    conn.autocommit = True
    return conn

def get_room_artifacts(room_id: str) -> List[Dict[str, Any]]:
    """Fetches all unstructured JSON data for a given room."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, source_url, type, unstructured_data
                FROM artifacts
                WHERE room_id = %s
            """, (room_id,))
            return cur.fetchall()
    finally:
        conn.close()

def save_threads(room_id: str, threads: List[Dict[str, Any]]):
    """Saves generated threads back into the database."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            for thread in threads:
                cur.execute("""
                    INSERT INTO threads (room_id, artifact_ids, ai_blueprint)
                    VALUES (%s, %s, %s)
                """, (room_id, thread["artifact_ids"], psycopg2.extras.Json(thread["blueprint"])))
    finally:
        conn.close()
