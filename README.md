# Lattice: Graph-Aware Agentic RAG (MERN, plain JavaScript)

Upload PDFs, then ask questions. A **LangGraph.js agent** decides per question whether to use
**vector search**, the **knowledge graph**, or the **web**, grades what it found, rewrites the question if
needed, writes a cited answer, and **checks its own answer for hallucinations** before replying.
Every step is streamed live to the UI.

```
              ┌──────────────► retrieveVector ─┐
 question ► router ─► retrieveGraph ───────────┼► gradeDocs ─► generate ─► checkAnswer ─► answer
              └──────────────► retrieveWeb ────┼──────────────────▲            │ (fails: retry)
                                 ▲             │ (no relevant docs)│            └────► generate
                                 └─ fallback ◄─┴─► rewrite ─► router   (max 2 rewrites)
```

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), React Router, Redux Toolkit, Tailwind CSS v4 |
| Backend | Node, Express (plain JS / ES modules), SSE streaming |
| Agent | LangChain.js + **LangGraph.js**, Zod structured output |
| Accounts | **MongoDB Atlas**: user profiles and password hashes only |
| Vector store | **Qdrant Cloud**: document vectors, metadata and graph payloads |
| Original uploads | **Cloudinary** |
| Chat history | Browser `localStorage` (per signed-in user and browser) |
| Cache + rate limit | **Upstash Redis** (REST, optional) |
| LLM | **Groq** for chat; **Gemini** for embeddings |
| Web search | Tavily |

**No Neo4j needed.** Entity and relation data is stored in Qdrant point payloads alongside each document chunk; graph traversal is done in `server/src/retrievers/graph.js`.

## Setup (about 15 minutes)

### 1. Accounts / keys
1. **MongoDB Atlas**: create a cluster and database user. MongoDB stores account data only.
2. **Qdrant Cloud**: create a cluster and copy its URL and API key.
3. **Cloudinary**: copy the cloud name, API key and API secret for original uploads.
4. **Groq** and **Google AI Studio**: create API keys for chat and embeddings.
5. **Upstash** (optional): create a Redis database for rate limiting.
6. **Tavily** (optional): create an API key for web search.

### 2. Backend
```bash
cd server
npm install
Copy-Item .env.example .env
npm run dev               # http://localhost:5000
```
On boot, the server creates the configured Qdrant collection if needed. Its vector dimension must match `GEMINI_EMBEDDING_DIM` (3072 for the default `gemini-embedding-001` model).

Required backend settings: `MONGODB_URI`, `JWT_SECRET`, `QDRANT_URL`, `QDRANT_API_KEY`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GROQ_API_KEY`,
and `GOOGLE_API_KEY`. See `server/.env.example` for defaults and optional settings.

### 3. Frontend
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

### 4. Try it
Register, open **Documents**, upload a PDF (a company report or a long Wikipedia article works well), wait for *Ready*,
then ask in **Ask**:
- "Summarize the main ideas" → routed to **documents**
- "How is X connected to Y?" → routed to **knowledge graph**
- "Latest news about Z" → routed to **web**

Open **Knowledge graph** to explore the extracted entities.

## Evaluation (for your resume numbers)
1. Put 15-20 questions + expected answers in `server/eval/questions.json`.
2. `cd server && EVAL_EMAIL=you@example.com npm run eval`
3. It compares **plain vector RAG vs. the agentic graph RAG** with an LLM judge and prints both accuracies.

## Deploy
- **Backend → Render / Railway**: root `server`, build `npm install`, start `npm start`. Add all `.env` values and set `CLIENT_URL` to your frontend URL.
- **Frontend → Vercel / Netlify**: root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=https://<your-backend>/api`.
- MongoDB Atlas: allow the backend's outbound IP.
- Render free tier sleeps after 15 min idle: open the backend URL once before a demo.

## Data ownership
- MongoDB contains only user accounts and password hashes.
- Qdrant contains document/chunk records, vectors, progress metadata and graph payloads.
- Cloudinary stores original uploads; deleting a document removes its Qdrant points and Cloudinary file.
- Chat history is local to the browser and separated by signed-in user; it is not synced between devices.
- Upstash Redis is optional and used for rate limiting and query-embedding cache. Without it, the limiter fails open.

## Project structure
```
server/src
  agent/        state.js · nodes.js · workflow.js   ← LangGraph
  retrievers/   vector.js · graph.js · web.js
  ingestion/    extract.js · ingest.js · graphBuilder.js
  routes/       auth · documents · chat (SSE) · graph
  models/       User
client/src
  store/        authSlice · docsSlice · chatSlice (Redux Toolkit, SSE streaming thunk)
  pages/        Login · Chat · Documents · GraphPage
  components/   Layout · AgentTrace · MessageBubble · GraphViewer · UploadPanel
```

## Resume bullets (fill X/Y from `npm run eval`)
- Built **Lattice**, a MERN app where a **LangGraph.js** agent routes questions across **Qdrant vector search**, a Qdrant-payload knowledge graph (LLM entity/relation extraction, 2-hop traversal) and web search.
- Implemented self-correcting RAG: document grading, query rewriting, web fallback and a hallucination/answer check, lifting accuracy from **X% to Y%** on a 20-question eval vs. plain vector RAG.
- Streamed agent steps and tokens to a React + Redux UI over SSE; async ingestion with progress tracking; JWT auth, per-user data isolation, **Upstash Redis** rate limiting and browser-local chat history.

## Known limits
- Scanned (image-only) PDFs need OCR; they are rejected with a clear message.
- Graph extraction samples up to `MAX_GRAPH_CHUNKS` (40) chunks per document to control LLM cost; raise it for better coverage.
- Chat history is local to the current browser; the agent answers each question independently.
