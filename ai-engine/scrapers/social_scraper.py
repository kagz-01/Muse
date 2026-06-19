from playwright.sync_api import sync_playwright

def scrape_social_media(url: str) -> dict:
    """
    Uses Headless Chromium via Playwright to scrape heavy JavaScript 
    sites like Twitter, Reddit, or LinkedIn.
    """
    try:
        with sync_playwright() as p:
            # Launch headless browser
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            # Go to the URL and wait for the page to be completely idle (JS loaded)
            page.goto(url, wait_until="networkidle", timeout=15000)

            # Extract the raw text from the body element.
            # On Twitter/Reddit, this usually grabs the entire thread visible on screen.
            raw_text = page.locator("body").inner_text()
            title = page.title()

            browser.close()

            # Clean up excessive newlines
            import re
            clean_text = re.sub(r'\n{3,}', '\n\n', raw_text).strip()

            return {
                "status": "success",
                "type": "social_media",
                "title": title,
                "author": "Extracted via Browser",
                "content": clean_text[:20000], # Cap length
                "url": url
            }

    except Exception as e:
        return {
            "status": "error",
            "type": "social_media",
            "message": f"Headless Browser Extraction Failed: {str(e)}",
            "url": url
        }
