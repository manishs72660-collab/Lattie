import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const PALETTE = ["#2f5da8", "#a8520a", "#0b7a65", "#8a3b8f", "#b42318", "#4d6b1f", "#475467"];
const colorFor = (type = "") => PALETTE[[...type].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

export default function GraphViewer({ data }) {
  const box = useRef();
  const fg = useRef();
  const [size, setSize] = useState({ w: 600, h: 500 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  // react-force-graph mutates link objects, so give it a fresh copy per data set
  const graph = useMemo(() => ({ nodes: data.nodes.map((n) => ({ ...n })), links: data.links.map((l) => ({ ...l })) }), [data]);
  const types = useMemo(() => [...new Set(data.nodes.map((n) => n.type))], [data]);

  const neighbours = useMemo(() => {
    if (!selected) return [];
    return data.links
      .filter((l) => l.source === selected.id || l.target === selected.id || l.source?.id === selected.id || l.target?.id === selected.id)
      .map((l) => {
        const s = l.source?.id ?? l.source, t = l.target?.id ?? l.target;
        const name = (id) => data.nodes.find((n) => n.id === id)?.name || id;
        return `${name(s)}  ${l.label.toLowerCase().replace(/_/g, " ")}  ${name(t)}`;
      });
  }, [selected, data]);

  return (
    <div className="flex h-full flex-col gap-3 lg:flex-row">
      <div ref={box} className="relative min-h-[360px] flex-1 overflow-hidden rounded-xl border border-line bg-panel">
        <ForceGraph2D
          ref={fg}
          width={size.w}
          height={size.h}
          graphData={graph}
          cooldownTicks={80}
          linkColor={() => "#b9c6bf"}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          onNodeClick={(n) => setSelected(n)}
          onBackgroundClick={() => setSelected(null)}
          nodeCanvasObject={(node, ctx, scale) => {
            const r = 3 + Math.min(node.degree || 1, 8) * 0.9;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = colorFor(node.type);
            ctx.globalAlpha = selected && selected.id !== node.id ? 0.55 : 1;
            ctx.fill();
            ctx.globalAlpha = 1;
            if (scale > 1.1 || node.degree > 2 || selected?.id === node.id) {
              ctx.font = `${11 / Math.max(scale, 1)}px Roboto, sans-serif`;
              ctx.fillStyle = "#17221e";
              ctx.textAlign = "center";
              ctx.fillText(node.name, node.x, node.y + r + 8 / Math.max(scale, 1));
            }
          }}
          nodePointerAreaPaint={(node, color, ctx) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI); ctx.fill(); }}
        />
        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-panel/90 px-3 py-2 text-xs">
          {types.map((t) => (
            <span key={t} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: colorFor(t) }} />{t}</span>
          ))}
        </div>
      </div>

      <aside className="w-full shrink-0 rounded-xl border border-line bg-panel p-4 lg:w-72">
        {selected ? (
          <>
            <p className="text-lg font-semibold leading-tight">{selected.name}</p>
            <p className="text-sm text-muted">{selected.type}, {neighbours.length} connections</p>
            <ul className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto text-sm">
              {neighbours.map((n, i) => <li key={i} className="leading-snug">{n}</li>)}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted">Select a node to see how it is connected. Bigger nodes have more connections. Scroll to zoom, drag to move.</p>
        )}
      </aside>
    </div>
  );
}
