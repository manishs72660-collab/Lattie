import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../api";
import { fetchDocs } from "../store/docsSlice";
import GraphViewer from "../components/GraphViewer";

export default function GraphPage() {
  const dispatch = useDispatch();
  const docs = useSelector((s) => s.docs.items.filter((d) => d.status === "ready"));
  const [docId, setDocId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { dispatch(fetchDocs()); }, [dispatch]);
  useEffect(() => {
    setData(null);
    setError(null);
    api(`/graph${docId ? `?docId=${docId}` : ""}`).then(setData).catch((e) => setError(e.message));
  }, [docId]);

  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-14 md:px-8 md:pt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Knowledge graph</h2>
          <p className="mt-1 text-muted">Entities and relationships the agent can follow to answer connection questions.</p>
        </div>
        <label className="text-sm">
          <span className="mr-2 text-muted">Show</span>
          <select value={docId} onChange={(e) => setDocId(e.target.value)} className="rounded-lg border border-line bg-white px-3 py-2">
            <option value="">All documents</option>
            {docs.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </label>
      </div>

      <div className="min-h-0 flex-1">
        {error && <p role="alert" className="text-danger">{error}</p>}
        {!error && !data && <p className="text-muted">Loading graph…</p>}
        {data && data.nodes.length === 0 && (
          <p className="text-muted">No graph yet. <Link to="/app/documents" className="font-medium text-vector hover:underline">Upload a document</Link> and wait for indexing to finish.</p>
        )}
        {data && data.nodes.length > 0 && <GraphViewer data={data} />}
      </div>
    </div>
  );
}
