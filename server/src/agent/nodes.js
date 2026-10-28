import { z } from "zod";
import { makeLLM, makeStructuredLLM, asText } from "../utils/llm.js";
import { vectorSearch } from "../retrievers/vector.js";
import { graphSearch } from "../retrievers/graph.js";
import { webSearch } from "../retrievers/web.js";
import { env } from "../config/env.js";
import { listReadyDocuments } from "../utils/documentStore.js";

const LABEL = { vector: "document search", graph: "knowledge graph", web: "web search" };
const JSON_SCHEMA = { method: "jsonSchema" };

export function formatContext(docs) {
  return docs
    .map((d, i) => `[${i + 1}] (${d.metadata.file}${d.metadata.page ? `, p.${d.metadata.page}` : ""})\n${d.pageContent}`)
    .join("\n\n");
}

/* 1. ROUTER */
const routeSchema = z.object({
  datasource: z.enum(["vector", "graph", "web"]),
  reason: z.string().describe("one short sentence"),
});

export async function router(state) {
  const docs = await listReadyDocuments(state.userId);
  if (!docs.length) return { route: "web", webTried: true, steps: ["No ready documents, going straight to web search"] };
  const out = await makeStructuredLLM()
    .withStructuredOutput(routeSchema, { name: "route", ...JSON_SCHEMA })
    .invoke(
      `Choose where to look for the answer.
- vector: questions about what the user's documents say (facts, summaries, explanations, details).
- graph: questions about relationships or connections between people, companies or concepts, or multi-hop questions ("who is connected to X", "how are A and B related").
- web: current events or topics the documents clearly do not cover.
The user's documents: ${docs.map((d) => d.name).join(", ") || "none"}.
Question: ${state.query}`
    );
  return { route: out.datasource, steps: [`Routed to ${LABEL[out.datasource]}: ${out.reason}`] };
}

/* 2. RETRIEVERS */
export async function retrieveVector(state) {
  const documents = await vectorSearch(state.userId, state.query, env.RAG_TOP_K);
  return { documents, route: "vector", steps: [`Found ${documents.length} passages in your documents`] };
}

export async function retrieveGraph(state) {
  let documents = await graphSearch(state.userId, state.query);
  if (documents.length) return { documents, route: "graph", steps: [`Traversed the knowledge graph, got ${documents.length} items`] };
  documents = await vectorSearch(state.userId, state.query, env.RAG_TOP_K);
  return { documents, route: "vector", steps: ["Graph had no match, fell back to document search"] };
}

export async function retrieveWeb(state) {
  const documents = await webSearch(state.query, 4);
  const note = env.TAVILY_API_KEY ? `Found ${documents.length} web results` : "Web search is not configured (no TAVILY_API_KEY)";
  return { documents, route: "web", webTried: true, steps: [note] };
}

/* 3. GRADER */
const gradeSchema = z.object({ relevant: z.array(z.number()).describe("1-based numbers of the relevant documents") });

export async function gradeDocs(state) {
  if (!state.documents.length) return { documents: [], steps: ["Nothing retrieved to grade"] };
  const listing = state.documents.map((d, i) => `[${i + 1}] ${d.pageContent.slice(0, 700)}`).join("\n\n");
  const out = await makeStructuredLLM()
    .withStructuredOutput(gradeSchema, { name: "grade", ...JSON_SCHEMA })
    .invoke(`Which documents contain information that helps answer the question? Be lenient but drop clearly unrelated ones.\n\nQuestion: ${state.query}\n\nDocuments:\n${listing}`);
  const keep = state.documents.filter((_, i) => out.relevant.includes(i + 1));
  return { documents: keep, steps: [`Graded passages: ${keep.length} of ${state.documents.length} relevant`] };
}

/* 4. REWRITER */
export async function rewrite(state) {
  const res = await makeLLM().invoke(
    `Rewrite this question so a search engine over documents finds better results. Use specific keywords and full names. Return only the rewritten question.\n\nQuestion: ${state.query}`
  );
  const query = asText(res.content).trim().replace(/^["']|["']$/g, "");
  return { query, rewrites: state.rewrites + 1, steps: [`Rewrote the question: "${query}"`] };
}

/* 5. GENERATOR */
const SYSTEM = `You answer questions using ONLY the numbered context. Cite sources inline like [1] or [2][3].
If the context does not contain enough information, say so plainly instead of guessing. Be concise and well structured; use markdown lists when helpful.`;

export async function generate(state) {
  const context = state.documents.length ? formatContext(state.documents) : "(no relevant context was found)";
  const res = await makeLLM({ streaming: true, temperature: 0.2 }).invoke([
    ["system", SYSTEM],
    ["human", `Context:\n${context}\n\nQuestion: ${state.question}`],
  ]);
  return { generation: asText(res.content), genTries: state.genTries + 1, steps: [state.genTries ? "Wrote a new draft" : "Wrote the answer"] };
}

/* 6. SELF-CHECK */
const checkSchema = z.object({
  grounded: z.boolean().describe("every claim in the answer is supported by the context"),
  answers_question: z.boolean().describe("the answer actually addresses the question"),
  reason: z.string(),
});

export async function checkAnswer(state) {
  if (!state.documents.length) return { grounded: true, steps: ["No context to verify against"] };
  const out = await makeStructuredLLM()
    .withStructuredOutput(checkSchema, { name: "check", ...JSON_SCHEMA })
    .invoke(
      `Context:\n${formatContext(state.documents)}\n\nQuestion: ${state.question}\n\nAnswer:\n${state.generation}\n\nIs the answer fully supported by the context, and does it address the question? An honest "the documents do not say" counts as grounded.`
    );
  const ok = out.grounded && out.answers_question;
  return { grounded: ok, steps: [ok ? "Self-check passed: answer is grounded in the sources" : `Self-check failed: ${out.reason}`] };
}

/* EDGES */
export const afterGrade = (s) => {
  if (s.documents.length) return "generate";
  if (s.rewrites < env.MAX_REWRITES) return "rewrite";
  if (!s.webTried) return "web";
  return "generate";
};

export const afterCheck = (s) => (s.grounded || s.genTries >= 2 ? "done" : "retry");