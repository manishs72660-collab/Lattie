import "dotenv/config";

const num = (v, d) => (v !== undefined && v !== "" ? Number(v) : d);

export const env = {
  PORT: num(process.env.PORT, 5000),
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((s) => s.trim()),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  MONGODB_URI: process.env.MONGODB_URI,

  QDRANT_URL: process.env.QDRANT_URL,
  QDRANT_API_KEY: process.env.QDRANT_API_KEY,
  QDRANT_COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME || "portfolio_knowledge",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  UPSTASH_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,

  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001",
GEMINI_EMBEDDING_DIM: num(process.env.GEMINI_EMBEDDING_DIM, 3072),
GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash",
GROQ_API_KEY: process.env.GROQ_API_KEY,
GROQ_CHAT_MODEL: process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b",

  TAVILY_API_KEY: process.env.TAVILY_API_KEY,

  MAX_FILE_MB: num(process.env.MAX_FILE_MB, 10),
  MAX_GRAPH_CHUNKS: num(process.env.MAX_GRAPH_CHUNKS, 40),
  MAX_REWRITES: num(process.env.MAX_REWRITES, 2),
  RAG_CHUNK_SIZE: num(process.env.RAG_CHUNK_SIZE, 800),
  RAG_CHUNK_OVERLAP: num(process.env.RAG_CHUNK_OVERLAP, 120),
  RAG_TOP_K: num(process.env.RAG_TOP_K, 5),
  RAG_MIN_SCORE: num(process.env.RAG_MIN_SCORE, 0.35),
  RAG_RATE_LIMIT_WINDOW_MS: num(process.env.RAG_RATE_LIMIT_WINDOW_MS, 900000),
  RAG_RATE_LIMIT_MAX: num(process.env.RAG_RATE_LIMIT_MAX, 15),
};

export function assertEnv() {
  const missing = [
    "MONGODB_URI",
    "JWT_SECRET",
    "QDRANT_URL",
    "QDRANT_API_KEY",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "GOOGLE_API_KEY",
    "GROQ_API_KEY",
  ].filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}. Copy .env.example to .env and fill them.`);
  }
}
