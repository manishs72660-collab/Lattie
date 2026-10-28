import { Router } from "express";
import { randomUUID } from "crypto";
import { auth } from "../middleware/auth.js";
import { limit } from "../middleware/rateLimit.js";
import { agent, initialState } from "../agent/workflow.js";
import { asText } from "../utils/llm.js";
import { env } from "../config/env.js";

const router = Router();
router.use(auth);

// Server-Sent Events: step / token / reset / meta / done / error
router.post("/stream", limit("chat", env.RAG_RATE_LIMIT_MAX, Math.ceil(env.RAG_RATE_LIMIT_WINDOW_MS / 1000)), async (req, res) => {
  const question = String(req.body?.question || "").trim().slice(0, 1000);
  if (!question) return res.status(400).json({ error: "Type a question first" });

  const userId = req.user.id;
  const chatId = typeof req.body?.chatId === "string" ? req.body.chatId : randomUUID();

  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.flushHeaders();

  let closed = false;
  res.on("close", () => (closed = true));
  const send = (event, data) => !closed && res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  send("meta", { chatId });

  try {
    let final = null;
    const events = agent.streamEvents(initialState(userId, question), { version: "v2", runName: "agent", recursionLimit: 25 });

    for await (const ev of events) {
      if (closed) break;
      const node = ev.metadata?.langgraph_node;

      if (ev.event === "on_chain_start" && ev.name === "generate") send("reset", {});
      if (ev.event === "on_chain_end" && node && ev.name === node && ev.data?.output?.steps) {
        for (const s of ev.data.output.steps) send("step", { text: s, node });
      }
      if (ev.event === "on_chat_model_stream" && node === "generate") {
        const text = asText(ev.data?.chunk?.content);
        if (text) send("token", { text });
      }
      if (ev.event === "on_chain_end" && ev.name === "agent" && !ev.parent_ids?.length) final = ev.data.output;
    }

    if (final) {
      const sources = (final.documents || []).map((d, i) => ({
        n: i + 1,
        file: d.metadata.file,
        page: d.metadata.page,
        type: d.metadata.type,
        url: d.metadata.url,
      }));
      const answer = {
        role: "assistant",
        content: final.generation,
        route: final.route,
        grounded: final.grounded,
        sources,
        steps: final.steps,
      };
      send("done", { ...answer, chatId });
    } else send("error", { error: "The agent finished without producing an answer. Please try again." });
  } catch (e) {
    console.error("Chat stream error:", e);
    send("error", { error: "Something went wrong while answering. Check your LLM keys and try again." });
  } finally {
    res.end();
  }
});

export default router;
