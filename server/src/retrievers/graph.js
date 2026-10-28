import { z } from "zod";
import { qdrant, COLLECTION, userFilter } from "../config/qdrant.js";
import { makeStructuredLLM } from "../utils/llm.js";
import { norm } from "../utils/helpers.js";

const schema = z.object({ entities: z.array(z.string()).describe("Entity names mentioned in the question") });
const JSON_SCHEMA = { method: "jsonSchema" };

async function findGraphChunks(userId, names, limit = 60) {
  if (!names.length) return [];
  const filter = {
    must: [
      ...userFilter(userId, "chunk").must,
      { key: "graphEntities", match: { any: names } },
    ],
  };
  const { points } = await qdrant.scroll(COLLECTION, {
    filter, limit, with_payload: true, with_vector: false,
  });
  return points;
}

export async function graphSearch(userId, question) {
  const { entities } = await makeStructuredLLM()
    .withStructuredOutput(schema, { name: "entities", ...JSON_SCHEMA })
    .invoke(`List the named entities (people, companies, products, places, concepts) in this question. Question: ${question}`);
  const seeds = [...new Set((entities || []).slice(0, 5).map(norm).filter(Boolean))];
  if (!seeds.length) return [];

  const firstHop = await findGraphChunks(userId, seeds);
  if (!firstHop.length) return [];

  const allPoints = new Map(firstHop.map((point) => [String(point.id), point]));
  const frontier = new Set();
  for (const point of firstHop) {
    for (const relation of point.payload.graphRelations || []) {
      for (const name of [relation.source, relation.target]) {
        const key = norm(name);
        if (key && !seeds.includes(key)) frontier.add(key);
      }
    }
  }

  const secondHop = await findGraphChunks(userId, [...frontier].slice(0, 20), 60);
  for (const point of secondHop) allPoints.set(String(point.id), point);

  const relations = new Map();
  for (const point of allPoints.values()) {
    for (const relation of point.payload.graphRelations || []) {
      const key = `${norm(relation.source)}|${relation.type}|${norm(relation.target)}`;
      if (!relations.has(key)) relations.set(key, relation);
      if (relations.size >= 50) break;
    }
    if (relations.size >= 50) break;
  }
  if (!relations.size) return [];

  const triples = [...relations.values()].map((r) => `${r.source} -[${r.type}]-> ${r.target}`).join("\n");
  const docs = [{ pageContent: `Knowledge graph facts:\n${triples}`, metadata: { type: "graph", file: "Knowledge graph" } }];
  for (const point of [...allPoints.values()].slice(0, 3)) {
    const payload = point.payload;
    docs.push({
      pageContent: payload.text,
      metadata: { type: "graph", file: payload.docName, page: payload.page, chunkId: String(point.id) },
    });
  }
  return docs;
}