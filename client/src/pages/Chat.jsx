import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../store/chatSlice";
import { fetchDocs } from "../store/docsSlice";
import MessageBubble from "../components/MessageBubble";
import AgentTrace from "../components/AgentTrace";
import AnswerMarkdown from "../components/AnswerMarkdown";

const SUGGESTIONS = [
  "Summarize the main points of my documents",
  "How are the key people and companies in my documents connected?",
  "What is the latest news about this topic?",
];

export default function Chat() {
  const dispatch = useDispatch();
  const { messages, streaming, live, error } = useSelector((s) => s.chat);
  const docs = useSelector((s) => s.docs);
  const [text, setText] = useState("");
  const bottom = useRef();

  useEffect(() => { dispatch(fetchDocs()); }, [dispatch]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, live.text, live.steps.length]);

  const ready = docs.items.filter((d) => d.status === "ready").length;
  const send = (q) => {
    const question = (q ?? text).trim();
    if (!question || streaming) return;
    setText("");
    dispatch(sendMessage(question));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="chat-scroll-area flex-1 overflow-y-auto px-4 pb-4 pt-14 md:px-8 md:pt-6">
        <div className="chat-thread mx-auto max-w-3xl space-y-6">
          {docs.loaded && ready === 0 && (
            <div className="rounded-xl border border-line bg-panel p-4 text-sm">
              You have no indexed documents yet, so questions go to the web.{" "}
              <Link to="/app/documents" className="font-medium text-vector hover:underline">Upload a document</Link> to ask about your own files.
            </div>
          )}

          {messages.length === 0 && !streaming && (
            <div className="pt-10">
              <h2 className="text-3xl font-bold tracking-tight">What do you want to know?</h2>
              <p className="mt-2 max-w-lg text-muted">Each question is routed to the right place: your document text, the knowledge graph built from it, or the web.</p>
              <div className="mt-6 flex flex-col items-start gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-lg border border-line bg-panel px-3 py-2 text-left text-sm hover:border-ink">{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => <MessageBubble key={i} m={m} />)}

          {streaming && (
            <div className="message-row assistant-message-row">
              <span className="answer-avatar answer-avatar-live" aria-hidden="true">✳</span>
              <div className="assistant-message-content">
                <div className="answer-meta"><span className="answer-byline">Lattice</span><span className="streaming-indicator"><i /> Writing a response</span></div>
                <div className="answer-card-content">
                  {live.text ? <AnswerMarkdown>{live.text}</AnswerMarkdown> : <div className="answer-thinking"><span /><span /><span /></div>}
                </div>
                <AgentTrace steps={live.steps.length ? live.steps : ["Starting…"]} live />
              </div>
            </div>
          )}

          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <div ref={bottom} />
        </div>
      </div>

      <div className="chat-composer border-t border-line bg-paper px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={1}
            maxLength={1000}
            placeholder="Ask a question…"
            aria-label="Your question"
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-[15px] outline-none focus:border-vector"
          />
          <button onClick={() => send()} disabled={streaming || !text.trim()} className="h-[44px] rounded-xl bg-ink px-5 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-40">
            {streaming ? "Working…" : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}
