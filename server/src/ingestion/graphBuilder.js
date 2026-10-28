import { z } from "zod";
import { makeStructuredLLM } from "../utils/llm.js";
import { norm, pool } from "../utils/helpers.js";
import { qdrant, COLLECTION } from "../config/qdrant.js";

const schema = z.object({
  entities: z.array(z.object({ name: z.string(), type: z.string() })),
  relations: z.array(z.object({ source: z.string(), target: z.string(), type: z.string() })),
});
const JSON_SCHEMA = { method: "jsonSchema" };

const PROMPT = `Extract a knowledge graph from the text.
- entities: important people, organizations, products, places, technologies, events or key concepts (max 12). "type" is one short word (Person, Organization, Product, Place, Technology, Event, Concept).
- relations: how two of those entities are connected. "type" is a short UPPER_SNAKE_CASE verb phrase like WORKS_AT, FOUNDED, ACQUIRED, LOCATED_IN, USES, PART_OF.
Use the entity's full canonical name consistently. Only include facts stated in the text.

TEXT:
`;

const relType = (t) => String(t || "RELATED_TO").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40) || "RELATED_TO";
const okName = (n) => n && n.trim().length >= 2 && n.trim().length <= 80;

export async function buildGraph({ chunks, onProgress }) {
  const extractor = makeStructuredLLM().withStructuredOutput(schema, { name: "graph", ...JSON_SCHEMA });
  let done = 0;
  const entities = new Set();

  await pool(chunks, 3, async (chunk) => {
    try {
      const out = await extractor.invoke(PROMPT + chunk.text.slice(0, 3000));

      const entMap = new Map();
      for (const e of out.entities || []) {
        if (okName(e.name)) {
          const item = { name: e.name.trim(), type: e.type || "Concept" };
          entMap.set(norm(item.name), item);
          entities.add(norm(item.name));
        }
      }
      for (const r of out.relations || []) {
        for (const name of [r.source, r.target]) {
          if (okName(name) && !entMap.has(norm(name))) {
            entMap.set(norm(name), { name: name.trim(), type: "Concept" });
            entities.add(norm(name));
          }
        }
      }

      const relations = (out.relations || [])
        .filter((r) => okName(r.source) && okName(r.target) && norm(r.source) !== norm(r.target))
        .map((r) => ({ source: r.source.trim(), target: r.target.trim(), type: relType(r.type) }));
      const entityTypes = Object.fromEntries([...entMap.entries()].map(([key, entity]) => [key, entity.type]));
      await qdrant.setPayload(COLLECTION, {
        points: [chunk.id],
        payload: { graphEntities: [...entMap.keys()], graphEntityTypes: entityTypes, graphRelations: relations },
        wait: true,
      });
    } catch (e) {
      console.error("Graph extraction failed for a chunk:", e);
    } finally {
      done++;
      await onProgress?.(done, chunks.length);
    }
  });
  return { entityCount: entities.size };
}