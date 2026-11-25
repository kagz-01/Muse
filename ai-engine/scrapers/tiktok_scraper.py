import logging
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


def scrape_tiktok_metadata(url: str) -> Dict[str, Any]:
    """
    Extract lightweight metadata from a TikTok video using Playwright.
    Returns the same shape as the other AI engine scrapers for consistency.
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
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_selector("body", timeout=10000)

            title = page.title() or "TikTok Video"
            author = _safe_text(page, '[data-e2e="video-author-uniqueid"], a[href^="/@"]')
            caption = _safe_text(page, '[data-e2e="video-desc"]')
            music = _safe_text(page, '[data-e2e="video-music"], [class*="DivMusicInfoContainer"] p')
            hashtags = _extract_hashtags(page)
            ai_title = _safe_text(page, '[data-e2e="v2t-title"]')
            ai_summary = _safe_text(page, '[data-e2e="v2t-desc"]')

            browser.close()

            metadata = {
                "author": author or "Unknown Author",
                "caption": caption,
                "music": music,
                "hashtags": hashtags,
                "aiInsights": {
                    "title": ai_title,
                    "summaryText": ai_summary,
                },
            }

            return {
                "status": "success",
                "type": "tiktok_video",
                "title": title,
                "author": author or "Unknown Author",
                "content": caption or ai_summary or "",
                "url": url,
                "metadata": metadata,
            }

    except Exception as exc:
        logger.exception("TikTok scraping failed")
        return {
            "status": "error",
            "type": "tiktok_video",
            "message": str(exc),
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


def _safe_text(page, selector: str) -> Optional[str]:
    try:
        text = page.locator(selector).first.inner_text(timeout=3000)
        return text.strip() if text else None
    except Exception:
        return None


def _extract_hashtags(page) -> list[str]:
    try:
        return [tag.strip() for tag in page.locator('[data-e2e="video-desc"] a[href*="/tag/"]').all_inner_texts() if tag.strip()]
    except Exception:
        return []
