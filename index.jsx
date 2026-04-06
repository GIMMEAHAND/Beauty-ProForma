import React, { useState } from "react";
import ReactDOM from "react-dom/client";

// --- CLAUDE'S PREMIUM DESIGN SYSTEM ---
const T = {
  cream: "#FAF7F2",
  inkDark: "#1C1612",
  teal: "#59c5c5",
  border: "rgba(28,22,18,0.1)",
};

// --- CLAUDE'S WORKROOM COMPONENT ---
const Workroom = ({ onBack }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif' }}>
    <aside style={{ width: '280px', borderRight: '1px solid #222', padding: '40px', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.teal, cursor: 'pointer', marginBottom: '60px', textAlign: 'left', fontSize: '16px' }}>← Exit to Landing</button>
      <div style={{ fontSize: '12px', color: '#666', letterSpacing: '0.1em', marginBottom: '24px' }}>MANAGEMENT</div>
      <div style={{ padding: '12px 0', color: T.teal, fontWeight: '600', cursor: 'pointer' }}>Empire Overview</div>
      <div style={{ padding: '12px 0', color: '#888', cursor: 'pointer' }}>Client Registry</div>
      <div style={{ padding: '12px 0', color: '#888', cursor: 'pointer' }}>Revenue Stream</div>
    </aside>
    <main style={{ flex: 1, padding: '80px', background: 'radial-gradient(circle at top right, #111, #0a0a0a)' }}>
      <h2 style={{ fontSize: '42px', marginBottom: '12px', fontWeight: 'normal' }}>Welcome, Professional.</h2>
      <p style={{ color: '#666', fontSize: '18px', marginBottom: '60px' }}>Your sovereign foundation is active.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ background: '#161616', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
          <div style={{ color: T.teal, marginBottom: '16px', fontSize: '14px', letterSpacing: '0.05em' }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '36px' }}>$0.00</div>
        </div>
        <div style={{ background: '#161616', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
          <div style={{ color: T.teal, marginBottom: '16px', fontSize: '14px', letterSpacing: '0.05em' }}>ACTIVE CLIENTS</div>
          <div style={{ fontSize: '36px' }}>0</div>
        </div>
      </div>
    </main>
  </div>
);

// --- CLAUDE'S LANDING COMPONENT ---
const Landing = ({ onEnter }) => (
  <div style={{ background: T.cream, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <h1 style={{ fontSize: '72px', color: T.inkDark, marginBottom: '32px', fontWeight: 'normal' }}>Sovereign <span style={{ fontStyle: 'italic' }}>Foundation</span></h1>
    <button 
      onClick={onEnter}
      style={{ padding: '24px 60px', background: T.teal, color: 'white', border: 'none', borderRadius: '100px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 20px 40px rgba(89,197,197,0.2)' }}
    >
      Start Your Empire
    </button>
  </div>
);

// --- THE ENGINE ---
function App() {
  const [view, setView] = useState("landing");
  return view === "landing" ? <Landing onEnter={() => setView("workroom")} /> : <Workroom onBack={() => setView("landing")} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
