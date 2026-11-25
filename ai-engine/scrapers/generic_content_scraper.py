import json
import logging
import re
from typing import Any, Dict, Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

MEDIA_HINTS = {
    "spotify.com": "media",
    "soundcloud.com": "media",
    "podcasts.apple.com": "media",
    "podcastindex.org": "media",
    "youtube.com": "video",
    "youtu.be": "video",
    "amazon.com": "commerce",
    "shopify.com": "commerce",
}

BROWSER_FALLBACK_DOMAINS = {
    "spotify.com",
    "soundcloud.com",
    "podcasts.apple.com",
    "podcastindex.org",
    "tiktok.com",
    "instagram.com",
    "x.com",
    "twitter.com",
}


def scrape_generic_content(url: str) -> Dict[str, Any]:
    """
    Production-ready generic scraper for public web pages, apps, and media destinations.

    It is intentionally broad: it works for any public page by extracting meta tags,
    article blocks, JSON-LD, or falling back to an article extractor when needed.
    """
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        platform = _detect_platform(host)

        from bs4 import BeautifulSoup

        html = _fetch_html(url)
        if not html and _should_attempt_browser_fallback(host):
            html = _fetch_html_browser(url)

        if not html:
            return {
                "status": "error",
                "type": "generic_content",
                "message": "No HTML could be fetched for the provided URL.",
                "url": url,
            }

        soup = BeautifulSoup(html, "html.parser")
        title = _extract_meta_value(soup, ["og:title", "twitter:title", "title"])
        author = _extract_meta_value(soup, ["article:author", "author", "og:site_name"])
        description = _extract_meta_value(soup, ["og:description", "twitter:description", "description"])
        content = _extract_content_text(soup, platform)

        structured = _extract_jsonld_content(soup)
        if not content:
            content = structured.get("articleBody") or structured.get("description") or structured.get("text") or ""

        if not content and description:
            content = description

        cleaned_content = _cleanup_text(content)

        if len(cleaned_content) < 150:
            from .web_scraper import scrape_webpage

            fallback = scrape_webpage(url)
            if fallback.get("status") == "success" and fallback.get("content"):
                fallback_metadata = fallback.get("metadata", {})
                fallback_metadata["source"] = f"{fallback_metadata.get('source', 'web_scraper')}_fallback"
                fallback_metadata["platform"] = platform
                fallback["metadata"] = fallback_metadata
                return fallback

        if not cleaned_content and not title:
            return {
                "status": "error",
                "type": "generic_content",
                "message": "The target page did not expose usable public content.",
                "url": url,
            }

        return {
            "status": "success",
            "type": "generic_content",
            "title": title or structured.get("headline") or "Untitled Content",
            "author": author or structured.get("author") or "Unknown Author",
            "content": cleaned_content[:20000],
            "url": url,
            "metadata": {
                "source": "generic_content",
                "platform": platform,
                "content_length": len(cleaned_content),
            },
        }
    except Exception as exc:
        logger.exception("Generic content scraper failed for %s", url)
        return {
            "status": "error",
            "type": "generic_content",
            "message": f"Generic extraction failed: {exc}",
            "url": url,
        }


def _fetch_html(url: str) -> Optional[str]:
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"],
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    try:
        response = session.get(url, headers=DEFAULT_HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.RequestException:
        return None


def _fetch_html_browser(url: str) -> Optional[str]:
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = browser.new_context(
                user_agent=DEFAULT_HEADERS["User-Agent"],
                viewport={"width": 1440, "height": 1600},
                locale="en-US",
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(1500)
            html = page.content()
            browser.close()
            return html
    except Exception:
        return None


def _should_attempt_browser_fallback(host: str) -> bool:
    return any(domain in host for domain in BROWSER_FALLBACK_DOMAINS)


def _detect_platform(host: str) -> str:
    for domain, platform in MEDIA_HINTS.items():
        if domain in host:
            return platform
    return "web"


def _extract_meta_value(soup: Any, names: list[str]) -> Optional[str]:
    for name in names:
        if name == "title":
            if soup.title and soup.title.string:
                return soup.title.string.strip()
            continue

        tag = soup.select_one(f"meta[property='{name}']") or soup.select_one(f"meta[name='{name}']")
        content_value = tag.get("content") if tag else None
        if isinstance(content_value, str) and content_value.strip():
            return content_value.strip()
    return None


def _extract_jsonld_content(soup: Any) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            payload = json.loads(script.string or "{}")
            if isinstance(payload, dict):
                result.update(payload)
            elif isinstance(payload, list):
                for item in payload:
                    if isinstance(item, dict):
                        result.update(item)
        except Exception:
            continue
    return result


def _extract_content_text(soup: Any, platform: str) -> str:
    selectors = [
        "article",
        "main",
        "section",
        "[data-testid*='content']",
        "[class*='content']",
        "[class*='article']",
        "[class*='post']",
        "[class*='entry']",
    ]

    for selector in selectors:
        try:
            elements = soup.select(selector)
            for element in elements:
                text = _cleanup_text(element.get_text("\n", strip=True))
                if len(text) > 120:
                    return text
        except Exception:
            continue

    if platform in {"media", "video"}:
        try:
            return _cleanup_text(soup.get_text("\n", strip=True))
        except Exception:
            return ""

    try:
        return _cleanup_text(soup.get_text("\n", strip=True))
    except Exception:
        return ""


def _cleanup_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
