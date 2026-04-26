import { Ollama, ChatOllama } from "@langchain/ollama";
import { env } from "@/env.js";

export const ollamaClient = new Ollama({
  baseUrl: env.OLLAMA_HOST,
  model: env.OLLAMA_EMBED_MODEL,
});

export const chatOllamaClient = new ChatOllama({
  baseUrl: env.OLLAMA_HOST,
  model: env.OLLAMA_CHAT_MODEL,
  format: "json",
});
