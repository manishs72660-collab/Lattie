export const ROUTES = {
  vector: { label: "Documents", cls: "bg-vector-soft text-vector", dot: "bg-vector" },
  graph: { label: "Knowledge graph", cls: "bg-graph-soft text-graph", dot: "bg-graph" },
  web: { label: "Web", cls: "bg-web-soft text-web", dot: "bg-web" },
};

export default function RouteBadge({ route }) {
  const r = ROUTES[route];
  if (!r) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${r.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
      {r.label}
    </span>
  );
}
