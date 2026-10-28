import crypto from "crypto";
import { embeddingsModel } from "./llm.js";
import { cacheGet, cacheSet } from "../config/redis.js";
import { env } from "../config/env.js";

const documentModel = embeddingsModel("RETRIEVAL_DOCUMENT");
const queryModel = embeddingsModel("RETRIEVAL_QUERY");

export async function embedDocuments(texts) {
  return documentModel.embedDocuments(texts);
}

export async function embedQuery(text) {
  const key = `emb:${env.GEMINI_EMBEDDING_MODEL}:${crypto.createHash("sha1").update(text).digest("hex")}`;
  const cached = await cacheGet(key);
  if (Array.isArray(cached)) return cached;
  const vector = await queryModel.embedQuery(text);
  await cacheSet(key, vector, 60 * 60 * 24);
  return vector;
}

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
