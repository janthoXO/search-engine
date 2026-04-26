import { DBSCAN } from "density-clustering";
import { env } from "@/env.js";
import type { VectorEntry } from "@/03repo/vector.repo.js";

// Cosine distance = 1 - cosine similarity
const cosineDistance = (p: number[], q: number[]) => {
  if (!p || !q) return 1;
  let dotProduct = 0;
  let normP = 0;
  let normQ = 0;
  const len = Math.min(p.length, q.length);
  for (let i = 0; i < len; i++) {
    dotProduct += p[i]! * q[i]!;
    normP += p[i]! * p[i]!;
    normQ += q[i]! * q[i]!;
  }
  const similarity = dotProduct / (Math.sqrt(normP) * Math.sqrt(normQ));
  return 1 - similarity;
};

class ClusteringService {
  public extractTask(entries: VectorEntry[]): { primaryCluster: VectorEntry[]; centroid: number[] } | null {
    if (entries.length < env.CLUSTER_MIN_POINTS) {
      return null;
    }

    const vectors = entries.map((en) => en.vector).filter((v) => v !== undefined) as number[][];
    if (vectors.length < env.CLUSTER_MIN_POINTS) {
      return null;
    }
    
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(vectors, env.CLUSTER_EPSILON, env.CLUSTER_MIN_POINTS, cosineDistance);

    if (!clusters || clusters.length === 0) {
      return null;
    }

    // Find largest cluster
    const largestClusterIndices = clusters.reduce((prev, current) =>
      prev.length > current.length ? prev : current
    );

    const primaryCluster = largestClusterIndices.map((i) => entries[i]!).filter((e) => e !== undefined) as VectorEntry[];
    const dimensions = vectors[0]?.length ?? 0;
    if (dimensions === 0) return null;
    let centroid = Array(dimensions).fill(0);

    for (const vector of largestClusterIndices.map((i) => vectors[i])) {
      if (!vector) continue;
      for (let j = 0; j < dimensions; j++) {
        centroid[j] += vector[j] ?? 0;
      }
    }

    // Element-wise mean
    centroid = centroid.map((val) => val / largestClusterIndices.length);

    // L2 normalize
    const norm = Math.sqrt(centroid.reduce((sum, v) => sum + v * v, 0));
    centroid = centroid.map((v) => v / norm);

    return { primaryCluster, centroid };
  }
}

export const clusteringService = new ClusteringService();
