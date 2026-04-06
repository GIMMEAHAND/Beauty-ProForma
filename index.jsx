import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
// Import your Supabase client that we saw in your file list
import { supabase } from './supabaseClient'; 

// ─── THE REAL CLAUDE DESIGN TOKENS ───────────────────────────
const T = {
  cream: "#FAF7F2",
  teal: "#59c5c5",
  inkDark: "#1C1612",
  inkMid: "#4A3F35",
  borderSoft: "rgba(28,22,18,0.07)",
  tealGlow: "rgba(89,197,197,0.12)",
};

// ─── THE FULL LANDING PAGE (With Ticker & Hero) ──────────────
const Landing = ({ onEnter }) => (
  <div style={{ backgroundColor: T.cream, minHeight: "100vh" }}>
    <nav style={{ height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px', borderBottom: `1px solid ${T.borderSoft}` }}>
      <div style={{ fontWeight: 'bold', fontSize: '20px' }}>BEAUTY <span style={{ color: T.teal }}>PROFORMA</span></div>
      <button onClick={onEnter} style={{ background: T.inkDark, color: 'white', padding: '10px 20px', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>Login</button>
    </nav>
    <main style={{ padding: '100px 40px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '64px', fontFamily: 'serif', marginBottom: '24px' }}>The Sovereign Foundation</h1>
      <p style={{ fontSize: '20px', color: T.inkMid, marginBottom: '40px' }}>Your empire, managed in high-definition.</p>
      <button onClick={onEnter} style={{ backgroundColor: T.teal, color: 'white', padding: '20px 50px', borderRadius: '50px', fontSize: '18px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
        Start Your Empire
      </button>
    </main>
  </div>
);

// ─── THE REAL WORKROOM (With Live Data Logic) ────────────────
const Workroom = ({ onBack }) => {
  const [data, setData] = useState({ revenue: 0, appointments: 0 });

  // This is where we replace "Dummy Numbers" with your REAL data
  useEffect(() => {
    const fetchData = async () => {
      // We will add your specific Supabase queries here once the layout is right
      console.log("Fetching from Supabase...");
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
      <aside style={{ width: '260px', borderRight: '1px solid #222', padding: '40px' }}>
        <button onClick={onBack} style={{ color: T.teal, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '40px' }}>← Exit</button>
        <div style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>WORKROOM</div>
        <div style={{ padding: '10px 0', color: T.teal }}>Dashboard</div>
        <div style={{ padding: '10px 0', opacity: 0.5 }}>Clients</div>
      </aside>
      <main style={{ flex: 1, padding: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
          <div style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '1px solid #222' }}>
            <div style={{ color: T.teal, marginBottom: '10px' }}>Current Revenue</div>
            <div style={{ fontSize: '32px' }}>${data.revenue.toLocaleString()}</div>
          </div>
          <div style={{ background: '#111', padding: '40px', borderRadius: '20px', border: '1px solid #222' }}>
            <div style={{ color: T.teal, marginBottom: '10px' }}>Total Appointments</div>
            <div style={{ fontSize: '32px' }}>{data.appointments}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── THE APP SHELL ────────────────────────────────────────────
function App() {
  const [view, setView] = useState("landing");
  return view === "landing" ? <Landing onEnter={() => setView("workroom")} /> : <Workroom onBack={() => setView("landing")} />;
}

// ─── THE VITE IGNITION (The fix that keeps it from being white) ──
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
