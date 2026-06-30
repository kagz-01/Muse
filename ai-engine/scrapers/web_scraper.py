import json
import logging
import re
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
REQUEST_TIMEOUT_SECONDS = 15
MAX_CONTENT_LENGTH = 50000


def scrape_webpage(url: str) -> Dict[str, Any]:
    """
    Downloads and extracts clean text from a given webpage URL.
    Uses trafilatura first, then falls back to BeautifulSoup with retries and
    explicit headers so it is more reliable in production environments.
    """
    try:
        import trafilatura
        from bs4 import BeautifulSoup
        from requests.exceptions import RequestException

        downloaded = _fetch_html(url)
        if not downloaded:
            return {
                "status": "error",
                "type": "web_article",
                "message": "No content could be fetched for the provided URL.",
                "url": url,
            }

        result = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=False,
            include_links=False,
            output_format="json",
        )

        if result:
            data = json.loads(result)
            content = (data.get("text") or "").strip()
            return {
                "status": "success",
                "type": "web_article",
                "title": data.get("title") or "Unknown Title",
                "author": data.get("author") or "Unknown Author",
                "content": content[:MAX_CONTENT_LENGTH],
                "url": url,
                "metadata": {
                    "source": "trafilatura",
                    "content_length": len(content),
                },
            }

        soup = BeautifulSoup(downloaded, "html.parser")
        for tag in soup(["script", "style", "nav", "header", "footer", "aside"]):
            tag.decompose()

        text = soup.get_text(separator="\n")
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = "\n".join(chunk for chunk in chunks if chunk)

        return {
            "status": "success",
            "type": "web_article",
            "title": soup.title.string if soup.title and soup.title.string else "Unknown Title",
            "author": "Unknown",
            "content": text[:MAX_CONTENT_LENGTH],
            "url": url,
            "metadata": {
                "source": "beautifulsoup",
                "content_length": len(text),
            },
        }

    except RequestException as exc:
        logger.warning("Web scrape request failed for %s: %s", url, exc)
        return {
            "status": "error",
            "type": "web_article",
            "message": f"Request failed: {exc}",
            "url": url,
        }
    except Exception as exc:
        logger.exception("Web scrape failed for %s", url)
        return {
            "status": "error",
            "type": "web_article",
            "message": str(exc),
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

    response = session.get(url, headers=DEFAULT_HEADERS, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.text
