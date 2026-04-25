# Web IR Search Engine

This repository contains a modular web search engine stack:

- **webscraper/** — Python Scrapy-based web crawler, pushes data to Elasticsearch
- **server/** — TypeScript + Express API server, exposes search and suggest endpoints
- **webclient/** — React + Vite frontend (optional)

---

## Quick Start

1. **[webscraper/README.md](webscraper/README.md)** — Crawl and index web pages into Elasticsearch
2. **[server/README.md](server/README.md)** — Run the Express API server for search/suggest
3. **[webclient/README.md](webclient/README.md)** — (Optional) Run the React frontend

---

## Architecture

- **Elasticsearch** (via Docker Compose) stores crawled pages
- **Scrapy** (webscraper) extracts and indexes content
- **Express API** (server) provides `/api/search` and `/api/suggest`
- **React** (webclient) consumes the API for UI

---

See each subproject's README for setup and usage details.