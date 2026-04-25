# Search Engine API Server

This is a TypeScript + Express backend for full-text search and autocomplete, powered by Elasticsearch. It exposes `/api/search` and `/api/suggest` endpoints for querying indexed web pages.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (install with `npm i -g pnpm`)
- [Docker](https://www.docker.com/) (for running Elasticsearch)

---

## 1. Start Elasticsearch with Docker

This project expects a local Elasticsearch instance running on port 9200. The recommended way is via Docker Compose:

```bash
# From the project root
cp .env.example .env
# (edit .env if you want to change ES credentials or port)

# Start Elasticsearch
cd .. # go to project root if not already there
docker compose up -d elasticsearch
```

This will launch Elasticsearch 9.x in single-node mode, with credentials and settings from your `.env` file.

---

## 2. Install Server Dependencies

```bash
cd server
pnpm install
```

---

## 3. Configure Environment Variables

Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

- `PORT` — Port for the Express server (default: 3001)
- `ES_HOST` — Elasticsearch URL (default: http://localhost:9200)
- `ES_USERNAME` — Elasticsearch username (default: elastic)
- `ES_PASSWORD` — Elasticsearch password (default: changeme)
- `ES_INDEX` — Index name (default: pages)

---

## 4. Run the Server

```bash
pnpm run dev
```

The server will start on the port specified in `.env` (default: 3001).

---

## 5. Test the API Endpoints

You can test the endpoints using [Bruno](https://www.usebruno.com/) (recommended), curl, or any HTTP client.

### Using Bruno

- Open the `docs/bruno` collection in Bruno.
- Use the `Suggest.yml` and `Search.yml` requests to test `/api/suggest` and `/api/search` endpoints.
- Make sure to set the `q` query parameter (e.g., `q=open source`).

### Example curl requests

```bash
# Suggest endpoint (autocomplete)
curl "http://localhost:3001/api/suggest?q=open"

# Search endpoint (full-text search)
curl "http://localhost:3001/api/search?q=open+source&page=1"
```

---

## 6. Troubleshooting

- If you get connection errors, make sure Elasticsearch is running and matches your `.env` settings.
- The server will fail fast if required env vars are missing or invalid.
- Check the server logs for errors.

---

## Project Structure

- `src/env.ts` — Environment variable validation (fail-fast)
- `src/03repo/elastic.repo.ts` — Elasticsearch client and queries
- `src/02service/search.service.ts` — Business logic
- `src/01rest/search.router.ts` — Express routes
- `src/01rest/middleware/validate.ts` — Query validation middleware
- `src/01rest/middleware/errorHandler.ts` — Global error handler

---
