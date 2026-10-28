import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

export const fetchDocs = createAsyncThunk("docs/fetch", async () => (await api("/documents")).documents);

export const uploadDoc = createAsyncThunk("docs/upload", async (file, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("file", file);
    return (await api("/documents/upload", { method: "POST", form })).document;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const deleteDoc = createAsyncThunk("docs/delete", async (id, { rejectWithValue }) => {
  try {
    await api(`/documents/${id}`, { method: "DELETE" });
    return id;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: "docs",
  initialState: { items: [], loaded: false, uploading: false, error: null },
  reducers: { clearDocError: (s) => { s.error = null; } },
  extraReducers: (b) => {
    b.addCase(fetchDocs.fulfilled, (s, { payload }) => { s.items = payload; s.loaded = true; });
    b.addCase(uploadDoc.pending, (s) => { s.uploading = true; s.error = null; });
    b.addCase(uploadDoc.fulfilled, (s, { payload }) => { s.uploading = false; s.items.unshift(payload); });
    b.addCase(uploadDoc.rejected, (s, { payload }) => { s.uploading = false; s.error = payload; });
    b.addCase(deleteDoc.fulfilled, (s, { payload }) => { s.items = s.items.filter((d) => d._id !== payload); });
    b.addCase(deleteDoc.rejected, (s, { payload }) => { s.error = payload; });
  },
});

export const { clearDocError } = slice.actions;
export default slice.reducer;
