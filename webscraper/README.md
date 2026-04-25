# Webscraper (Scrapy Crawler)

This directory contains the Scrapy-based web crawler for the search engine project. It crawls web pages and indexes them into Elasticsearch.

---

## 1. Setup

1. **Create and activate a Python virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your values (Elasticsearch host, credentials, etc).

---

## 2. Running the Crawler

To start crawling and indexing pages:

```bash
scrapy crawl generic -s JOBDIR=crawls/generic-1
```

- The `JOBDIR` option allows the crawl to be paused/resumed.
- Crawled data is sent directly to Elasticsearch as configured in your `.env`.

---

## 3. Output

- Indexed pages will appear in your Elasticsearch instance (see `ES_INDEX` in your `.env`).
- Logs and crawl state are stored in the `crawls/` directory.

---

## More

- See `searchcrawler/pipelines.py` for how items are processed and indexed.
- See `searchcrawler/spiders/generic_spider.py` for crawl logic.