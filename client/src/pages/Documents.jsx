import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocs, deleteDoc } from "../store/docsSlice";
import UploadPanel from "../components/UploadPanel";

const STATUS = {
  processing: "bg-vector-soft text-vector",
  ready: "bg-web-soft text-web",
  failed: "bg-red-100 text-danger",
};

const size = (b = 0) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

export default function Documents() {
  const dispatch = useDispatch();
  const { items, loaded } = useSelector((s) => s.docs);
  const busy = items.some((d) => d.status === "processing");

  useEffect(() => { dispatch(fetchDocs()); }, [dispatch]);
  // poll while anything is being indexed
  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => dispatch(fetchDocs()), 3000);
    return () => clearInterval(t);
  }, [busy, dispatch]);

  return (
    <div className="h-full overflow-y-auto px-4 pb-8 pt-14 md:px-8 md:pt-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <p className="mb-5 mt-1 text-muted">Everything you upload is chunked, embedded and mined for entities and relationships.</p>
        <UploadPanel />

        <ul className="mt-6 space-y-3">
          {loaded && items.length === 0 && <li className="text-sm text-muted">No documents yet. Upload one to get started.</li>}
          {items.map((d) => (
            <li key={d._id} className="rounded-xl border border-line bg-panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-sm text-muted">
                    {size(d.size)}
                    {d.pages ? `, ${d.pages} page${d.pages > 1 ? "s" : ""}` : ""}
                    {d.status === "ready" ? `, ${d.chunkCount} passages, ${d.entityCount} entities` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS[d.status]}`}>{d.status}</span>
                  <button onClick={() => window.confirm(`Delete "${d.name}" and its graph data?`) && dispatch(deleteDoc(d._id))} className="text-sm text-muted hover:text-danger">Delete</button>
                </div>
              </div>
              {d.status === "processing" && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-vector transition-all" style={{ width: `${d.progress}%` }} /></div>
                  <p className="mt-1.5 text-xs text-muted">{d.stage}…</p>
                </div>
              )}
              {d.status === "failed" && <p role="alert" className="mt-2 text-sm text-danger">{d.error || "Indexing failed. Delete this file and try again."}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
