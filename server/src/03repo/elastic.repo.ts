import { Client } from "@elastic/elasticsearch";
import { env } from "../env.js";

export const es = new Client({
  node: env.ES_HOST,
  auth: {
    username: env.ES_USERNAME,
    password: env.ES_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export interface PageSource {
  url: string;
  title: string;
  crawled_at: string;
}

export class SearchRepo {
  async suggest(q: string) {
    return await es.search({
      index: env.ES_INDEX,
      size: 5,
      _source: ["title", "url"],
      query: {
        match_phrase_prefix: {
          title: {
            query: q,
            max_expansions: 20,
          },
        },
      },
    });
  }

  async search(q: string, from: number, size: number) {
    return await es.search<PageSource>({
      index: env.ES_INDEX,
      from,
      size,
      query: {
        multi_match: {
          query: q,
          fields: ["title^3", "body"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      },
      highlight: {
        fields: {
          body: {
            fragment_size: 200,
            number_of_fragments: 1,
            pre_tags: ["<mark>"],
            post_tags: ["</mark>"],
          },
        },
        require_field_match: false,
      },
      _source: ["url", "title", "crawled_at"],
    });
  }
}

export const searchRepo = new SearchRepo();
