import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

// ─── DESIGN SYSTEM ────────────────────────────────────────────
const T = {
  cream: "#FAF7F2",
  inkDark: "#1C1612",
  inkMid: "#4A3F35",
  teal: "#59c5c5",
  tealGlow: "rgba(89,197,197,0.12)",
  borderSoft: "rgba(28,22,18,0.07)",
};

// ─── LANDING COMPONENTS ───────────────────────────────────────
const Nav = ({ onEnter }) => (
  <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 1000, background: 'rgba(250,247,242,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.borderSoft}`, padding: '0 40px', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div style={{ fontWeight: '700', fontSize: '20px', color: T.inkDark }}>BEAUTY <span style={{ color: T.teal }}>PROFORMA</span></div>
    <button onClick={onEnter} style={{ padding: '12px 28px', borderRadius: '100px', background: T.inkDark, color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Enter Workroom</button>
  </nav>
);

const Landing = ({ onEnter }) => (
  <main style={{ background: T.cream, minHeight: '100vh', paddingTop: '160px', textAlign: 'center' }}>
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px' }}>
      <h1 style={{ fontSize: '72px', fontFamily: 'serif', color: T.inkDark, lineHeight: 1.1, marginBottom: '32px' }}>Build your empire <br/> in high-definition.</h1>
      <button onClick={onEnter} style={{ padding: '24px 56px', fontSize: '18px', background: T.teal, color: 'white', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: '700', boxShadow: `0 20px 40px ${T.tealGlow}` }}>Start Your Journey</button>
    </div>
  </main>
);

// ─── THE ACTUAL WORKROOM (The Functionality) ──────────────────
const Workroom = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', borderRight: '1px solid #222', padding: '40px', display: 'flex', flexDirection: 'column' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.teal, cursor: 'pointer', marginBottom: '60px', textAlign: 'left' }}>← Exit to Landing</button>
        <div style={{ fontSize: '12px', color: '#666', letterSpacing: '0.1em', marginBottom: '20px' }}>MAIN SUITE</div>
        <div onClick={() => setActiveTab("overview")} style={{ padding: '12px 0', color: activeTab === "overview" ? T.teal : "#888", cursor: 'pointer' }}>Empire Overview</div>
        <div onClick={() => setActiveTab("clients")} style={{ padding: '12px 0', color: activeTab === "clients" ? T.teal : "#888", cursor: 'pointer' }}>Client Registry</div>
        <div onClick={() => setActiveTab("revenue")} style={{ padding: '12px 0', color: activeTab === "revenue" ? T.teal : "#888", cursor: 'pointer' }}>Revenue Stream</div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '80px' }}>
        <header style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '32px', fontFamily: 'serif' }}>Workroom: {activeTab.toUpperCase()}</h2>
          <p style={{ color: '#666' }}>Managing your professional foundation.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {/* Action Cards */}
          <div style={{ background: '#161616', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
            <h4 style={{ color: T.teal, marginBottom: '10px' }}>Daily Revenue</h4>
            <div style={{ fontSize: '24px' }}>$1,240.00</div>
          </div>
          <div style={{ background: '#161616', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
            <h4 style={{ color: T.teal, marginBottom: '10px' }}>Appointments</h4>
            <div style={{ fontSize: '24px' }}>8 Pending</div>
          </div>
          <div style={{ background: '#161616', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
            <h4 style={{ color: T.teal, marginBottom: '10px' }}>Active ProFormas</h4>
            <div style={{ fontSize: '24px' }}>12 Suites</div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── APP SHELL ────────────────────────────────────────────────
function App() {
  const [view, setView] = useState("landing");
  return (
    <>
      {view === "landing" && <Nav onEnter={() => setView("workroom")} />}
      {view === "landing" ? (
        <Landing onEnter={() => setView("workroom")} />
      ) : (
        <Workroom onBack={() => setView("landing")} />
      )}
    </>
  );
}

// ─── RENDER ───────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
