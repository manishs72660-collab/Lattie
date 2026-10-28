import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { API } from "../api";

function storageKey(state) {
  let userId = state.auth.user?.id;
  if (!userId && state.auth.token) {
    try {
      const encoded = state.auth.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
      userId = JSON.parse(atob(payload)).id;
    } catch (error) {
      throw new Error("Could not identify the signed-in user for local chat history", { cause: error });
    }
  }
  if (!userId) throw new Error("Sign in before loading chat history");
  return `lattice:chats:${userId}`;
}

function readChats(state) {
  return JSON.parse(localStorage.getItem(storageKey(state)) || "[]");
}

function writeChats(state, chats) {
  localStorage.setItem(storageKey(state), JSON.stringify(chats));
}

export const fetchChats = createAsyncThunk("chat/list", async (_, { getState }) => readChats(getState()));
export const openChat = createAsyncThunk("chat/open", async (id, { getState }) => {
  const chat = readChats(getState()).find((item) => item._id === id);
  if (!chat) throw new Error("Chat not found in this browser");
  return chat;
});
export const deleteChat = createAsyncThunk("chat/delete", async (id, { getState }) => {
  const chats = readChats(getState()).filter((item) => item._id !== id);
  writeChats(getState(), chats);
  return id;
});

export const sendMessage = createAsyncThunk("chat/send", async (question, { dispatch, getState }) => {
  dispatch(userMessageAdded(question));
  const chatId = getState().chat.activeId || crypto.randomUUID();
  dispatch(chatStarted(chatId));
  let receivedAnswer = false;
  class Fatal extends Error {}

  try {
    await fetchEventSource(`${API}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ question, chatId }),
      openWhenHidden: true,
      async onopen(res) {
        if (res.ok) return;
        const data = await res.json().catch(() => ({}));
        throw new Fatal(data.error || "Could not reach the server");
      },
      onmessage(ev) {
        if (!ev.event) return;
        const data = ev.data ? JSON.parse(ev.data) : {};
        if (ev.event === "step") dispatch(liveStep(data.text));
        if (ev.event === "reset") dispatch(liveReset());
        if (ev.event === "token") dispatch(liveToken(data.text));
        if (ev.event === "done") {
          receivedAnswer = true;
          dispatch(streamDone(data));
        }
        if (ev.event === "error") throw new Fatal(data.error);
      },
      onerror(err) {
        throw err;
      },
    });

    if (!receivedAnswer) throw new Fatal("The server closed the response without an answer");
    const state = getState();
    const active = state.chat;
    if (!active.streaming && !active.error) {
      const chats = readChats(state).filter((item) => item._id !== chatId);
      const chat = {
        _id: chatId,
        title: active.messages.find((message) => message.role === "user")?.content.slice(0, 60) || question.slice(0, 60),
        messages: active.messages,
        updatedAt: new Date().toISOString(),
      };
      writeChats(state, [chat, ...chats].slice(0, 50));
    }
  } catch (error) {
    dispatch(streamFailed(error.message || "Connection lost"));
  }
  dispatch(fetchChats());
});

const empty = { steps: [], text: "", route: null };

const slice = createSlice({
  name: "chat",
  initialState: { chats: [], activeId: null, messages: [], streaming: false, live: empty, error: null },
  reducers: {
    newChat(s) { s.activeId = null; s.messages = []; s.live = empty; s.error = null; },
    userMessageAdded(s, { payload }) { s.messages.push({ role: "user", content: payload }); s.streaming = true; s.live = { steps: [], text: "", route: null }; s.error = null; },
    chatStarted(s, { payload }) { s.activeId = payload; },
    liveStep(s, { payload }) { s.live.steps.push(payload); },
    liveReset(s) { s.live.text = ""; },
    liveToken(s, { payload }) { s.live.text += payload; },
    streamDone(s, { payload }) {
      s.messages.push({ role: "assistant", content: payload.content, route: payload.route, grounded: payload.grounded, sources: payload.sources, steps: payload.steps });
      s.activeId = payload.chatId;
      s.streaming = false;
      s.live = empty;
    },
    streamFailed(s, { payload }) { s.streaming = false; s.live = empty; s.error = payload; },
  },
  extraReducers: (b) => {
    b.addCase(fetchChats.fulfilled, (s, { payload }) => { s.chats = payload; });
    b.addCase(openChat.fulfilled, (s, { payload }) => { s.activeId = payload._id; s.messages = payload.messages; s.live = empty; s.error = null; });
    b.addCase(deleteChat.fulfilled, (s, { payload }) => {
      s.chats = s.chats.filter((c) => c._id !== payload);
      if (s.activeId === payload) { s.activeId = null; s.messages = []; }
    });
  },
});

export const { newChat, userMessageAdded, chatStarted, liveStep, liveReset, liveToken, streamDone, streamFailed } = slice.actions;
export default slice.reducer;
