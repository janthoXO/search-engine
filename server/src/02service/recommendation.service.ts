import { env } from "@/env.js";
import { vectorRepository } from "@/03repo/vector.repo.js";
import { clusteringService } from "./clustering.service.js";
import { chatOllamaClient } from "@/04infrastructure/ollama.js";
import { z } from "zod";

export interface RecommendationResult {
  suggestions: string[];
  reason?: string;
  debug?: Record<string, unknown>;
}

class RecommendationService {
  public async recommend(sessionId: string): Promise<RecommendationResult> {
    const windowMs = env.WINDOW_MINUTES * 60 * 1000;

    // 1. Fetch windowed entries
    const windowedEntries = await vectorRepository.getWindowedEntries(
      sessionId,
      windowMs
    );

    // 2. Guard: fewer than 2 entries
    if (windowedEntries.length < 2) {
      return { suggestions: [], reason: "Not enough recent history" };
    }

    // 3. Cluster
    const clusterResult = clusteringService.extractTask(windowedEntries);

    // 4. Guard: null result
    if (!clusterResult) {
      return { suggestions: [], reason: "No clear task identified" };
    }

    // 5. Find related vectors
    const limit = 20;
    const relatedEntries = await vectorRepository.findRelated(
      sessionId,
      clusterResult.centroid,
      env.RELATED_THRESHOLD,
      limit
    );

    // 6. Chronological sort
    relatedEntries.sort((a, b) => a.timestamp - b.timestamp);

    // 7. Extract queries
    const orderedQueries = relatedEntries.map((e) => e.query);

    // 8. Generate suggestions
    const suggestions = await this.generateRecommendationQuery(orderedQueries);

    const result: RecommendationResult = { suggestions };
    if (env.DEBUG) {
      result.debug = {
        clusterSize: clusterResult.primaryCluster.length,
        relatedCount: relatedEntries.length,
        queriesSent: orderedQueries,
      };
    }

    return result;
  }

  public async generateRecommendationQuery(
    orderedQueries: string[]
  ): Promise<string[]> {
    if (orderedQueries.length === 0) {
      return [];
    }

    const messages = [
      {
        role: "system",
        content: `You are an expert research assistant. Analyze the user's recent search queries in chronological order to infer their research task. 
  Provide a JSON array containing 3 to 5 suggested next queries that would help advance their research. 
  ONLY return a valid JSON array of strings, nothing else. No markdown.`,
      },
      {
        role: "user",
        content: orderedQueries.map((q, idx) => `${idx + 1}. ${q}`).join("\n"),
      },
    ];

    try {
      const response = await chatOllamaClient
        .withStructuredOutput(z.array(z.string()))
        .invoke(messages);

      return response;
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
      return [];
    }
  }
}

export const recommendationService = new RecommendationService();
