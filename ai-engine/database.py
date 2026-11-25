import os
import psycopg2
from psycopg2.extras import RealDictCursor, Json
from typing import List, Dict, Any, Optional

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


def save_artifact_analysis(artifact_id: str, nlp_analysis: Dict[str, Any], confidence: float, analysis_method: str) -> bool:
    """Persist artifact-level NLP metadata to artifacts and enable fast querying."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE artifacts
                SET nlp_analysis = %s,
                    nlp_confidence = %s,
                    analyzed_at = NOW()
                WHERE id = %s
            """, (Json(nlp_analysis), confidence, artifact_id))
            return cur.rowcount > 0
    finally:
        conn.close()


def save_journal_analysis(journal_id: str, nlp_analysis: Dict[str, Any], confidence: float, analysis_method: str) -> bool:
    """Persist journal entry NLP metadata for future filtering and synthesis."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE journal_entries
                SET nlp_analysis = %s,
                    nlp_confidence = %s,
                    analyzed_at = NOW()
                WHERE id = %s
            """, (Json(nlp_analysis), confidence, journal_id))
            return cur.rowcount > 0
    finally:
        conn.close()


def insert_artifact_nlp_metadata(artifact_id: Optional[str], journal_id: Optional[str], insights: Dict[str, Any]) -> bool:
    """Insert a detailed NLP metadata record for analytics and confidence tracking."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO artifact_nlp_metadata (
                    artifact_id,
                    journal_id,
                    themes,
                    sentiment_score,
                    keywords,
                    confidence,
                    analysis_method
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                artifact_id,
                journal_id,
                insights.get("themes"),
                insights.get("sentiment_score"),
                insights.get("keywords"),
                insights.get("confidence"),
                insights.get("method")
            ))
            return True
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
