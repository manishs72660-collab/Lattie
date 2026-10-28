import { Router } from "express";
import { qdrant, COLLECTION, userFilter } from "../config/qdrant.js";
import { auth } from "../middleware/auth.js";
import { norm } from "../utils/helpers.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const must = [...userFilter(req.user.id, "chunk").must];
  if (req.query.docId) must.push({ key: "docId", match: { value: String(req.query.docId) } });

  const relations = new Map();
  const types = new Map();
  let offset;
  do {
    const page = await qdrant.scroll(COLLECTION, {
      filter: { must },
      limit: 500,
      offset,
      with_payload: true,
      with_vector: false,
    });
    for (const point of page.points) {
      for (const [name, type] of Object.entries(point.payload.graphEntityTypes || {})) {
        if (!types.has(name)) types.set(name, type);
      }
      for (const relation of point.payload.graphRelations || []) {
        const source = norm(relation.source);
        const target = norm(relation.target);
        const key = `${source}|${relation.type}|${target}`;
        if (!relations.has(key)) relations.set(key, relation);
      }
    }
    offset = page.next_page_offset;
  } while (offset && relations.size < 400);

  const degree = new Map();
  for (const relation of relations.values()) {
    for (const name of [norm(relation.source), norm(relation.target)]) {
      degree.set(name, (degree.get(name) || 0) + 1);
    }
  }
  const nodes = [...degree.entries()].map(([id, count]) => ({
    id,
    name: id,
    type: types.get(id) || "Concept",
    degree: count,
  }));
  const links = [...relations.entries()].slice(0, 400).map(([key, relation]) => ({
    source: norm(relation.source),
    target: norm(relation.target),
    label: relation.type,
    id: key,
  }));
  res.json({ nodes, links });
});

export default router;
