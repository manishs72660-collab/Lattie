import { ChatOpenAI } from "@langchain/openai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { env } from "../config/env.js";

// For generation & plain-text tasks (streaming-friendly, fast)
export const makeLLM = (opts = {}) =>
  new ChatOpenAI({
    model: env.GROQ_CHAT_MODEL,
    apiKey: env.GROQ_API_KEY,
    temperature: 0,
    configuration: { baseURL: "https://api.groq.com/openai/v1" },
    streamUsage: false,
    ...opts,
  });

// For structured output (JSON schema) — gpt-oss-120b supports strict json_schema on Groq
export const makeStructuredLLM = (opts = {}) =>
  new ChatOpenAI({
    model: "openai/gpt-oss-120b",
    apiKey: env.GROQ_API_KEY,
    temperature: 0,
    configuration: { baseURL: "https://api.groq.com/openai/v1" },
    streamUsage: false,
    ...opts,
  });

export const embeddingsModel = (taskType) =>
  new GoogleGenerativeAIEmbeddings({
    apiKey: env.GOOGLE_API_KEY,
    model: env.GEMINI_EMBEDDING_MODEL,
    taskType,
  });

export const asText = (content) =>
  typeof content === "string"
    ? content
    : Array.isArray(content)
    ? content.map((c) => (typeof c === "string" ? c : c.text || "")).join("")
    : String(content ?? "");