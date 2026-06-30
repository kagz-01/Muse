from dataclasses import dataclass
from functools import wraps
from importlib import import_module
from typing import Any, Callable, Dict, List, Optional
from urllib.parse import urlparse

ScraperFn = Callable[[str], Dict[str, Any]]


def _wrap_scraper(func_name: str, module_name: str, target_name: str):
    def _wrapper(url: str) -> Dict[str, Any]:
        module = import_module(f".{module_name}", package=__package__)
        target = getattr(module, target_name)
        return target(url)

    _wrapper.__name__ = func_name
    _wrapper.__qualname__ = func_name
    return _wrapper


_scrape_webpage = _wrap_scraper("scrape_webpage", "web_scraper", "scrape_webpage")
_scrape_youtube_transcript = _wrap_scraper("scrape_youtube_transcript", "youtube_scraper", "scrape_youtube_transcript")
_scrape_social_media = _wrap_scraper("scrape_social_media", "social_scraper", "scrape_social_media")
_scrape_tiktok_metadata = _wrap_scraper("scrape_tiktok_metadata", "tiktok_scraper", "scrape_tiktok_metadata")
_scrape_pinterest_metadata = _wrap_scraper("scrape_pinterest_metadata", "pinterest", "scrape_pinterest_metadata")
_scrape_generic_content = _wrap_scraper("scrape_generic_content", "generic_content_scraper", "scrape_generic_content")


@dataclass(frozen=True)
class ScraperDefinition:
    name: str
    domains: List[str]
    scraper: ScraperFn
    requires_browser: bool = False
    description: str = ""


SCRAPER_REGISTRY: List[ScraperDefinition] = [
    ScraperDefinition(
        name="youtube_transcript",
        domains=["youtube.com", "youtu.be"],
        scraper=_scrape_youtube_transcript,
        description="Use the YouTube transcript API for video transcripts.",
    ),
    ScraperDefinition(
        name="tiktok_video",
        domains=["tiktok.com"],
        scraper=_scrape_tiktok_metadata,
        requires_browser=True,
        description="Use Playwright to scrape TikTok video metadata and captions.",
    ),
    ScraperDefinition(
        name="pinterest_pin",
        domains=["pinterest.com"],
        scraper=_scrape_pinterest_metadata,
        description="Use Pinterest metadata extraction from hydrated page JSON.",
    ),
    ScraperDefinition(
        name="social_media",
        domains=[
            "twitter.com",
            "x.com",
            "reddit.com",
            "linkedin.com",
            "instagram.com",
            "threads.net",
            "facebook.com",
            "fb.com",
            "mastodon.social",
            "bsky.app",
            "medium.com",
            "substack.com",
            "tumblr.com",
            "vk.com",
        ],
        scraper=_scrape_social_media,
        requires_browser=True,
        description="Use browser-based scraping for JavaScript-heavy social media posts."
    ),
    ScraperDefinition(
        name="web_article",
        domains=["spotify.com", "soundcloud.com", "podcasts.apple.com", "podcastindex.org"],
        scraper=_scrape_generic_content,
        description="Use generic content scraping for media and article destinations."
    ),
]


def _normalize_url(url: str) -> str:
    return url.strip().lower() if url else ""


def _host_from_url(url: str) -> str:
    parsed = urlparse(url)
    return parsed.netloc.lower()


def register_scraper(definition: ScraperDefinition, prepend: bool = True) -> None:
    """Add a scraper definition to the registry so the engine can discover it."""
    if prepend:
        SCRAPER_REGISTRY.insert(0, definition)
    else:
        SCRAPER_REGISTRY.append(definition)


def get_scraper_for_url(url: str) -> ScraperFn:
    """Return the best scraper function for the provided URL."""
    normalized_url = _normalize_url(url)
    host = _host_from_url(normalized_url)

    for definition in SCRAPER_REGISTRY:
        for domain in definition.domains:
            if domain in normalized_url or domain in host:
                return definition.scraper

    return _scrape_generic_content


def list_supported_platforms() -> List[str]:
    return [definition.name for definition in SCRAPER_REGISTRY]


def scrape_url(url: str) -> Dict[str, Any]:
    scraper = get_scraper_for_url(url)
    return scraper(url)
