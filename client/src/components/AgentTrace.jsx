// The agent's decisions, shown as a vertical trace. `live` pulses the newest step.
export default function AgentTrace({ steps, live = false }) {
  if (!steps?.length) return null;
  return (
    <ol className="relative ml-1.5 border-l border-line pl-4">
      {steps.map((s, i) => {
        const active = live && i === steps.length - 1;
        const failed = /failed|fell back|no match/i.test(s);
        return (
          <li key={i} className="relative pb-2 text-sm leading-snug text-muted last:pb-0">
            <span
              className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${active ? "pulse-dot bg-vector" : failed ? "bg-graph" : "bg-ink/40"}`}
            />
            <span className={active ? "text-ink" : ""}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
