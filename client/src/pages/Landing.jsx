import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import BrandMark from "../components/BrandMark";

function ArrowIcon({ diagonal = false }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      {diagonal ? (
        <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

const FEATURES = [
  {
    number: "01",
    title: "Your knowledge, connected",
    description: "Drop in your files. Lattice finds the important ideas, people and relationships hiding inside them.",
    icon: "↗",
    tone: "mint",
  },
  {
    number: "02",
    title: "The right search, every time",
    description: "A thoughtful AI agent chooses between semantic document search, your knowledge graph or the live web.",
    icon: "⌘",
    tone: "lavender",
  },
  {
    number: "03",
    title: "Answers with receipts",
    description: "Clear citations show where an answer came from. A self-check helps catch unsupported claims.",
    icon: "✓",
    tone: "peach",
  },
];

const DEMOS = [
  {
    source: "doc",
    q: "What changed after the acquisition?",
    how: "Searched your documents",
    answer: <>Acme’s growth came from its <mark>2023 acquisition of Northstar</mark>, which opened three new markets.</>,
    cite: "Annual report, p. 12",
  },
  {
    source: "graph",
    q: "How are Acme and Northstar connected?",
    how: "Followed your knowledge graph",
    answer: <>Northstar became part of Acme in 2023, and <mark>two leaders now run both teams</mark>.</>,
    cite: "2 connected facts",
  },
  {
    source: "web",
    q: "What is Acme saying publicly this week?",
    how: "Checked the live web",
    answer: <>Acme announced <mark>a third regional office</mark> and a new partnership, based on recent coverage.</>,
    cite: "Live web result",
  },
];

/* All coordinates live in a 960 x 480 space and are mirrored in CSS as percentages */
const SOURCES = [
  { id: "doc", cls: "hz-doc", title: "Annual report.pdf", sub: "28 pages indexed", icon: "PDF", path: "M130 96 C260 96 270 240 400 240" },
  { id: "graph", cls: "hz-graph", title: "Knowledge graph", sub: "12 entities linked", icon: "graph", path: "M130 240 L400 240" },
  { id: "web", cls: "hz-web", title: "Live web search", sub: "Current context", icon: "◎", path: "M130 384 C260 384 270 240 400 240" },
];
const OUT_PATH = "M400 240 L590 240";

const ENTITIES = [
  { name: "Acme", x: 335, y: 52 },
  { name: "New markets", x: 520, y: 60 },
  { name: "Northstar", x: 330, y: 430 },
  { name: "2023 deal", x: 500, y: 430 },
];

const STARS = [
  [40, 40, 2.5, 0], [64, 200, 2, 1.2], [30, 330, 2.5, .6], [74, 452, 2, 2.1],
  [250, 28, 2, 1.6], [262, 150, 2.5, .3], [252, 340, 2, 2.4], [250, 452, 2.5, .9],
  [640, 28, 2.5, 1.9], [706, 84, 2, .4], [900, 40, 2.5, 1.3], [932, 150, 2, 2.2],
  [940, 330, 2.5, .8], [884, 440, 2, 1.7], [742, 462, 2.5, .2], [624, 444, 2, 2.6],
];
const STAR_LINES = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [8, 9], [10, 11], [11, 12], [12, 13], [13, 14], [14, 15]];

function SourceIcon({ icon }) {
  if (icon !== "graph") return <>{icon}</>;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="24" height="24" stroke="currentColor" strokeWidth="1.6">
      <circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" />
      <path d="m8 11 7.8-4M8 13l7.8 4" />
    </svg>
  );
}

function HeroDemo() {
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const demo = DEMOS[index];
  const active = SOURCES.find((s) => s.id === demo.source);
  const graphOn = demo.source === "graph";

  useEffect(() => {
    if (!auto) return undefined;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % DEMOS.length), 6500);
    return () => clearInterval(timer);
  }, [auto]);

  const choose = (i) => { setAuto(false); setIndex(i); };

  return (
    <div className="hz-demo">
      <div className="hz-questions" role="tablist" aria-label="Sample questions">
        {DEMOS.map((item, i) => (
          <button
            key={item.q}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={`hz-q ${i === index ? "hz-q-on" : ""}`}
            onClick={() => choose(i)}
          >
            {item.q}
          </button>
        ))}
      </div>

      <div className="hz-visual" aria-label="Lattice connects your sources to one cited answer">
        <div className="hz-stage">
          <div className="hz-glow" />
          <div className="hz-grid" />

          <svg className="hz-svg" viewBox="0 0 960 480" preserveAspectRatio="none" fill="none" aria-hidden="true">
            {STAR_LINES.map(([a, b]) => (
              <line key={`${a}-${b}`} className="hz-star-line" x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]} />
            ))}
            {STARS.map(([x, y, r, d]) => (
              <circle key={`${x}-${y}`} className="hz-star" cx={x} cy={y} r={r} style={{ animationDelay: `${d}s` }} />
            ))}
            {ENTITIES.map((e) => (
              <line key={e.name} className={`hz-ent-line ${graphOn ? "hz-ent-line-on" : ""}`} x1="400" y1="240" x2={e.x} y2={e.y} />
            ))}

            {SOURCES.map((s) => (
              <path key={s.id} className={`hz-edge hz-edge-${s.id} ${s.id === demo.source ? "hz-edge-on" : ""}`} d={s.path} />
            ))}
            <path className="hz-edge hz-edge-out" d={OUT_PATH} />

            <g key={`flow-${index}`}>
              <path className={`hz-flow hz-flow-${demo.source}`} d={active.path} />
              <circle className={`hz-halo hz-p-${demo.source}`} r="11"><animateMotion dur="2.2s" repeatCount="indefinite" path={active.path} /></circle>
              <circle className={`hz-dotp hz-p-${demo.source}`} r="4.5"><animateMotion dur="2.2s" repeatCount="indefinite" path={active.path} /></circle>
              <path className="hz-flow hz-flow-out" d={OUT_PATH} />
              <circle className="hz-halo hz-p-out" r="11"><animateMotion dur="1.6s" begin="1.1s" repeatCount="indefinite" path={OUT_PATH} /></circle>
              <circle className="hz-dotp hz-p-out" r="4.5"><animateMotion dur="1.6s" begin="1.1s" repeatCount="indefinite" path={OUT_PATH} /></circle>
            </g>
          </svg>

          {ENTITIES.map((e, i) => (
            <span
              key={e.name}
              className={`hz-ent ${graphOn ? "hz-ent-on" : ""}`}
              style={{ left: `${(e.x / 960) * 100}%`, top: `${(e.y / 480) * 100}%`, animationDelay: `${-i * 1.3}s` }}
            >
              {e.name}
            </span>
          ))}

          {SOURCES.map((s) => (
            <div key={s.id} className={`hz-node ${s.cls} ${s.id === demo.source ? "hz-node-on" : ""}`}>
              <span className="hz-node-dot"><SourceIcon icon={s.icon} /></span>
              <span className="hz-node-label">
                <strong>{s.title}</strong>
                <small>{s.sub}</small>
              </span>
            </div>
          ))}

          <div className="hz-hub">
            <span className="hz-hub-ring hz-hub-ring-a" />
            <span className="hz-hub-ring hz-hub-ring-b" />
            <BrandMark />
            <span className="hz-hub-name">AI agent</span>
          </div>
        </div>

        <div className="hz-answer" key={index}>
          <div className="hz-answer-head">
            <span className="hz-answer-who">Lattice</span>
            <span className="hz-grounded">✓ Grounded</span>
          </div>
          <span className="hz-answer-how">{demo.how}</span>
          <p>{demo.answer}<sup>[1]</sup></p>
          <span className="hz-cite">[1] {demo.cite}</span>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const token = useSelector((state) => state.auth.token);
  const appPath = token ? "/app" : "/register";

  return (
    <main className="landing-page min-h-screen overflow-hidden">
      <header className="landing-nav mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Lattice home">
          <BrandMark />
          <span className="text-[19px] font-bold tracking-[-0.06em]">lattice<span className="text-[#659785]">.</span></span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-7" aria-label="Main navigation">
          <a className="hidden text-sm font-medium text-[#68736d] transition hover:text-[#19251f] sm:inline" href="#how-it-works">How it works</a>
          <a className="hidden text-sm font-medium text-[#68736d] transition hover:text-[#19251f] sm:inline" href="#features">Why Lattice</a>
          {token ? (
            <Link to="/app" className="landing-nav-cta">Open workspace <ArrowIcon /></Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-[#27342d] transition hover:text-[#638c7a]">Log in</Link>
              <Link to="/register" className="landing-nav-cta">Get started <ArrowIcon /></Link>
            </>
          )}
        </nav>
      </header>

      {/* ============ HERO v3 ============ */}
      <section className="hz-hero mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:pb-28">
        <div className="hz-copy">
          <h1 className="hz-headline">
            <span>Ask your files anything.</span>
            <span className="hz-headline-soft">Get answers you can check<span className="headline-period">.</span></span>
          </h1>
          <p className="hz-lead">
            Upload your PDFs and text files. Lattice finds the right source, connects the ideas inside them, and cites every answer.
          </p>
          <div className="hz-actions">
            <Link to={appPath} className="landing-primary-cta">
              {token ? "Go to your workspace" : "Start exploring for free"} <ArrowIcon />
            </Link>
            <a href="#how-it-works" className="hz-secondary">See how it works</a>
          </div>
        </div>

        <HeroDemo />
      </section>
      {/* ============ /HERO v3 ============ */}

      <section className="signal-strip border-y border-[#e5e9e3] px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center sm:justify-between">
          <p className="w-full text-[10px] font-bold uppercase tracking-[0.2em] text-[#99a19b] sm:w-auto">A calmer way to find the signal</p>
          <div><span className="strip-mark">◉</span> Meaning, not just keywords</div>
          <div><span className="strip-mark">⌘</span> Connections across your files</div>
          <div><span className="strip-mark">↗</span> Sources you can trust</div>
        </div>
      </section>

      <section id="how-it-works" className="how-section mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-eyebrow justify-center">FROM INFORMATION TO INSIGHT</p>
          <h2 className="section-heading mt-5">Less searching.<br /><span>More connecting.</span></h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6e7972]">Bring your knowledge together. Ask naturally. Follow the answer back to where it came from.</p>
        </div>
        <div className="steps-grid mt-16 grid gap-4 md:grid-cols-3">
          <article className="step-card step-card-upload">
            <div className="step-top"><span>01 / ADD YOUR FILES</span><span className="step-icon">↥</span></div>
            <div className="mini-file-stack"><div className="mini-file"><i>PDF</i><span>Strategy brief.pdf</span><b>Ready</b></div><div className="mini-file mini-file-back"><i>TXT</i><span>Meeting notes.txt</span><b>Ready</b></div></div>
            <h3>Bring it all in.</h3>
            <p>Upload PDFs and text files. Lattice quietly organizes the ideas inside.</p>
          </article>
          <article className="step-card step-card-ask">
            <div className="step-top"><span>02 / ASK YOUR QUESTION</span><span className="step-icon">✳</span></div>
            <div className="mini-question"><span>What changed after the acquisition?</span><b>↗</b></div>
            <div className="mini-route"><span className="mini-route-dot" /> Looking across 4 sources…</div>
            <h3>Ask like a person.</h3>
            <p>No special syntax. Just the question you actually want answered.</p>
          </article>
          <article className="step-card step-card-answer">
            <div className="step-top"><span>03 / FOLLOW THE THREAD</span><span className="step-icon">↗</span></div>
            <div className="mini-graph"><span className="graph-node node-one">Acme</span><span className="graph-node node-two">Northstar</span><span className="graph-node node-three">New markets</span><i className="graph-edge edge-one" /><i className="graph-edge edge-two" /></div>
            <h3>See how it connects.</h3>
            <p>Get a clear answer, useful citations, and a trail back to the source.</p>
          </article>
        </div>
      </section>

      <section id="features" className="features-section px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="landing-eyebrow">A LITTLE MORE CLARITY</p><h2 className="section-heading mt-5">Your knowledge,<br /><span>working together.</span></h2></div>
            <p className="max-w-sm text-[15px] leading-7 text-[#718078]">Lattice is designed to make research feel less like work—and your own information feel a lot more useful.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article key={feature.number} className={`feature-card feature-${feature.tone}`}>
                <div className="flex items-start justify-between"><span className="feature-number">{feature.number}</span><span className="feature-icon">{feature.icon}</span></div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section px-5 py-20 sm:px-8 sm:py-28">
        <div className="closing-card mx-auto max-w-7xl overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="closing-orb orb-a" /><div className="closing-orb orb-b" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <img className="closing-logo-art" src="/Lattice%20Cube%20Glow%20Logo.png" alt="Lattice" />
            <p className="landing-eyebrow mx-auto mt-5 justify-center">YOUR NEXT GOOD QUESTION STARTS HERE</p>
            <h2 className="closing-heading mt-5">Your files have more<br className="hidden sm:block" /> to tell you.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/65 sm:text-base">Bring them together. Find a thread you hadn’t seen. Start with one question.</p>
            <Link to={appPath} className="closing-cta mt-8">{token ? "Open your workspace" : "Create your free account"} <ArrowIcon /></Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 pb-7 text-xs text-[#8a948d] sm:flex-row sm:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[#344139]"><BrandMark /> lattice</Link>
        <span>Made for curious minds. Your knowledge stays yours.</span>
        <div className="flex gap-4"><Link to="/login" className="transition hover:text-[#344139]">Log in</Link><Link to="/register" className="transition hover:text-[#344139]">Get started</Link></div>
      </footer>
    </main>
  );
}