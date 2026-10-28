import { randomUUID } from "crypto";
import { qdrant, COLLECTION, scrollPoints, userFilter } from "../config/qdrant.js";
import { env } from "../config/env.js";

const documentFilter = (userId, docId) => ({
  must: [
    { key: "userId", match: { value: userId } },
    { key: "recordType", match: { value: "document" } },
    { key: "docId", match: { value: docId } },
  ],
});

const publicDocument = ({ cloudinaryPublicId, ...document }) => ({
  ...document,
  _id: document.docId,
});

export async function createDocument({ userId, name, size, cloudinaryPublicId, docId = randomUUID() }) {
  const point = {
    id: docId,
    vector: [1, ...Array(env.GEMINI_EMBEDDING_DIM - 1).fill(0)],
    payload: {
      userId,
      docId,
      recordType: "document",
      name,
      size,
      cloudinaryPublicId,
      status: "processing",
      stage: "Queued",
      progress: 0,
      createdAt: new Date().toISOString(),
    },
  };
  await qdrant.upsert(COLLECTION, { points: [point], wait: true });
  return publicDocument(point.payload);
}

export async function updateDocument(userId, docId, changes) {
  const { points } = await scrollPoints(documentFilter(userId, docId), 1);
  if (!points.length) throw new Error("Document record not found");
  await qdrant.setPayload(COLLECTION, {
    points: [points[0].id],
    payload: changes,
    wait: true,
  });
}

export async function getDocument(userId, docId) {
  const { points } = await scrollPoints(documentFilter(userId, docId), 1);
  return points[0]?.payload || null;
}

export async function listDocuments(userId) {
  const documents = [];
  let offset;
  do {
    const page = await scrollPoints(userFilter(userId, "document"), 1000, offset);
    documents.push(...page.points.map((point) => publicDocument(point.payload)));
    offset = page.next_page_offset;
  } while (offset);
  return documents
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listReadyDocuments(userId, limit = 10) {
  const filter = {
    must: [
      ...userFilter(userId, "document").must,
      { key: "status", match: { value: "ready" } },
    ],
  };
  const { points } = await scrollPoints(filter, limit);
  return points.map((point) => point.payload);
}

export async function deleteDocumentData(userId, docId) {
  await qdrant.delete(COLLECTION, {
    filter: {
      must: [
        { key: "userId", match: { value: userId } },
        { key: "docId", match: { value: docId } },
      ],
    },
    wait: true,
  });
}
