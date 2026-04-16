import os
import scrapy
from dotenv import load_dotenv

load_dotenv()


class GenericSpider(scrapy.Spider):
    name = "generic"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        raw_urls = os.getenv("START_URLS", "")
        raw_domains = os.getenv("ALLOWED_DOMAINS", "")

        if not raw_urls:
            raise ValueError("START_URLS environment variable is required")

        self.start_urls = [u.strip() for u in raw_urls.split(",") if u.strip()]
        self.allowed_domains = [d.strip() for d in raw_domains.split(",") if d.strip()]

    def parse(self, response):
        # Extract meaningful text: strip scripts, styles, nav, footer
        body_text = " ".join(
            response.css(
                "body *:not(script):not(style):not(nav):not(footer)::text"
            ).getall()
        ).strip()

        # Normalise whitespace
        body_text = " ".join(body_text.split())

        # Skip pages with no meaningful content
        if not body_text:
            return

        yield {
            "url": response.url,
            "title": response.css("title::text").get(default="").strip(),
            "body": body_text[:50_000],  # cap at 50k chars to avoid huge docs
            "crawled_at": scrapy.utils.misc.arg_to_iter(
                __import__("datetime").datetime.utcnow().isoformat()
            )[0],
        }

        # Follow internal links
        for href in response.css("a::attr(href)").getall():
            if href and href.startswith(("http://", "https://", "/")):
                yield response.follow(href, callback=self.parse)
