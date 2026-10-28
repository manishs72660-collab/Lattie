import { env } from "../config/env.js";

export async function webSearch(query, k = 4) {
  if (!env.TAVILY_API_KEY) return [];
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.TAVILY_API_KEY}` },
      body: JSON.stringify({ api_key: env.TAVILY_API_KEY, query, max_results: k, search_depth: "basic" }),
    });
    if (!res.ok) throw new Error(`Tavily ${res.status}`);
    const data = await res.json();
    return (data.results || []).map((r) => ({
      pageContent: r.content,
      metadata: { type: "web", file: r.title || r.url, url: r.url },
    }));
  } catch (e) {
    console.warn("Web search failed:", e.message);
    return [];
  }
}
