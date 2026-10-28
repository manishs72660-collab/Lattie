import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDoc } from "../store/docsSlice";

export default function UploadPanel() {
  const dispatch = useDispatch();
  const { uploading, error } = useSelector((s) => s.docs);
  const input = useRef();
  const [drag, setDrag] = useState(false);

  const send = (files) => [...files].forEach((f) => dispatch(uploadDoc(f)));

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files); }}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-vector bg-vector-soft" : "border-line bg-panel"}`}
      >
        <p className="font-medium">Drop PDFs here</p>
        <p className="mt-1 text-sm text-muted">PDF, TXT or MD, up to 10 MB each. Text is indexed for search and a knowledge graph is built from it.</p>
        <button
          onClick={() => input.current.click()}
          disabled={uploading}
          className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Choose files"}
        </button>
        <input ref={input} type="file" multiple accept=".pdf,.txt,.md" hidden onChange={(e) => { send(e.target.files); e.target.value = ""; }} />
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
