import { OllamaEmbeddings } from "@langchain/ollama";
import { env } from "@/env.js";

class EmbeddingService {
  private embeddings = new OllamaEmbeddings({
    baseUrl: env.OLLAMA_HOST,
    model: env.OLLAMA_EMBED_MODEL,
  });

  public async embed(text: string): Promise<number[]> {
    const vector = await this.embeddings.embedQuery(text);

    // L2 Normalize
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map((v) => v / norm);
  }
}

export const embeddingService = new EmbeddingService();
