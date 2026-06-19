import trafilatura
from bs4 import BeautifulSoup
import requests

def scrape_webpage(url: str) -> dict:
    """
    Downloads and extracts clean text from a given webpage URL.
    Uses trafilatura for primary extraction (strips ads, navbars),
    falls back to basic BeautifulSoup if trafilatura fails.
    """
    try:
        # Download the HTML
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            # Fallback to requests if trafilatura fetch fails (sometimes blocks default UA)
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            response = requests.get(url, headers=headers, timeout=10)
            downloaded = response.text

        # Extract clean text and metadata
        result = trafilatura.extract(
            downloaded, 
            include_comments=False,
            include_tables=False,
            include_links=False,
            output_format="json"
        )

        if result:
            import json
            data = json.loads(result)
            return {
                "status": "success",
                "type": "web_article",
                "title": data.get("title", "Unknown Title"),
                "author": data.get("author", "Unknown Author"),
                "content": data.get("text", ""),
                "url": url
            }
        
        # Absolute fallback: BeautifulSoup text extraction
        soup = BeautifulSoup(downloaded, "html.parser")
        
        # Kill javascript and style blocks
        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()

        text = soup.get_text(separator="\n")
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return {
            "status": "success",
            "type": "web_article",
            "title": soup.title.string if soup.title else "Unknown Title",
            "author": "Unknown",
            "content": text[:50000], # Cap length to avoid massive junk
            "url": url
        }

    except Exception as e:
        return {
            "status": "error",
            "type": "web_article",
            "message": str(e),
            "url": url
        }
