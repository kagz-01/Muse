# Scrapers Module
from .web_scraper import scrape_webpage
from .youtube_scraper import scrape_youtube_transcript
from .social_scraper import scrape_social_media

__all__ = ["scrape_webpage", "scrape_youtube_transcript", "scrape_social_media"]
