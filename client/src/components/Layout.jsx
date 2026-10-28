import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";
import { newChat, openChat, deleteChat, fetchChats } from "../store/chatSlice";
import BrandMark from "./BrandMark";

const link = ({ isActive }) =>
  `app-nav-link block rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "app-nav-active" : "text-ink hover:bg-line/60"}`;

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { chats, activeId } = useSelector((s) => s.chat);
  const [open, setOpen] = useState(false);

  useEffect(() => { dispatch(fetchChats()); }, [dispatch]);

  const go = (fn) => { fn(); setOpen(false); navigate("/app"); };

  return (
    <div className="app-shell flex h-dvh">
      <button
        className="fixed left-3 top-3 z-30 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        Menu
      </button>

      <aside className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-line bg-panel p-4 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-7 mt-10 md:mt-0">
          <button onClick={() => navigate("/")} className="mb-3 flex items-center gap-2.5 text-left">
            <BrandMark />
            <span className="text-xl font-bold tracking-[-0.06em]">lattice<span className="text-[#659785]">.</span></span>
          </button>
          <p className="text-sm text-muted">Your knowledge, connected</p>
        </div>

        <nav className="space-y-1" onClick={() => setOpen(false)}>
          <NavLink to="/app" end className={link}><span className="mr-2">✳</span>Ask anything</NavLink>
          <NavLink to="/app/documents" className={link}><span className="mr-2">▤</span>Documents</NavLink>
          <NavLink to="/app/graph" className={link}><span className="mr-2">⌘</span>Knowledge graph</NavLink>
        </nav>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm font-semibold">Chats</p>
          <button onClick={() => go(() => dispatch(newChat()))} className="rounded-md px-2 py-1 text-sm text-vector hover:bg-vector-soft">New chat</button>
        </div>
        <ul className="mt-2 flex-1 space-y-0.5 overflow-y-auto">
          {chats.length === 0 && <li className="px-2 py-2 text-sm text-muted">Your conversations will show up here.</li>}
          {chats.map((c) => (
            <li key={c._id} className={`group flex items-center rounded-lg ${c._id === activeId ? "bg-line/70" : "hover:bg-line/40"}`}>
              <button onClick={() => go(() => dispatch(openChat(c._id)))} className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm">{c.title}</button>
              <button onClick={() => dispatch(deleteChat(c._id))} aria-label={`Delete chat ${c.title}`} className="px-2 text-sm text-muted opacity-0 hover:text-danger focus:opacity-100 group-hover:opacity-100">Delete</button>
            </li>
          ))}
        </ul>

        <div className="mt-3 rounded-2xl border border-line bg-white/70 p-3">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
          <button onClick={() => { dispatch(logout()); navigate("/"); }} className="mt-3 text-xs font-semibold text-muted hover:text-ink">Sign out ↗</button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-10 bg-ink/30 md:hidden" onClick={() => setOpen(false)} />}
      <main className="min-w-0 flex-1 overflow-hidden"><Outlet /></main>
    </div>
  );
}
