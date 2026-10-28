import { QdrantClient } from "@qdrant/js-client-rest";
import { env } from "./env.js";

export const qdrant = new QdrantClient({ url: env.QDRANT_URL, apiKey: env.QDRANT_API_KEY });
export const COLLECTION = env.QDRANT_COLLECTION_NAME;

export async function ensureQdrantCollection() {
  const { collections } = await qdrant.getCollections();
  const exists = collections.some((collection) => collection.name === COLLECTION);
  let details;
  if (!exists) {
    await qdrant.createCollection(COLLECTION, {
      vectors: { size: env.GEMINI_EMBEDDING_DIM, distance: "Cosine" },
    });
  }

  details = await qdrant.getCollection(COLLECTION);
  const vectors = details.config.params.vectors;
  if (typeof vectors?.size !== "number" || vectors.size !== env.GEMINI_EMBEDDING_DIM) {
    throw new Error(
      `Qdrant collection "${COLLECTION}" must use an unnamed ${env.GEMINI_EMBEDDING_DIM}-dimension vector`
    );
  }

  const indexedFields = new Set(Object.keys(details.payload_schema || {}));
  for (const field of ["userId", "recordType", "docId", "status", "graphEntities"]) {
    if (!indexedFields.has(field)) {
      await qdrant.createPayloadIndex(COLLECTION, {
        field_name: field,
        field_schema: "keyword",
        wait: true,
      });
    }
  }
}

export const userFilter = (userId, recordType) => ({
  must: [
    { key: "userId", match: { value: userId } },
    ...(recordType ? [{ key: "recordType", match: { value: recordType } }] : []),
  ],
});

export async function scrollPoints(filter, limit = 1000, offset) {
  return qdrant.scroll(COLLECTION, {
    filter,
    limit,
    offset,
    with_payload: true,
    with_vector: false,
  });
}
