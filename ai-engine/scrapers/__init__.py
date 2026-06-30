# Scrapers Module
from importlib import import_module

from .registry import (
    ScraperDefinition,
    SCRAPER_REGISTRY,
    get_scraper_for_url,
    list_supported_platforms,
    register_scraper,
    scrape_url,
)

__all__ = [
    "scrape_webpage",
    "scrape_youtube_transcript",
    "scrape_social_media",
    "parse_document",
    "scrape_tiktok_metadata",
    "scrape_pinterest_metadata",
    "scrape_generic_content",
    "get_scraper_for_url",
    "list_supported_platforms",
    "register_scraper",
    "scrape_url",
    "ScraperDefinition",
    "SCRAPER_REGISTRY",
]


def _lazy_import(name: str):
    module_name, attr_name = name.rsplit(".", 1)
    module = import_module(module_name, package=__package__)
    return getattr(module, attr_name)


def scrape_webpage(*args, **kwargs):
    return _lazy_import("scrapers.web_scraper.scrape_webpage")(*args, **kwargs)


def scrape_youtube_transcript(*args, **kwargs):
    return _lazy_import("scrapers.youtube_scraper.scrape_youtube_transcript")(*args, **kwargs)


def scrape_social_media(*args, **kwargs):
    return _lazy_import("scrapers.social_scraper.scrape_social_media")(*args, **kwargs)


def scrape_tiktok_metadata(*args, **kwargs):
    return _lazy_import("scrapers.tiktok_scraper.scrape_tiktok_metadata")(*args, **kwargs)


def scrape_pinterest_metadata(*args, **kwargs):
    return _lazy_import("scrapers.pinterest.scrape_pinterest_metadata")(*args, **kwargs)


def scrape_generic_content(*args, **kwargs):
    return _lazy_import("scrapers.generic_content_scraper.scrape_generic_content")(*args, **kwargs)


def parse_document(*args, **kwargs):
    return _lazy_import("scrapers.document_scraper.parse_document")(*args, **kwargs)
