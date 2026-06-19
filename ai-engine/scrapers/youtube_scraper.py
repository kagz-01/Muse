from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
import re

def extract_video_id(url: str) -> str:
    """Extracts the YouTube video ID from a URL."""
    # Matches ?v=, &v=, or youtu.be/
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, url)
    if match:
        return match.group(1)
    return None

def scrape_youtube_transcript(url: str) -> dict:
    """
    Extracts the closed-captions/transcript from a YouTube video.
    """
    try:
        video_id = extract_video_id(url)
        if not video_id:
            return {
                "status": "error",
                "message": "Could not extract valid YouTube video ID.",
                "url": url
            }

        # Fetch transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        
        # Format into pure text block
        formatter = TextFormatter()
        text_formatted = formatter.format_transcript(transcript)

        # Basic cleanup: remove massive repeated newlines
        clean_text = re.sub(r'\n+', ' ', text_formatted)

        return {
            "status": "success",
            "type": "youtube_transcript",
            "title": f"YouTube Video ({video_id})", # YouTube Data API needed for real title, skipping for now to save quota
            "author": "Unknown Channel",
            "content": clean_text,
            "url": url
        }

    except Exception as e:
        return {
            "status": "error",
            "type": "youtube_transcript",
            "message": str(e),
            "url": url
        }
