import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { randomUUID } from "crypto";
import { qdrant, COLLECTION } from "../config/qdrant.js";
import { updateDocument } from "../utils/documentStore.js";
import { extractPages } from "./extract.js";
import { buildGraph } from "./graphBuilder.js";
import { embedDocuments } from "../utils/embeddings.js";
import { env } from "../config/env.js";

export async function ingestDocument({ docId, userId, buffer, mimetype, filename }) {
  const update = (changes) => updateDocument(userId, docId, changes);
  try {
    await update({ stage: "Reading file", progress: 5 });
    const pages = await extractPages(buffer, mimetype, filename);
    if (!pages.some((page) => page.trim())) throw new Error("No readable text found (scanned PDFs need OCR).");

    await update({ stage: "Splitting into chunks", progress: 15, pages: pages.length });
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: env.RAG_CHUNK_SIZE,
      chunkOverlap: env.RAG_CHUNK_OVERLAP,
    });
    const rows = [];
    for (let page = 0; page < pages.length; page++) {
      if (!pages[page].trim()) continue;
      for (const text of await splitter.splitText(pages[page])) {
        rows.push({
          id: randomUUID(),
          text,
          payload: {
            userId,
            docId,
            docName: filename,
            page: page + 1,
            recordType: "chunk",
            text,
            graphEntities: [],
            graphRelations: [],
          },
        });
      }
    }

    if (!rows.length) throw new Error("No text chunks could be created from this file.");
    await update({ stage: "Creating embeddings", progress: 25 });
    const batchSize = 64;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const vectors = await embedDocuments(batch.map((row) => row.text));
      await qdrant.upsert(COLLECTION, {
        points: batch.map((row, index) => ({ id: row.id, vector: vectors[index], payload: row.payload })),
        wait: true,
      });
      await update({ progress: 25 + Math.round(((i + batch.length) / rows.length) * 35) });
    }

    await update({ chunkCount: rows.length, stage: "Building knowledge graph", progress: 60 });
    const step = Math.max(1, Math.ceil(rows.length / env.MAX_GRAPH_CHUNKS));
    const sample = rows.filter((_, index) => index % step === 0).slice(0, env.MAX_GRAPH_CHUNKS);
    const graph = await buildGraph({
      chunks: sample,
      onProgress: (done, total) => update({ progress: 60 + Math.round((done / total) * 38) }),
    });

    await update({
      status: "ready",
      stage: "Ready",
      progress: 100,
      entityCount: graph.entityCount,
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    try {
      await update({ status: "failed", stage: "Failed", error: error.message?.slice(0, 300) || "Indexing failed" });
    } catch (updateError) {
      console.error("Could not save ingestion failure status:", updateError);
    }
  }
}
