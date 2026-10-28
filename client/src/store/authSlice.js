import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api";

const call = (name, path, withBody = true) =>
  createAsyncThunk(`auth/${name}`, async (body, { rejectWithValue }) => {
    try {
      return await api(path, withBody ? { method: "POST", body } : {});
    } catch (e) {
      return rejectWithValue({ message: e.message, status: e.status });
    }
  });

export const login = call("login", "/auth/login");
export const register = call("register", "/auth/register");
export const fetchMe = call("me", "/auth/me", false);

const slice = createSlice({
  name: "auth",
  initialState: { user: null, token: localStorage.getItem("token"), loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    for (const t of [login, register]) {
      b.addCase(t.pending, (s) => { s.loading = true; s.error = null; });
      b.addCase(t.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user = payload.user;
        s.token = payload.token;
        localStorage.setItem("token", payload.token);
      });
      b.addCase(t.rejected, (s, { payload }) => { s.loading = false; s.error = payload?.message || "Something went wrong"; });
    }
    b.addCase(fetchMe.fulfilled, (s, { payload }) => { s.user = payload.user; });
    b.addCase(fetchMe.rejected, (s, { payload }) => {
      if (payload?.status === 401) { s.user = null; s.token = null; localStorage.removeItem("token"); }
    });
  },
});

export const { logout, clearError } = slice.actions;
export default slice.reducer;
