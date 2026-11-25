# AI Engine Scrapers Architecture

This document explains how the `ai-engine` scraper subsystem works, including crawler routing, scraper types, and the data shape returned to the rest of the system.

## Overview

The scraper layer is designed for flexible URL handling and fast content capture.
It uses a registry to map URLs to the right scraper, then normalizes scraped content into a common output shape.

## Architecture Blueprint

```text
Incoming URL
     ↓
Scraper Registry (ai-engine/scrapers/registry.py)
     ↓
Platform-specific scraper
     ├─ YouTube Transcript Scraper
     ├─ TikTok Metadata Scraper
     ├─ Pinterest Metadata Scraper
     ├─ Social Media Browser Scraper
     ├─ Generic Web Scraper
     └─ Document Parser
     ↓
Standardized Response Payload
     ↓
Pipeline / API / Storage
```

## Registry and Routing

### `ai-engine/scrapers/registry.py`

- Contains `SCRAPER_REGISTRY`, a list of `ScraperDefinition` entries.
- Each entry includes:
  - `name`
  - `domains`
  - `scraper`
  - `requires_browser`
  - `description`
- `get_scraper_for_url(url)` selects the first matching scraper by domain.
- If no domain matches, it falls back to `scrape_generic_content`.

### Scraper discovery order

1. YouTube Transcript
2. TikTok
3. Pinterest
4. Social Media
5. Generic Content

This means domain-specific scrapers are prioritized before generic parsing.

## Scraper Types

### 1. YouTube Transcript Scraper (`youtube_scraper.py`)

- Extracts a video ID from the URL.
- Uses `youtube_transcript_api` to fetch captions.
- Converts transcript segments into clean text.
- Returns:
  - `type`: `youtube_transcript`
  - `title`, `author`, `content`, `url`, `metadata`

### 2. TikTok Metadata Scraper (`tiktok_scraper.py`)

- Uses Playwright to render a TikTok page.
- Extracts:
  - video title
  - author info
  - caption text
  - hashtags
  - optional AI summary text
- Returns:
  - `type`: `tiktok_video`
  - `content`: caption or summary text
  - `metadata`: author, hashtags, aiInsights

### 3. Pinterest Metadata Scraper (`pinterest.py`)

- Fetches the page HTML using `httpx`.
- Extracts the `__PWS_DATA__` hydration JSON payload.
- Parses nested Pinterest state into standard metadata fields.
- Returns:
  - `status` / `error`
  - `title`, `description`, `author`, `url`, `metadata`

### 4. Social Media Scraper (`social_scraper.py`)

- Uses Playwright to load JS-heavy social pages.
- Detects platform by hostname and chooses selectors.
- Extracts:
  - `title`
  - `author`
  - primary text content
  - metadata: `platform`, `content_length`
- Works for many social platforms like X, Reddit, LinkedIn, Threads, Instagram, etc.

### 5. Generic Web Scraper (`web_scraper.py`)

- Fetches HTML with `requests` and retries.
- First tries `trafilatura` to extract full article content.
- If that fails, falls back to BeautifulSoup cleanup.
- Returns:
  - `type`: `web_article`
  - `title`, `author`, `content`, `metadata`

### 6. Document Parser (`document_scraper.py`)

- Handles uploaded documents such as PDF, DOCX, XLSX, TXT.
- Converts files into text using the `unstructured` parser.
- Standardizes output for later NLP and synthesis.

## Common Output Shape

All scraper responses normalize to a consistent contract used by the AI engine:

```json
{
  "status": "success",
  "type": "<scraper-type>",
  "title": "...",
  "author": "...",
  "content": "...",
  "url": "...",
  "metadata": {
    "source": "...",
    "content_length": 1234,
    // optional platform-specific fields
  }
}
```

Errors use the same structure with `status: error`.

## Flow into the AI Engine

### `/api/scrape` endpoint

- Receives a URL from the frontend.
- Calls `scrape_url(url)` from `ai-engine/main.py`.
- `scrape_url()` uses `get_scraper_for_url(url)`.
- The selected scraper returns normalized content.
- The endpoint returns the clean payload.

### `/api/upload-document` endpoint

- Receives a file upload.
- Uses `parse_document(file_bytes, filename)`.
- Document parser returns `content` and metadata.
- The result is immediately available for analysis or storage.

## Why this design matters

- **Extensible**: Add new scrapers by registering them in `SCRAPER_REGISTRY`.
- **Robust**: Browser-capable scrapers handle JS-first sites, while generic scrapers cover standard web pages.
- **Consistent**: Normalized payloads let the NLP/pipeline layer treat all content uniformly.
- **Fast routing**: Domain-based resolution avoids expensive generic scraping for platforms with specialized paths.

## Notes for future improvements

- Add explicit retry/backoff for `playwright` scrapers.
- Support headless browser caching for high-volume social scraping.
- Add a `preview` endpoint for quick metadata-only responses.
