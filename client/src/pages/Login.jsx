import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, register, clearError } from "../store/authSlice";
import AgentTrace from "../components/AgentTrace";
import BrandMark from "../components/BrandMark";

const SAMPLE = [
  "Routed to knowledge graph: asks how two companies are connected",
  "Traversed the knowledge graph, got 7 items",
  "Graded passages: 5 of 7 relevant",
  "Wrote the answer",
  "Self-check passed: answer is grounded in the sources",
];

export default function Login({ mode }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isReg = mode === "register";

  if (token) return <Navigate to={location.state?.from?.pathname || "/app"} replace />;

  const submit = (e) => {
    e.preventDefault();
    dispatch(isReg ? register(form) : login({ email: form.email, password: form.password }));
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-vector";

  return (
    <div className="auth-page grid min-h-dvh lg:grid-cols-2">
      <section className="auth-story relative hidden flex-col justify-center overflow-hidden p-14 text-white lg:flex">
        <Link to="/" className="absolute left-12 top-10 flex items-center gap-2 text-lg font-bold tracking-tight"><BrandMark />lattice.</Link>
        <div className="auth-story-content relative z-10">
        <p className="landing-eyebrow text-white/60">YOUR KNOWLEDGE, CONNECTED</p>
        <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-[-0.07em]">Answers that<br />show their <span className="headline-serif">work.</span></h1>
        <p className="mt-4 max-w-md text-white/70">
          Lattice reads your documents, builds a knowledge graph from them and decides for each question whether to search the text, follow connections or check the web. Then it checks its own answer.
        </p>
        <div className="auth-trace mt-10 max-w-md rounded-2xl p-5">
          <p className="mb-3 text-sm font-medium text-white/90">What the agent did for one question</p>
          <div className="[&_li]:text-white/70 [&_ol]:border-white/20"><AgentTrace steps={SAMPLE} /></div>
        </div>
        </div>
      </section>

      <section className="auth-form-wrap flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="auth-form w-full max-w-sm space-y-4">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#64736a] transition hover:text-[#202b24] lg:hidden">← Back to Lattice</Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{isReg ? "Create your account" : "Sign in to Lattice"}</h2>
            <p className="mt-1 text-sm text-muted">{isReg ? "Your documents and chats stay private to you." : "Pick up where you left off."}</p>
          </div>
          {isReg && <input className={input} placeholder="Name" value={form.name} onChange={set("name")} required autoComplete="name" />}
          <label className="auth-label">Email address<input className={input} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
          <label className="auth-label">Password<input className={input} type="password" placeholder="At least 6 characters" value={form.password} onChange={set("password")} required minLength={6} autoComplete={isReg ? "new-password" : "current-password"} /></label>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <button disabled={loading} className="landing-primary-cta w-full justify-center disabled:opacity-60">
            {loading ? "Please wait…" : isReg ? "Create account" : "Sign in"}
            <span>↗</span>
          </button>
          <p className="text-sm text-muted">
            {isReg ? "Already have an account?" : "New here?"}{" "}
            <Link to={isReg ? "/login" : "/register"} onClick={() => dispatch(clearError())} className="font-medium text-vector hover:underline">
              {isReg ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="text-center text-xs text-[#929b95]">Private by design · Your files stay yours</p>
        </form>
      </section>
    </div>
  );
}
