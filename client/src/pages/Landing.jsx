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

      <section className="landing-hero mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div className="hero-copy relative z-10">
          <div className="landing-eyebrow"><span className="eyebrow-pulse" /> YOUR SECOND BRAIN, FINALLY ORGANIZED</div>
          <h1 className="landing-headline mt-6 max-w-2xl text-[clamp(3.35rem,7.6vw,6.6rem)] font-semibold leading-[0.94] tracking-[-0.085em]">
            Make sense of
            <br />
            <span className="headline-serif">everything</span>
            <br />
            you know<span className="headline-period">.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-[#65716a] sm:text-lg sm:leading-8">
            Your documents have the answers. Lattice connects the dots, finds the right source and shows its work—so you can get to the good part.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to={appPath} className="landing-primary-cta">
              {token ? "Go to your workspace" : "Start exploring for free"} <ArrowIcon />
            </Link>
            <a href="#how-it-works" className="landing-text-link">See how it works <span>↓</span></a>
          </div>
          <div className="mt-9 flex items-center gap-3 text-xs font-medium text-[#78837c]">
            <div className="avatar-stack" aria-hidden="true"><span>L</span><span>✳</span><span>↗</span></div>
            <span>Your files stay yours. Your ideas, connected.</span>
          </div>
        </div>

        <div className="hero-visual relative mx-auto w-full max-w-[650px]" aria-label="Illustration of Lattice connecting sources to a cited answer">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-glow" />
          <div className="visual-caption"><span className="caption-dot" /> ONE QUESTION. THE WHOLE PICTURE.</div>
          <div className="source-card source-card-doc">
            <span className="source-icon doc-icon">PDF</span>
            <span><strong>Annual report.pdf</strong><small>28 pages · just indexed</small></span>
            <span className="source-check">✓</span>
          </div>
          <div className="source-card source-card-graph">
            <span className="source-icon graph-icon">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="6" r="2.2" /><circle cx="18" cy="18" r="2.2" /><path d="m8 11 7.8-4M8 13l7.8 4" /></svg>
            </span>
            <span><strong>Knowledge graph</strong><small>12 entities connected</small></span>
            <span className="source-check">↗</span>
          </div>
          <div className="source-card source-card-web">
            <span className="source-icon web-icon">◎</span>
            <span><strong>Live web search</strong><small>Current context found</small></span>
            <span className="web-live">LIVE</span>
          </div>

          <svg className="connection-lines" viewBox="0 0 650 500" fill="none" aria-hidden="true">
            <path className="flow-line line-doc" d="M132 113 C206 113 199 188 280 201" />
            <path className="flow-line line-graph" d="M121 249 C195 249 213 249 280 249" />
            <path className="flow-line line-web" d="M132 384 C206 384 199 310 280 297" />
            <path className="answer-flow" d="M365 249 C418 249 406 249 463 249" />
            <circle className="flow-particle particle-a" r="4"><animateMotion dur="3.1s" repeatCount="indefinite" path="M132 113 C206 113 199 188 280 201" /></circle>
            <circle className="flow-particle particle-b" r="4"><animateMotion dur="2.6s" repeatCount="indefinite" path="M121 249 C195 249 213 249 280 249" /></circle>
            <circle className="flow-particle particle-c" r="4"><animateMotion dur="3.4s" repeatCount="indefinite" path="M132 384 C206 384 199 310 280 297" /></circle>
          </svg>

          <div className="agent-core">
            <div className="core-ring ring-back" />
            <div className="core-ring ring-front" />
            <BrandMark />
            <span>AI AGENT</span>
          </div>
          <div className="answer-card">
            <div className="answer-topline"><span className="answer-spark">✳</span><span>YOUR ANSWER</span><span className="answer-verified">✓ GROUNDED</span></div>
            <p>Acme’s growth came from its <em>2023 acquisition</em> of Northstar, expanding into three new markets.<sup>[1][2]</sup></p>
            <div className="answer-source-row"><span>[1] Annual report, p. 12</span><span>[2] 2 connected facts</span></div>
          </div>
          <div className="floating-note note-top"><span>✦</span> Found the connection</div>
          <div className="floating-note note-bottom"><span>↗</span> Three sources checked</div>
        </div>
      </section>

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
