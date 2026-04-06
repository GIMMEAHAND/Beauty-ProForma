import { useState, useEffect, useRef } from "react";

// ─── Supabase (swap in your real keys when ready) ─────────────
// import { supabase } from "./supabaseClient";

// ─── Design tokens ────────────────────────────────────────────
const T = {
  cream:      "#FAF7F2",
  parchment:  "#F3EDE3",
  warmWhite:  "#FDFBF8",
  deepWarm:   "#1C1612",
  surface:    "#F0E9DF",
  teal:       "#59c5c5",
  tealLight:  "#7DD4D4",
  tealDark:   "#3DA8A8",
  tealGlow:   "rgba(89,197,197,0.12)",
  tealBorder: "rgba(89,197,197,0.28)",
  inkDark:    "#1C1612",
  inkMid:     "#4A3F35",
  inkLight:   "#8A7A6A",
  inkFaint:   "#B8ADA0",
  borderSoft: "rgba(28,22,18,0.07)",
  borderMid:  "rgba(28,22,18,0.14)",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,300;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:#FAF7F2;color:#1C1612;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::selection{background:#59c5c5;color:white}
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:#F3EDE3}
  ::-webkit-scrollbar-thumb{background:#59c5c5;border-radius:2px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideL{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
  @keyframes slideR{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
  @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  @keyframes pdot{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
  @keyframes wIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .reveal{opacity:0;transform:translateY(16px);transition:opacity .65s ease,transform .65s ease}
  .reveal.vis{opacity:1;transform:none}
  .btn-t{display:inline-flex;align-items:center;gap:8px;background:#59c5c5;color:white;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;padding:13px 28px;border:none;border-radius:6px;cursor:pointer;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 2px 12px rgba(89,197,197,.26)}
  .btn-t:hover{background:#7DD4D4;transform:translateY(-1px);box-shadow:0 4px 20px rgba(89,197,197,.34)}
  .btn-t:active{transform:scale(.99)}
  .btn-o{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#1C1612;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:13px;padding:12px 28px;border:1.5px solid rgba(28,22,18,.14);border-radius:6px;cursor:pointer;transition:all .2s}
  .btn-o:hover{border-color:#59c5c5;color:#3DA8A8;transform:translateY(-1px)}
  .btn-ow{display:inline-flex;align-items:center;gap:8px;background:transparent;color:white;font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:13px;padding:12px 28px;border:1.5px solid rgba(255,255,255,.3);border-radius:6px;cursor:pointer;transition:all .2s}
  .btn-ow:hover{border-color:rgba(255,255,255,.65);background:rgba(255,255,255,.07);transform:translateY(-1px)}
  .nav-a{font-size:13px;font-weight:500;color:#4A3F35;cursor:pointer;padding-bottom:2px;border-bottom:1.5px solid transparent;transition:color .18s,border-color .18s}
  .nav-a:hover{color:#1C1612;border-color:#59c5c5}
  .clift{transition:transform .25s ease,box-shadow .25s ease}
  .clift:hover{transform:translateY(-4px);box-shadow:0 10px 36px rgba(28,22,18,.1)}
  .si{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#8A7A6A;transition:background .18s,color .18s;border:1px solid transparent}
  .si:hover{background:#F0E9DF;color:#1C1612}
  .si.on{background:rgba(89,197,197,.1);color:#3DA8A8;border-color:rgba(89,197,197,.26)}
  .tanim{animation:fadeIn .3s ease}
  input[type=email]{background:white;border:1.5px solid rgba(28,22,18,.14);color:#1C1612;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;padding:13px 16px;border-radius:6px;outline:none;transition:border-color .2s,box-shadow .2s;width:100%}
  input[type=email]::placeholder{color:#B8ADA0}
  input[type=email]:focus{border-color:#59c5c5;box-shadow:0 0 0 3px rgba(89,197,197,.12)}
`;

// ─── Small components ─────────────────────────────────────────
const Wordmark = ({ size = 18, dark = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <svg width={size + 6} height={size + 6} viewBox="0 0 30 30" fill="none">
      <circle cx="11" cy="15" r="8.5" stroke={T.teal} strokeWidth="2" />
      <circle cx="19" cy="15" r="8.5" stroke={dark ? "white" : T.inkDark} strokeWidth="2" opacity=".45" />
      <circle cx="15" cy="15" r="3.5" fill={T.teal} />
    </svg>
    <span style={{
      fontFamily: "'Fraunces', serif",
      fontWeight: 600, fontSize: size,
      letterSpacing: "-.01em",
      color: dark ? "white" : T.inkDark,
      lineHeight: 1,
    }}>
      Beauty <span style={{ color: T.teal }}>ProForma</span>
    </span>
  </div>
);

const Accent = ({ w = 36 }) => (
  <div style={{
    width: w, height: 3, borderRadius: 2,
    background: `linear-gradient(90deg, ${T.teal}, ${T.tealLight})`,
    marginBottom: 18,
  }} />
);

const Tag = ({ children, light = false }) => (
  <span style={{
    display: "inline-block", fontSize: 11, fontWeight: 600,
    letterSpacing: ".04em", textTransform: "uppercase",
    padding: "4px 10px", borderRadius: 20,
    background: light ? "rgba(255,255,255,.14)" : T.tealGlow,
    color: light ? "rgba(255,255,255,.9)" : T.tealDark,
    border: `1px solid ${light ? "rgba(255,255,255,.22)" : T.tealBorder}`,
  }}>{children}</span>
);

const Check = ({ text, dark = false }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
    <div style={{
      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
      background: dark ? "rgba(89,197,197,.18)" : T.tealGlow,
      border: `1.5px solid ${T.teal}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 6, height: 4,
        borderLeft: `2px solid ${T.teal}`,
        borderBottom: `2px solid ${T.teal}`,
        transform: "rotate(-45deg) translateY(-1px)",
      }} />
    </div>
    <span style={{
      fontSize: 13, fontWeight: 400, lineHeight: 1.5,
      color: dark ? "rgba(255,255,255,.8)" : T.inkMid,
    }}>{text}</span>
  </div>
);

// ─── Ticker ───────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Ghost Money Recovery", "Dignity Clause v1.0",
  "80/20 Revenue Split", "Automatic Task Sync",
  "MetriXs Integration", "SalonFlow Connected",
  "Match Algorithm Live", "100% Content Ownership",
];

const Ticker = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background: T.deepWarm, overflow: "hidden", padding: "11px 0" }}>
      <div style={{
        display: "flex", gap: 48, whiteSpace: "nowrap",
        animation: "ticker 32s linear infinite", width: "max-content",
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontSize: 11, fontWeight: 500, letterSpacing: ".08em",
            textTransform: "uppercase",
            color: i % 4 === 0 ? T.teal : "rgba(255,255,255,.35)",
            display: "flex", alignItems: "center", gap: 9,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: "50%",
              background: T.teal, display: "inline-block", flexShrink: 0,
            }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Nav ──────────────────────────────────────────────────────
const Nav = ({ onEnter }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: 64, display: "flex", alignItems: "center",
      padding: "0 48px", justifyContent: "space-between",
      background: scrolled ? "rgba(250,247,242,0.93)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${T.borderSoft}` : "1px solid transparent",
      transition: "all .35s ease",
    }}>
      <Wordmark size={17} />
      <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
        {["How It Works", "For Pros", "For Managers"].map(l => (
          <span key={l} className="nav-a">{l}</span>
        ))}
      </div>
      <button className="btn-t" onClick={onEnter}
        style={{ padding: "10px 22px", fontSize: 12 }}>
        Enter Workroom →
      </button>
    </nav>
  );
};

// ─── Split Hero ───────────────────────────────────────────────
const SplitHero = ({ onEnter }) => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const join = () => {
    if (!email.includes("@")) return;
    // TODO: supabase.from('waitlist').insert({ email, created_at: new Date() })
    setJoined(true);
  };

  return (
    <section style={{
      minHeight: "100vh", display: "grid",
      gridTemplateColumns: "1fr 1fr",
      paddingTop: 64, position: "relative",
    }}>
      {/* Pro side */}
      <div style={{
        background: T.warmWhite,
        padding: "80px 52px 100px 60px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        borderRight: `1px solid ${T.borderSoft}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", bottom: -90, left: -90,
          width: 340, height: 340, borderRadius: "50%",
          background: T.tealGlow, border: `1px solid ${T.tealBorder}`,
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", animation: "slideL .9s ease both" }}>
          <Tag>For Salon Pros</Tag>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(32px, 4.5vw, 50px)",
            fontWeight: 400, lineHeight: 1.1,
            letterSpacing: "-.02em",
            marginTop: 16, marginBottom: 20, color: T.inkDark,
          }}>
            Your talent deserves<br />
            <em style={{ color: T.teal, fontStyle: "italic" }}>a business partner.</em>
          </h1>
          <p style={{
            fontSize: 15, lineHeight: 1.8, color: T.inkMid,
            fontWeight: 300, marginBottom: 32, maxWidth: 400,
          }}>
            You're a creator, a specialist, an artist — and somehow also the
            accountant, scheduler, marketer, and negotiator. ProForma finds you
            the back-office partner who handles all of that, while you keep
            100% of your content.
          </p>
          {[
            "Ghost money found and recovered",
            "80/20 revenue split, automatic",
            "Your content — before, during, and after",
          ].map(t => <Check key={t} text={t} />)}
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-t" onClick={onEnter}>I'm a Pro →</button>
            <button className="btn-o"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Manager side */}
      <div style={{
        background: T.deepWarm,
        padding: "80px 60px 100px 52px",
        display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 280, height: 280, borderRadius: "50%",
          background: "rgba(89,197,197,.07)",
          border: "1px solid rgba(89,197,197,.13)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", inset: 0, opacity: .03,
          backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,.5) 0px,rgba(255,255,255,.5) 1px,transparent 1px,transparent 40px)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", animation: "slideR .9s ease both" }}>
          <Tag light>For Digital Managers</Tag>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(32px, 4.5vw, 50px)",
            fontWeight: 400, lineHeight: 1.1,
            letterSpacing: "-.02em",
            marginTop: 16, marginBottom: 20, color: "white",
          }}>
            Your expertise has<br />
            <em style={{ color: T.teal, fontStyle: "italic" }}>a new home.</em>
          </h1>
          <p style={{
            fontSize: 15, lineHeight: 1.8,
            color: "rgba(255,255,255,.58)",
            fontWeight: 300, marginBottom: 32, maxWidth: 400,
          }}>
            The 12% displacement rate didn't erase your skills — it redirected
            them. Your L'Oréal strategy experience, your Amazon marketplace
            knowledge — the beauty creator economy needs exactly that, right now.
          </p>
          {[
            "Matched to Pros with your exact skill gaps",
            "Verified displacement background matters here",
            "Transparent retainer + revenue share model",
          ].map(t => <Check key={t} text={t} dark />)}
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn-t" onClick={onEnter}>I'm a Manager →</button>
            <button className="btn-ow"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Floating email strip */}
      <div style={{
        position: "absolute", bottom: 0, left: "50%",
        transform: "translateX(-50%)", width: 380,
        background: "white", borderRadius: "12px 12px 0 0",
        padding: "20px 24px",
        boxShadow: "0 -4px 28px rgba(28,22,18,.12)",
        border: `1px solid ${T.borderSoft}`, borderBottom: "none",
        zIndex: 10,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 600, textAlign: "center",
          color: T.inkLight, letterSpacing: ".06em",
          textTransform: "uppercase", marginBottom: 12,
        }}>Join the beta waitlist</p>
        {joined ? (
          <div style={{
            textAlign: "center", color: T.tealDark,
            fontSize: 14, fontWeight: 500,
            padding: "8px 0", animation: "fadeIn .3s ease",
          }}>
            ✓ You're on the list — we'll be in touch.
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            <input
              type="email" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && join()}
              style={{ borderRadius: "6px 0 0 6px", borderRight: "none", flex: 1 }}
            />
            <button className="btn-t" onClick={join}
              style={{ borderRadius: "0 6px 6px 0", whiteSpace: "nowrap", padding: "13px 18px", fontSize: 12 }}>
              Request Access
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Stats ────────────────────────────────────────────────────
const Stats = () => (
  <section style={{
    background: T.parchment,
    borderTop: `1px solid ${T.borderSoft}`,
    borderBottom: `1px solid ${T.borderSoft}`,
    padding: "56px 48px",
  }}>
    <div style={{
      maxWidth: 1060, margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "30px 40px",
    }}>
      {[
        ["$84K",  "Average ghost money recovered per Pro, year one"],
        ["80/20", "Revenue split — Pro always takes the majority"],
        ["100%",  "Content ownership retained by the Pro, always"],
        ["48hr",  "Content removal window after partnership ends"],
      ].map(([n, l]) => (
        <div key={n} className="reveal">
          <div style={{
            fontFamily: "'Fraunces', serif", fontSize: 44,
            fontWeight: 600, color: T.teal, lineHeight: 1, marginBottom: 8,
          }}>{n}</div>
          <div style={{
            fontSize: 13, color: T.inkMid, lineHeight: 1.6,
            borderLeft: `3px solid ${T.tealBorder}`, paddingLeft: 12,
          }}>{l}</div>
        </div>
      ))}
    </div>
  </section>
);

// ─── How It Works ─────────────────────────────────────────────
const How = () => (
  <section id="how" style={{ padding: "112px 48px", maxWidth: 1060, margin: "0 auto" }}>
    <div className="reveal" style={{ marginBottom: 64 }}>
      <Accent />
      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "clamp(30px, 4.5vw, 48px)",
        fontWeight: 400, lineHeight: 1.15,
        letterSpacing: "-.015em", color: T.inkDark,
      }}>How the partnership works</h2>
      <p style={{
        fontSize: 15, color: T.inkMid,
        marginTop: 12, maxWidth: 480, lineHeight: 1.7,
      }}>Four steps from solo creator to fully-supported business.</p>
    </div>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: 20,
    }}>
      {[
        ["01", "MetriXs reads your value", "We pull your engagement data and compute your exact opportunity gap — what your audience is worth vs. what you're currently earning.", "Identify"],
        ["02", "The algorithm finds your match", "Displaced corporate talent with your specific back-office skill gaps surfaces at the top of your feed. Match scores based on real coverage.", "Match"],
        ["03", "Sign the Dignity Clause", "Before a single task is assigned, both parties sign a binding agreement: you own your content permanently, regardless of what happens to the partnership.", "Protect"],
        ["04", "The suite runs the business", "SalonFlow schedules posts. Tasks auto-appear in ProForma. Revenue splits on every sale. No screenshots. No chasing.", "Execute"],
      ].map(([n, t, b, tg]) => (
        <div key={n} className="reveal clift" style={{
          background: "white", borderRadius: 12,
          border: `1px solid ${T.borderSoft}`,
          padding: "32px 28px", cursor: "default",
          boxShadow: "0 2px 8px rgba(28,22,18,.05)",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: 24,
          }}>
            <span style={{
              fontFamily: "'Fraunces', serif", fontSize: 42,
              fontWeight: 300, color: T.teal, lineHeight: 1, opacity: .38,
            }}>{n}</span>
            <Tag>{tg}</Tag>
          </div>
          <h3 style={{
            fontFamily: "'Fraunces', serif", fontSize: 20,
            fontWeight: 400, color: T.inkDark,
            lineHeight: 1.3, marginBottom: 12,
          }}>{t}</h3>
          <p style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.75 }}>{b}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── Dignity Clause callout ───────────────────────────────────
const Dignity = () => (
  <section className="reveal" style={{
    background: T.deepWarm, padding: "96px 48px",
    textAlign: "center", position: "relative", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      width: 500, height: 500, borderRadius: "50%",
      border: "1px solid rgba(89,197,197,.07)", pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      width: 280, height: 280, borderRadius: "50%",
      border: "1px solid rgba(89,197,197,.11)", pointerEvents: "none",
    }} />
    <div style={{ maxWidth: 620, margin: "0 auto", position: "relative" }}>
      <div style={{ marginBottom: 24 }}>
        <Tag light>The Dignity Clause · v1.0</Tag>
      </div>
      <blockquote style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "clamp(19px, 3vw, 27px)",
        fontWeight: 300, fontStyle: "italic",
        lineHeight: 1.65, color: "white", marginBottom: 24,
      }}>
        "The Pro retains 100% sole and exclusive ownership of all original
        content she creates — regardless of whether the partnership ends,
        is disputed, or is terminated."
      </blockquote>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,.36)", letterSpacing: ".04em" }}>
        Binding. Versioned. Signed before work begins.
      </p>
    </div>
  </section>
);

// ─── Bottom CTA ───────────────────────────────────────────────
const BottomCTA = ({ onEnter }) => (
  <section style={{
    padding: "112px 48px", textAlign: "center",
    background: T.warmWhite, borderTop: `1px solid ${T.borderSoft}`,
  }}>
    <div className="reveal" style={{ maxWidth: 560, margin: "0 auto" }}>
      <Accent width={24} />
      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "clamp(32px, 5vw, 54px)",
        fontWeight: 400, lineHeight: 1.12,
        letterSpacing: "-.018em", color: T.inkDark, marginBottom: 20,
      }}>
        Your work is worth more<br />
        <em style={{ color: T.teal }}>than you've been paid.</em>
      </h2>
      <p style={{
        fontSize: 15, color: T.inkMid, lineHeight: 1.75, marginBottom: 40,
      }}>
        Enter the Workroom and see exactly what's been left on the table.
      </p>
      <button className="btn-t" onClick={onEnter}
        style={{ padding: "15px 40px", fontSize: 14 }}>
        Enter Workroom →
      </button>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    padding: "32px 48px", background: T.deepWarm,
    display: "flex", alignItems: "center",
    justifyContent: "space-between", flexWrap: "wrap", gap: 14,
  }}>
    <Wordmark size={15} dark />
    <p style={{
      fontFamily: "'Fraunces', serif", fontStyle: "italic",
      fontSize: 13, color: "rgba(255,255,255,.32)",
      textAlign: "center", flex: 1,
    }}>
      Protected by the Dignity Clause v1.0 — all original content remains the creator's, in perpetuity.
    </p>
    <span style={{ fontSize: 11, color: "rgba(255,255,255,.18)", letterSpacing: ".06em" }}>
      © 2025 Beauty ProForma
    </span>
  </footer>
);

// ─── Workroom tabs config ─────────────────────────────────────
const TABS = [
  { id: "vault",    icon: "◫", label: "Asset Vault" },
  { id: "match",   icon: "◎", label: "Match Algorithm" },
  { id: "earnings", icon: "◈", label: "Earnings" },
  { id: "tasks",   icon: "≡", label: "Task Ledger" },
  { id: "clause",  icon: "§", label: "Dignity Clause" },
];

// ─── Workroom tab panels ──────────────────────────────────────
const Panels = {
  vault: () => (
    <div style={{ padding: "40px 48px" }}>
      <Accent />
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, color: T.inkDark, marginBottom: 8 }}>
        Asset Vault
      </h2>
      <p style={{ fontSize: 14, color: T.inkMid, marginBottom: 36, lineHeight: 1.7 }}>
        Raw uploads from the Pro. Processed assets from the Manager. Every file governed by the Dignity Clause.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 14 }}>
        {[
          ["🎬", "Balayage Tutorial", "raw",       "2.4 GB"],
          ["📌", "5-Pin Carousel",    "processed", "4.2 MB"],
          ["📸", "Rose Gold — B/A",   "raw",       "18 MB"],
          ["🛍️", "Digital Formula",   "processed", "890 KB"],
        ].map(([ic, lb, tr, sz]) => (
          <div key={lb} className="clift" style={{
            background: "white", borderRadius: 10,
            border: `1px solid ${T.borderSoft}`,
            padding: 18, cursor: "pointer",
            boxShadow: "0 1px 4px rgba(28,22,18,.05)",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{ic}</div>
            <div style={{ fontSize: 13, color: T.inkDark, fontWeight: 500, marginBottom: 3 }}>{lb}</div>
            <div style={{ fontSize: 11, color: T.inkLight, marginBottom: 10 }}>{sz}</div>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
              background: tr === "raw" ? T.tealGlow : T.surface,
              color: tr === "raw" ? T.tealDark : T.inkLight,
              border: `1px solid ${tr === "raw" ? T.tealBorder : T.borderSoft}`,
              letterSpacing: ".05em", textTransform: "uppercase",
            }}>{tr}</span>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 28, padding: "14px 18px", borderRadius: 8,
        background: T.tealGlow, border: `1px solid ${T.tealBorder}`,
        fontSize: 13, color: T.tealDark, fontWeight: 500,
      }}>
        → Connect Supabase to load real vault assets from your partnership
      </div>
    </div>
  ),

  match: () => (
    <div style={{ padding: "40px 48px" }}>
      <Accent />
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, color: T.inkDark, marginBottom: 8 }}>
        Match Algorithm
      </h2>
      <p style={{ fontSize: 14, color: T.inkMid, marginBottom: 36, lineHeight: 1.7 }}>
        Opportunity scores from MetriXs engagement data. High score = high reach, low monetization.
      </p>
      {[
        ["Toni Beauchamp",   98, "TikTok",    "620K", "$18K/yr", "Brand Partnerships · Affiliate · TikTok Shop"],
        ["Kezia Okafor",     93, "YouTube",   "310K", "$28K/yr", "SEO · Etsy · Email Marketing"],
        ["Dominique Ellis",  87, "Instagram", "184K", "$62K/yr", "Pinterest · Affiliate Strategy"],
      ].map(([n, sc, pl, re, rv, g]) => (
        <div key={n} className="clift" style={{
          background: "white", border: `1px solid ${T.borderSoft}`,
          borderRadius: 10, padding: "18px 22px", marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, boxShadow: "0 1px 4px rgba(28,22,18,.05)",
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.inkDark, marginBottom: 3 }}>{n}</div>
            <div style={{ fontSize: 12, color: T.inkMid }}>{pl} · {re} reach · {rv}</div>
            <div style={{ fontSize: 12, color: T.tealDark, fontWeight: 500, marginTop: 5 }}>Needs: {g}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 38, fontWeight: 600, color: T.teal, lineHeight: 1 }}>{sc}</div>
            <div style={{ fontSize: 10, color: T.inkFaint, letterSpacing: ".07em", textTransform: "uppercase" }}>opp score</div>
          </div>
        </div>
      ))}
    </div>
  ),

  earnings: () => (
    <div style={{ padding: "40px 48px" }}>
      <Accent />
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, color: T.inkDark, marginBottom: 36 }}>
        Sovereignty Engine
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, marginBottom: 32 }}>
        {[
          ["Digital Sales (Pro share)", "$1,310", T.teal],
          ["Manager retainer",          "$150",   T.inkDark],
          ["Ghost recovered",           "$128",   T.teal],
          ["Unclaimed — action needed", "$747",   "#DC3545"],
        ].map(([l, v, c]) => (
          <div key={l} style={{
            background: "white", border: `1px solid ${T.borderSoft}`,
            borderRadius: 10, padding: "18px 20px",
            boxShadow: "0 1px 4px rgba(28,22,18,.05)",
          }}>
            <div style={{
              fontSize: 11, color: T.inkLight, letterSpacing: ".05em",
              textTransform: "uppercase", fontWeight: 600, marginBottom: 8,
            }}>{l}</div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 600, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{
        padding: "14px 18px", background: T.tealGlow,
        border: `1px solid ${T.tealBorder}`, borderRadius: 8,
        fontSize: 13, color: T.tealDark, fontWeight: 500,
      }}>
        → Connect Stripe + Supabase to activate live payouts and real-time splits
      </div>
    </div>
  ),

  tasks: () => (
    <div style={{ padding: "40px 48px" }}>
      <Accent />
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, color: T.inkDark, marginBottom: 8 }}>
        Task Ledger
      </h2>
      <p style={{ fontSize: 14, color: T.inkMid, marginBottom: 36, lineHeight: 1.7 }}>
        Every Manager action is logged here. SalonFlow posts auto-appear the moment they're scheduled.
      </p>
      {[
        ["Scheduled 5 pins in SalonFlow",    "Pinterest", "Verified",  "SalonFlow Auto", T.teal],
        ["Optimized 3 Etsy listings w/ SEO", "SEO",       "Submitted", "Manual",         "#2563EB"],
        ["Set up Amazon affiliate links",    "Affiliate", "Pending",   "Manual",         "#D97706"],
      ].map(([t, c, s, src, col]) => (
        <div key={t} style={{
          background: "white", border: `1px solid ${T.borderSoft}`,
          borderRadius: 10, padding: "14px 20px", marginBottom: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 4px rgba(28,22,18,.04)",
        }}>
          <div>
            <div style={{ fontSize: 13, color: T.inkDark, fontWeight: 500, marginBottom: 3 }}>{t}</div>
            <div style={{ fontSize: 11, color: T.inkLight }}>{c} · {src}</div>
          </div>
          <span style={{
            fontSize: 10, padding: "4px 10px", borderRadius: 20, fontWeight: 600,
            background: `${col}15`, color: col, border: `1px solid ${col}44`,
            letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap",
          }}>{s}</span>
        </div>
      ))}
    </div>
  ),

  clause: () => (
    <div style={{ padding: "40px 48px", maxWidth: 640 }}>
      <Accent />
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 34, fontWeight: 400, color: T.inkDark, marginBottom: 6 }}>
        Dignity Clause
      </h2>
      <div style={{
        fontSize: 11, color: T.tealDark, letterSpacing: ".08em",
        textTransform: "uppercase", fontWeight: 600, marginBottom: 32,
      }}>
        Version 1.0 · Both parties signed ✓
      </div>
      {[
        ["Article 1 — Original content ownership",
         "The Pro retains 100% sole and exclusive ownership of all original content she creates — including photographs, video recordings, tutorials, and branding elements — regardless of whether the partnership continues."],
        ["Article 2 — Manager's limited license",
         "Upon termination, the Manager must cease all use of the Pro's content and likeness within 48 hours, and delete or return all copies within 7 days of written request."],
        ["Article 3 — Revenue & attribution",
         "Affiliate and monetization revenue generated from the Pro's content belongs to the Pro. The Manager may never sublicense, sell, or claim authorship of any original content."],
        ["Article 5 — Supremacy",
         "This Clause supersedes any conflicting term in any other agreement between the Pro and Manager, without exception."],
      ].map(([h, b]) => (
        <div key={h} style={{ borderLeft: `3px solid ${T.tealBorder}`, paddingLeft: 18, marginBottom: 26 }}>
          <div style={{
            fontSize: 12, color: T.tealDark, fontWeight: 600,
            letterSpacing: ".03em", marginBottom: 6,
          }}>{h}</div>
          <p style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.75 }}>{b}</p>
        </div>
      ))}
    </div>
  ),
};

// ─── Workroom Shell ───────────────────────────────────────────
const Workroom = ({ onBack }) => {
  const [tab, setTab] = useState("vault");
  const Panel = Panels[tab];

  return (
    <div style={{
      minHeight: "100vh", background: T.cream,
      display: "flex", flexDirection: "column",
      animation: "wIn .4s ease",
    }}>
      {/* Topbar */}
      <div style={{
        height: 58, display: "flex", alignItems: "center",
        padding: "0 24px", borderBottom: `1px solid ${T.borderSoft}`,
        justifyContent: "space-between", background: "white",
        boxShadow: "0 1px 4px rgba(28,22,18,.06)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Wordmark size={16} />
          <span style={{ color: T.borderMid, margin: "0 4px" }}>/</span>
          <span style={{ fontSize: 13, color: T.inkLight, fontWeight: 500 }}>Workroom</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 12, color: T.tealDark, fontWeight: 600,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: T.teal, animation: "pdot 2s ease infinite",
            }} />
            Active Partnership
          </div>
          <button className="btn-o" onClick={onBack}
            style={{ padding: "7px 16px", fontSize: 12 }}>
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: 220, borderRight: `1px solid ${T.borderSoft}`,
          background: T.warmWhite, padding: "24px 12px",
          display: "flex", flexDirection: "column", gap: 4,
          flexShrink: 0,
        }}>
          <div style={{
            fontSize: 10, color: T.inkFaint, letterSpacing: ".1em",
            textTransform: "uppercase", fontWeight: 600,
            padding: "0 10px", marginBottom: 10,
          }}>Navigation</div>
          {TABS.map(({ id, icon, label }) => (
            <div key={id} className={`si${tab === id ? " on" : ""}`}
              onClick={() => setTab(id)}>
              <span style={{ fontSize: 14, opacity: .75 }}>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
          <div style={{
            marginTop: "auto", padding: "14px 10px 0",
            borderTop: `1px solid ${T.borderSoft}`,
          }}>
            <div style={{
              fontSize: 11, color: T.tealDark, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }} />
              Dignity Clause v1.0
            </div>
            <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 4, lineHeight: 1.5 }}>
              Content owned by the Pro. Always.
            </div>
          </div>
        </div>

        {/* Panel */}
        <div style={{ flex: 1, overflowY: "auto", background: T.cream }}
          className="tanim">
          <Panel />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: `1px solid ${T.borderSoft}`, padding: "14px 32px",
        background: "white", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
      }}>
        <p style={{
          fontFamily: "'Fraunces', serif", fontStyle: "italic",
          fontSize: 13, color: T.inkFaint, textAlign: "center",
        }}>
          Protected by the Dignity Clause v1.0 — all original content remains the creator's property, in perpetuity.
        </p>
      </div>
    </div>
  );
};

// ─── Landing ──────────────────────────────────────────────────
const Landing = ({ onEnter }) => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: .1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: T.cream }}>
      <Nav onEnter={onEnter} />
      <Ticker />
      <SplitHero onEnter={onEnter} />
      <Stats />
      <How />
      <Dignity />
      <BottomCTA onEnter={onEnter} />
      <Footer />
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing");

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = STYLES;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  return view === "landing"
    ? <Landing onEnter={() => setView("workroom")} />
    : <Workroom onBack={() => setView("landing")} />;
}import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

// ─── DESIGN SYSTEM ────────────────────────────────────────────
const T = {
  cream:      "#FAF7F2",
  parchment:  "#F3EDE3",
  warmWhite:  "#FDFBF8",
  deepWarm:   "#1C1612",
  surface:    "#F0E9DF",
  teal:       "#59c5c5",
  tealLight:  "#7DD4D4",
  tealDark:   "#3DA8A8",
  tealGlow:   "rgba(89,197,197,0.12)",
  tealBorder: "rgba(89,197,197,0.28)",
  inkDark:    "#1C1612",
  inkMid:     "#4A3F35",
  inkLight:   "#8A7A6A",
  inkFaint:   "#B8ADA0",
  borderSoft: "rgba(28,22,18,0.07)",
  borderMid:  "rgba(28,22,18,0.14)",
};

// ─── UI COMPONENTS ───────────────────────────────────────────

const Nav = ({ onEnter }) => (
  <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, background: 'rgba(250,247,242,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.borderSoft}`, padding: '0 40px' }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontWeight: '700', fontSize: '20px', letterSpacing: '-0.03em', color: T.inkDark }}>BEAUTY <span style={{ color: T.teal }}>PROFORMA</span></div>
      <button onClick={onEnter} style={{ padding: '12px 28px', borderRadius: '100px', background: T.inkDark, color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>Enter Workroom</button>
    </div>
  </nav>
);

const Landing = ({ onEnter }) => (
  <main style={{ background: T.cream, minHeight: '100vh', paddingTop: '160px' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
      <span style={{ color: T.teal, fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '13px' }}>The Sovereign Foundation</span>
      <h1 style={{ fontSize: '84px', fontFamily: 'serif', color: T.inkDark, lineHeight: 0.9, margin: '24px 0 32px' }}>Build your empire <br/> in high-definition.</h1>
      <p style={{ fontSize: '21px', color: T.inkMid, maxWidth: '600px', margin: '0 auto 48px', lineHeight: 1.5 }}>A premium digital suite designed exclusively for elite beauty professionals.</p>
      <button onClick={onEnter} style={{ padding: '24px 56px', fontSize: '18px', background: T.teal, color: 'white', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: '700', boxShadow: `0 20px 40px ${T.tealGlow}` }}>Start Your Journey</button>
    </div>
  </main>
);

const Workroom = ({ onBack }) => (
  <div style={{ minHeight: '100vh', background: T.deepWarm, color: 'white', display: 'flex' }}>
    <aside style={{ width: '300px', borderRight: `1px solid ${T.borderMid}`, padding: '40px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.teal, cursor: 'pointer', marginBottom: '60px' }}>← Back</button>
      <div style={{ marginBottom: '40px', fontSize: '14px', color: T.inkFaint }}>DASHBOARD</div>
      <div style={{ padding: '12px 0', color: T.teal, fontWeight: '600' }}>Active Suite</div>
      <div style={{ padding: '12px 0', opacity: 0.5 }}>Analytics</div>
      <div style={{ padding: '12px 0', opacity: 0.5 }}>Settings</div>
    </aside>
    <main style={{ flex: 1, padding: '80px' }}>
      <h2 style={{ fontSize: '40px', fontFamily: 'serif', marginBottom: '12px' }}>Welcome, Professional.</h2>
      <p style={{ color: T.inkFaint, fontSize: '18px' }}>Your empire is currently being optimized.</p>
      <div style={{ marginTop: '60px', height: '400px', border: `1px dashed ${T.tealBorder}`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.teal }}>
        Workroom Interface Initializing...
      </div>
    </main>
  </div>
);

// ─── MAIN APP LOGIC ───────────────────────────────────────────

function App() {
  const [view, setView] = useState("landing");

  return (
    <>
      <Nav onEnter={() => setView("workroom")} />
      {view === "landing" ? (
        <Landing onEnter={() => setView("workroom")} />
      ) : (
        <Workroom onBack={() => setView("landing")} />
      )}
    </>
  );
}

// ─── THE IGNITION SWITCH ──────────────────────────────────────
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
