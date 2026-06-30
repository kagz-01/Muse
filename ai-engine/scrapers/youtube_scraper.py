import logging
import re
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def extract_video_id(url: str) -> Optional[str]:
    """Extracts the YouTube video ID from a URL."""
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    return match.group(1) if match else None


def scrape_youtube_transcript(url: str) -> Dict[str, Any]:
    """
    Extracts the closed-captions/transcript from a YouTube video and returns
    a production-friendly payload with metadata.
    """
    try:
        video_id = extract_video_id(url)
        if not video_id:
            return {
                "status": "error",
                "type": "youtube_transcript",
                "message": "Could not extract a valid YouTube video ID.",
                "url": url,
            }

        from youtube_transcript_api import YouTubeTranscriptApi
        from youtube_transcript_api.formatters import TextFormatter

        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "en-US"])
        formatter = TextFormatter()
        text_formatted = formatter.format_transcript(transcript)
        clean_text = re.sub(r"\n+", " ", text_formatted).strip()

        return {
            "status": "success",
            "type": "youtube_transcript",
            "title": f"YouTube Video ({video_id})",
            "author": "Unknown Channel",
            "content": clean_text,
            "url": url,
            "metadata": {
                "video_id": video_id,
                "source": "youtube_transcript_api",
                "content_length": len(clean_text),
            },
        }

    except Exception as exc:
        logger.exception("YouTube scraper failed for %s", url)
        return {
            "status": "error",
            "type": "youtube_transcript",
            "message": str(exc),
            "url": url,
        }
