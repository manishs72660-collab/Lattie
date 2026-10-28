import RouteBadge, { ROUTES } from "./RouteBadge";
import AgentTrace from "./AgentTrace";
import AnswerMarkdown from "./AnswerMarkdown";

function AssistantMark() {
  return (
    <span className="answer-avatar" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M16 4.5 26 10v12L16 27.5 6 22V10l10-5.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="m6.5 10.3 9.5 5.3 9.5-5.3M16 16v11" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="16" r="2.1" fill="currentColor" />
      </svg>
    </span>
  );
}

function SourceChip({ s }) {
  const tone = ROUTES[s.type]?.cls || "bg-line text-ink";
  const text = (
    <>
      <span className="font-semibold">[{s.n}]</span> {s.file}
      {s.page ? `, p.${s.page}` : ""}
    </>
  );
  const cls = `source-chip inline-flex max-w-full items-center gap-1.5 rounded-xl px-3 py-2 text-xs ${tone}`;
  return s.url ? (
    <a href={s.url} target="_blank" rel="noreferrer" className={cls}>{text}<span aria-hidden="true">↗</span></a>
  ) : (
    <span className={cls}><span className="source-chip-icon">↗</span>{text}</span>
  );
}

export default function MessageBubble({ m }) {
  if (m.role === "user") {
    return (
      <div className="message-row user-message-row">
        <div className="user-message">
          <p>{m.content}</p>
        </div>
      </div>
    );
  }
  return (
    <article className="message-row assistant-message-row">
      <AssistantMark />
      <div className="assistant-message-content">
        <div className="answer-meta">
          <span className="answer-byline">Lattice</span>
          <RouteBadge route={m.route} />
          {m.grounded === false && (
            <span className="confidence-warning"><span aria-hidden="true">!</span> Check the sources</span>
          )}
        </div>
        <div className="answer-card-content">
          <AnswerMarkdown>{m.content}</AnswerMarkdown>
        </div>
        {m.sources?.length > 0 && (
          <section className="answer-sources" aria-label="Answer sources">
            <div className="sources-heading"><span className="sources-heading-icon">↗</span><span>Sources</span><span className="sources-count">{m.sources.length}</span></div>
            <div className="mt-2 flex flex-wrap gap-2">
              {m.sources.map((s) => <SourceChip key={s.n} s={s} />)}
            </div>
          </section>
        )}
        {m.steps?.length > 0 && (
          <details className="agent-details group">
            <summary><span className="agent-details-icon">✳</span> How Lattice found this <span className="agent-step-count">{m.steps.length} steps</span><span className="agent-details-chevron">⌄</span></summary>
            <div className="agent-details-body"><AgentTrace steps={m.steps} /></div>
          </details>
        )}
      </div>
    </article>
  );
}
