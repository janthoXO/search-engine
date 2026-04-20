import dotenv from "dotenv";
import z from "zod";

dotenv.config();

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(8080),
  DEBUG: z.coerce.boolean().default(false),
  ES_HOST: z.url().default("http://localhost:9200"),
  ES_USERNAME: z.string().default("elastic"),
  ES_PASSWORD: z.string().default("changeme"),
  ES_INDEX: z.string().default("pages"),
  
  QDRANT_HOST: z.url().default("http://localhost:6333"),
  QDRANT_COLLECTION: z.string().default("search_queries"),

  OLLAMA_HOST: z.url().default("http://localhost:11434"),
  OLLAMA_EMBED_MODEL: z.string().default("nomic-embed-text"),
  OLLAMA_CHAT_MODEL: z.string().default("llama3.1"),

  EMBEDDING_WORKERS: z.coerce.number().default(3),

  CLUSTER_EPSILON: z.coerce.number().default(0.25),
  CLUSTER_MIN_POINTS: z.coerce.number().default(2),
  RELATED_THRESHOLD: z.coerce.number().default(0.75),
  WINDOW_MINUTES: z.coerce.number().default(26),
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error, null, 2)
  );
  process.exit(1);
}
export const env = parsed.data;
