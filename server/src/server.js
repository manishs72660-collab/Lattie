import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, assertEnv } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { limit } from "./middleware/rateLimit.js";
import { ensureVectorIndex } from "./utils/vectorIndex.js";
import authRoutes from "./routes/auth.js";
import docRoutes from "./routes/documents.js";
import chatRoutes from "./routes/chat.js";
import graphRoutes from "./routes/graph.js";

assertEnv();
const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use("/api", limit("global", 300, 60, (r) => r.ip));

const health = (_req, res) => res.status(200).json({ ok: true, service: "lattice-api" });
app.get("/health", health);
app.get("/api/health", health);
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/graph", graphRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

await connectDB();
await ensureVectorIndex();
app.listen(env.PORT, () => console.log(`API running on http://localhost:${env.PORT}`));
