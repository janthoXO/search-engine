import { searchRepo } from "../03repo/elastic.repo.js";

export class SearchService {
  async getSuggestions(q: string) {
    const result = await searchRepo.suggest(q);

    const suggestions = result.hits.hits.map((hit) => ({
      title: (hit._source as { title: string; url: string }).title,
      url: (hit._source as { title: string; url: string }).url,
    }));

    return { suggestions };
  }

  async doSearch(q: string, page: number) {
    const size = 10;
    const from = (page - 1) * size;
    const result = await searchRepo.search(q, from, size);

    const total =
      typeof result.hits.total === "number"
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    const hits = result.hits.hits.map((hit) => ({
      url: hit._source!.url,
      title: hit._source!.title,
      snippet: hit.highlight?.body?.[0] ?? null,
      crawled_at: hit._source!.crawled_at,
      score: hit._score,
    }));

    return {
      total,
      page,
      pages: Math.ceil(total / size),
      hits,
    };
  }
}

export const searchService = new SearchService();
