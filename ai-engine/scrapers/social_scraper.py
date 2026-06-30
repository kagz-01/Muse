import logging
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

SOCIAL_PLATFORM_HINTS = {
    "twitter.com": "x",
    "x.com": "x",
    "reddit.com": "reddit",
    "linkedin.com": "linkedin",
    "instagram.com": "instagram",
    "threads.net": "threads",
    "facebook.com": "facebook",
    "fb.com": "facebook",
    "mastodon.social": "mastodon",
    "bsky.app": "bluesky",
    "medium.com": "medium",
    "substack.com": "substack",
    "tumblr.com": "tumblr",
    "vk.com": "vk",
}


def scrape_social_media(url: str) -> Dict[str, Any]:
    """
    Uses headless Chromium via Playwright to scrape JavaScript-heavy social sites
    from public URLs, preferring the main content block for each platform.
    """
    browser = None
    context = None
    try:
        from playwright.sync_api import sync_playwright

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"],
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1440, "height": 1600},
                locale="en-US",
            )
            page = context.new_page()

            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            page.wait_for_timeout(2000)
            page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            page.wait_for_timeout(1000)

            platform = _detect_platform(url)
            title = _extract_title(page)
            author = _extract_author(page)
            content = _extract_primary_text(page, platform)
            browser.close()

            clean_text = re.sub(r"\n{3,}", "\n\n", content or "").strip()
            return {
                "status": "success",
                "type": "social_media",
                "title": title or "Social Content",
                "author": author or "Extracted via Browser",
                "content": clean_text[:20000],
                "url": url,
                "metadata": {
                    "source": "playwright",
                    "platform": platform,
                    "content_length": len(clean_text),
                },
            }

    except Exception as exc:
        logger.exception("Social scraper failed for %s", url)
        return {
            "status": "error",
            "type": "social_media",
            "message": f"Headless browser extraction failed: {exc}",
            "url": url,
        }
    finally:
        if context:
            try:
                context.close()
            except Exception:
                pass
        if browser:
            try:
                browser.close()
            except Exception:
                pass


def _detect_platform(url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    for domain, platform in SOCIAL_PLATFORM_HINTS.items():
        if domain in host:
            return platform
    return "generic"


def _extract_title(page) -> Optional[str]:
    for selector in [
        "meta[property='og:title']",
        "meta[name='twitter:title']",
        "meta[name='title']",
    ]:
        try:
            value = page.locator(selector).first.get_attribute("content")
            if value:
                return value.strip()
        except Exception:
            continue
    try:
        return page.title().strip() or None
    except Exception:
        return None


def _extract_author(page) -> Optional[str]:
    for selector in [
        "meta[property='article:author']",
        "meta[name='author']",
        "meta[property='og:site_name']",
    ]:
        try:
            value = page.locator(selector).first.get_attribute("content")
            if value:
                return value.strip()
        except Exception:
            continue
    return None


def _extract_primary_text(page, platform: str) -> str:
    selectors: List[str] = []

    if platform == "x":
        selectors.extend([
            '[data-testid="tweetText"]',
            '[data-testid="postText"]',
            'article',
            'main',
        ])
    elif platform == "reddit":
        selectors.extend([
            '[data-testid="post-content"]',
            'shreddit-post',
            'article',
            'main',
        ])
    elif platform == "linkedin":
        selectors.extend([
            '.feed-shared-update-v2',
            '.break-words',
            'article',
            'main',
        ])
    elif platform in {"instagram", "threads"}:
        selectors.extend([
            'article',
            'main',
            'meta[name="description"]',
        ])
    else:
        selectors.extend([
            'article',
            'main',
            '[data-testid*="content"]',
            'meta[name="description"]',
        ])

    for selector in selectors:
        try:
            if selector.startswith("meta"):
                value = page.locator(selector).first.get_attribute("content")
                if value and len(value) > 80:
                    return value
                continue

            texts = page.locator(selector).all_inner_texts()
            for text in texts:
                cleaned = _cleanup_text(text)
                if len(cleaned) > 120:
                    return cleaned
        except Exception:
            continue

    try:
        body_text = page.locator("body").inner_text()
        return _cleanup_text(body_text)
    except Exception:
        return ""


def _cleanup_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()
