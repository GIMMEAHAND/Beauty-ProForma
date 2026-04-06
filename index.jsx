import React, { useState, useEffect, useRef } from "react";
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
