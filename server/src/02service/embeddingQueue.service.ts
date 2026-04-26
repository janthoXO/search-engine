import { env } from "@/env.js";
import { embeddingService } from "./embedding.service.js";
import { vectorRepository } from "@/03repo/vector.repo.js";

interface QueueItem {
  sessionId: string;
  query: string;
}

class EmbeddingQueue {
  private queue: QueueItem[] = [];
  private activeWorkers: number = 0;
  private maxWorkers: number = env.EMBEDDING_WORKERS;

  public enqueue(sessionId: string, query: string): void {
    this.queue.push({ sessionId, query });
    this.checkWorkers();
  }

  private checkWorkers() {
    while (this.activeWorkers < this.maxWorkers && this.queue.length > 0) {
      this.activeWorkers++;
      this.workerLoop().catch((err) => {
        console.error("Worker crashed:", err);
      });
    }
  }

  private async workerLoop() {
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift();
        if (!item) continue;

        try {
          const vector = await embeddingService.embed(item.query);
          console.debug(`embedded for session "${item.sessionId}" the query "${item.query}"`);
          await vectorRepository.upsert(item.sessionId, item.query, vector);
          console.debug(`upserted vector for session "${item.sessionId}" and query "${item.query}"`);
        } catch (error) {
          console.error(`Failed to process embedding for query "${item.query}":`, error);
        }
      }
    } finally {
      this.activeWorkers--;
      this.checkWorkers(); // check if more items arrived while finishing
    }
  }
}

export const embeddingQueue = new EmbeddingQueue();
