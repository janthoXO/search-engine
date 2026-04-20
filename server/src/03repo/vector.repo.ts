import { env } from "@/env.js";
import { qdrantClient } from "@/04infrastructure/qdrant.js";
import crypto from "crypto";

export interface VectorEntry {
  query: string;
  vector: number[];
  timestamp: number;
}

class VectorRepository {
  private collectionName = env.QDRANT_COLLECTION;

  public async upsert(sessionId: string, query: string, vector: number[]): Promise<void> {
    const id = crypto
      .createHash("sha256")
      .update(`${sessionId}:${query}`)
      .digest("hex");

    // UUID format is required for Qdrant unless using integers
    const uuidId = [
      id.slice(0, 8),
      id.slice(8, 12),
      id.slice(12, 16),
      id.slice(16, 20),
      id.slice(20, 32),
    ].join("-");

    const timestamp = Date.now();

    await qdrantClient.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: uuidId,
          vector,
          payload: {
            sessionId,
            query,
            timestamp,
          },
        },
      ],
    });
  }

  public async getWindowedEntries(sessionId: string, windowMs: number): Promise<VectorEntry[]> {
    const thresholdDate = Date.now() - windowMs;

    // Use scroll to get all points satisfying filter
    const response = await qdrantClient.scroll(this.collectionName, {
      filter: {
        must: [
          {
            key: "sessionId",
            match: { value: sessionId },
          },
          {
            key: "timestamp",
            range: { gte: thresholdDate },
          },
        ],
      },
      limit: 1000,
      with_payload: true,
      with_vector: true,
    });

    const entries = response.points.map((p) => ({
      query: p.payload?.query as string,
      vector: p.vector as number[],
      timestamp: p.payload?.timestamp as number,
    }));

    return entries.sort((a, b) => a.timestamp - b.timestamp);
  }

  public async findRelated(
    sessionId: string,
    centroid: number[],
    threshold: number,
    limit: number = 20
  ): Promise<VectorEntry[]> {
    const response = await qdrantClient.search(this.collectionName, {
      vector: centroid,
      filter: {
        must: [
          {
            key: "sessionId",
            match: { value: sessionId },
          },
        ],
      },
      score_threshold: threshold,
      limit,
      with_payload: true,
      with_vector: true,
    });

    return response.map((p) => ({
      query: p.payload?.query as string,
      vector: p.vector as number[],
      timestamp: p.payload?.timestamp as number,
    }));
  }
}

export const vectorRepository = new VectorRepository();
