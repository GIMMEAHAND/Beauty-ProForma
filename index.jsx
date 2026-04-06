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
            "Verified
