import { initRouter } from "./01rest/router.js";
// always keep this import to load environment variables before anything else
import { env } from "./env.js";
import { qdrantClient } from "./04infrastructure/qdrant.js";

async function checkQdrantReady() {
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch(env.QDRANT_HOST);
      if (response.ok) {
        console.log("✅ Qdrant is ready.");
        return;
      }
    } catch {
      console.log("⏳ Waiting for Qdrant...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("❌ Qdrant failed to start.");
}

async function ensureCollectionExists() {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some((c) => c.name === env.QDRANT_COLLECTION);
  
  if (!exists) {
    await qdrantClient.createCollection(env.QDRANT_COLLECTION, {
      vectors: { size: 768, distance: "Cosine" },
    });
    console.log(`✅ Collection '${env.QDRANT_COLLECTION}' created.`);
  } else {
    console.log(`✅ Collection '${env.QDRANT_COLLECTION}' already exists.`);
  }
}

async function bootstrap() {
  console.log("Environment variables loaded.", env);
  
  await checkQdrantReady();
  await ensureCollectionExists();
  
  await initRouter();
}

bootstrap().catch((err) => {
  console.error("❌ Bootstrap failed:", err);
  process.exit(1);
});
