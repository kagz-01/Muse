import unittest
from unittest.mock import patch

from scrapers import get_scraper_for_url, list_supported_platforms, scrape_url, scrape_generic_content


class ScraperRoutingTests(unittest.TestCase):
    def test_routes_known_domains_to_expected_scrapers(self):
        self.assertEqual(get_scraper_for_url("https://www.youtube.com/watch?v=abc123").__name__, "scrape_youtube_transcript")
        self.assertEqual(get_scraper_for_url("https://x.com/user/status/1").__name__, "scrape_social_media")
        self.assertEqual(get_scraper_for_url("https://www.tiktok.com/@user/video/123").__name__, "scrape_tiktok_metadata")
        self.assertEqual(get_scraper_for_url("https://www.pinterest.com/pin/123/").__name__, "scrape_pinterest_metadata")
        self.assertEqual(get_scraper_for_url("https://www.threads.net/@user/post/123").__name__, "scrape_social_media")
        self.assertEqual(get_scraper_for_url("https://www.facebook.com/photo.php?fbid=123").__name__, "scrape_social_media")
        self.assertEqual(get_scraper_for_url("https://bsky.app/profile/example.bsky.social/post/123").__name__, "scrape_social_media")
        self.assertEqual(get_scraper_for_url("https://open.spotify.com/album/abc123").__name__, "scrape_generic_content")
        self.assertEqual(get_scraper_for_url("https://example.com/article").__name__, "scrape_generic_content")

    def test_scrape_url_uses_the_resolved_scraper(self):
        with patch("scrapers.registry._scrape_generic_content", return_value={"status": "success", "type": "generic_content"}) as mock_scrape:
            result = scrape_url("https://example.com/article")

        self.assertEqual(result["status"], "success")
        mock_scrape.assert_called_once_with("https://example.com/article")

    def test_list_supported_platforms_returns_registry_entries(self):
        supported = list_supported_platforms()
        self.assertIn("youtube_transcript", supported)
        self.assertIn("social_media", supported)
        self.assertIn("tiktok_video", supported)
        self.assertIn("pinterest_pin", supported)
        self.assertIn("web_article", supported)


class GenericContentScraperTests(unittest.TestCase):
    def test_routes_unknown_domain_to_generic_content(self):
        self.assertEqual(get_scraper_for_url("https://unknowndomain.example/path").__name__, "scrape_generic_content")

    @patch("scrapers.generic_content_scraper._fetch_html", return_value=None)
    @patch("scrapers.generic_content_scraper._fetch_html_browser", return_value=None)
    def test_scrape_generic_content_returns_error_when_page_unreachable(self, mock_browser, mock_fetch):
        result = scrape_url("https://missing.example/")

        self.assertEqual(result["status"], "error")
        self.assertIn("No HTML could be fetched", result["message"])

    @patch("scrapers.generic_content_scraper._fetch_html")
    def test_scrape_generic_content_returns_success_data(self, mock_fetch_html):
        html = (
            "<html><head><title>Test Page</title>"
            "<meta name=\"description\" content=\"A short description.\">"
            "</head><body><article><p>"
            + "Hello world content. " * 20 +
            "</p></article></body></html>"
        )
        mock_fetch_html.return_value = html

        result = scrape_generic_content("https://example.com/test")

        self.assertEqual(result["status"], "success")
        self.assertEqual(result["type"], "generic_content")
        self.assertEqual(result["title"], "Test Page")
        self.assertIn("Hello world content", result["content"])


if __name__ == "__main__":
    unittest.main()
