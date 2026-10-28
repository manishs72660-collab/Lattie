import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import docs from "./docsSlice";
import chat from "./chatSlice";

export const store = configureStore({ reducer: { auth, docs, chat } });
