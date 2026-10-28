import { qdrant, COLLECTION, userFilter } from "../config/qdrant.js";
import { env } from "../config/env.js";
import { embedQuery } from "../utils/embeddings.js";

const toDoc = (point) => ({
  pageContent: point.payload.text,
  metadata: {
    type: "vector",
    file: point.payload.docName,
    page: point.payload.page,
    chunkId: String(point.id),
    score: point.score,
  },
});

export async function vectorSearch(userId, query, k = env.RAG_TOP_K) {
  const vector = await embedQuery(query);
  const { points } = await qdrant.query(COLLECTION, {
    query: vector,
    limit: k,
    filter: userFilter(userId, "chunk"),
    score_threshold: env.RAG_MIN_SCORE,
    with_payload: true,
    with_vector: false,
  });
  return points.map(toDoc);
}
