import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

// ─── DESIGN TOKENS ────────────────────────────────────────────
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

// ─── COMPONENTS ───────────────────────────────────────────────

const Wordmark = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `linear-gradient(135deg, ${T.teal}, ${T.tealDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '10px', height: '10px', border: '1.5px solid white', borderRadius: '1px' }} />
    </div>
    <span style={{ fontWeight: '600', letterSpacing: '-0.02em', fontSize: '18px', color: T.inkDark }}>
      BEAUTY <span style={{ color: T.inkLight, fontWeight: '400' }}>PROFORMA</span>
    </span>
  </div>
);

const Nav = ({ onEnter }) => (
  <nav style={{ position: 'fixed', top: 0, width: '100%', z_index: 1000, background: 'rgba(250,247,242,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.borderSoft}`, padding: '0 40px' }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Wordmark />
      <button 
        onClick={onEnter}
        style={{ padding: '12px 24px', borderRadius: '100px', background: T.inkDark, color: 'white', border: 'none', fontWeight: '500', cursor: 'pointer' }}
      >
        Enter Workroom
      </button>
    </div>
  </nav>
);

const Landing = ({ onEnter }) => (
  <div style={{ paddingTop: '80px', background: T.cream }}>
    <header style={{ padding: '120px 40px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '72px', color: T.inkDark, marginBottom: '24px', fontFamily: 'serif' }}>The High-End Suite for Beauty Professionals.</h1>
      <p style={{ fontSize: '20px', color: T.inkMid, lineHeight: 1.6, marginBottom: '40px' }}>Elevate your business with the Sovereign Foundation.</p>
      <button 
        onClick={onEnter}
        style={{ padding: '20px 48px', fontSize: '18px', background: T.teal, color: 'white', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
      >
        Start Your Empire
      </button>
    </header>
  </div>
);

const Workroom = ({ onBack }) => (
  <div style={{ minHeight: '100vh', background: T.inkDark, color: 'white', padding: '60px' }}>
    <button onClick={onBack} style={{ color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginBottom: '40px' }}>← Return to Landing</button>
    <h1 style={{ fontSize: '48px', color: T.teal }}>Your Workroom</h1>
    <p style={{ color: T.inkFaint }}>The suite is loading...</p>
  </div>
);

// ─── MAIN APP LOGIC ───────────────────────────────────────────

function App() {
  const [view, setView] = useState("landing");

  return (
    <div style={{ minHeight: "100vh", background: T.cream }}>
      <Nav onEnter={() => setView("workroom")} />
      {view === "landing" ? (
        <Landing onEnter={() => setView("workroom")} />
      ) : (
        <Workroom onBack={() => setView("landing")} />
      )}
    </div>
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
