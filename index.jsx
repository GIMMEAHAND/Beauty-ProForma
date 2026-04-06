import React, { useState } from "react";
import ReactDOM from "react-dom/client";

const T = {
  cream: "#FAF7F2",
  inkDark: "#1C1612",
  teal: "#59c5c5",
  parchment: "#F3EDE3",
};

// --- 1. THE SPLIT HERO (Top of your image) ---
const Hero = ({ onEnter }) => (
  <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
    <div style={{ flex: 1, background: 'white', display: 'flex', alignItems: 'center', padding: '60px' }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '64px', fontFamily: 'serif', color: T.inkDark, lineHeight: 1 }}>Sovereign Foundation</h1>
      </div>
    </div>
    <div style={{ flex: 1, background: T.inkDark, position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '10%', left: '-50px', background: 'white', padding: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
        <button onClick={onEnter} style={{ background: T.teal, color: 'white', border: 'none', padding: '15px 40px', borderRadius: '100px', fontWeight: 'bold', cursor: 'pointer' }}>
          Enter Workroom
        </button>
      </div>
    </div>
  </div>
);

// --- 2. THE STATS BAR (Middle of your image) ---
const Stats = () => (
  <div style={{ background: T.parchment, padding: '80px 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
    <div><h3 style={{ color: T.teal, fontSize: '32px' }}>$84K</h3><p style={{ fontSize: '12px' }}>Avg Revenue Growth</p></div>
    <div><h3 style={{ color: T.teal, fontSize: '32px' }}>80/20</h3><p style={{ fontSize: '12px' }}>Efficiency Ratio</p></div>
    <div><h3 style={{ color: T.teal, fontSize: '32px' }}>100%</h3><p style={{ fontSize: '12px' }}>Sovereignty</p></div>
    <div><h3 style={{ color: T.teal, fontSize: '32px' }}>48hr</h3><p style={{ fontSize: '12px' }}>Setup Time</p></div>
  </div>
);

// --- 3. THE STEP CARDS (Bottom of your image) ---
const Steps = () => (
  <div style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
    <h2 style={{ fontFamily: 'serif', fontSize: '32px', marginBottom: '40px' }}>How it works</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
      {[ 
        { n: "01", t: "Audit & Analysis", d: "Deep dive into your current metrics." },
        { n: "02", t: "Foundation Setup", d: "We build your bespoke digital suite." },
        { n: "03", t: "Empire Launch", d: "Go live with high-definition systems." },
        { n: "04", t: "Scale & Optimize", d: "Continuous growth and refinement." }
      ].map(step => (
        <div key={step.n} style={{ background: 'white', padding: '40px', border: '1px solid #eee', borderRadius: '12px' }}>
          <div style={{ color: T.teal, fontWeight: 'bold', marginBottom: '10px' }}>{step.n}</div>
          <h4 style={{ marginBottom: '10px' }}>{step.t}</h4>
          <p style={{ color: '#666', fontSize: '14px' }}>{step.d}</p>
        </div>
      ))}
    </div>
  </div>
);

// --- 4. THE ACTUAL WORKROOM (For after you click) ---
const Workroom = ({ onBack }) => (
  <div style={{ minHeight: '100vh', background: T.inkDark, color: 'white', padding: '60px' }}>
    <button onClick={onBack} style={{ color: T.teal, background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
    <h1 style={{ marginTop: '40px', fontFamily: 'serif' }}>Workroom</h1>
    <p>Revenue: $84,000.00</p>
  </div>
);

// --- MAIN APP ---
// --- THE FULL SCROLLING APP ---
function App() {
  const [view, setView] = useState("landing");

  // This ensures the page can actually scroll
  useEffect(() => {
    document.body.style.overflow = "auto";
    document.body.style.margin = "0";
    document.body.style.backgroundColor = T.cream;
  }, []);

  if (view === "workroom") {
    return <Workroom onBack={() => setView("landing")} />;
  }

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <Hero onEnter={() => setView("workroom")} />
      <Stats />
      <Steps />
      
      {/* The Footer - The very bottom of your image */}
      <footer style={{ background: T.inkDark, color: 'white', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'serif', fontSize: '32px', marginBottom: '20px' }}>Ready to scale?</h2>
        <button 
          onClick={() => setView("workroom")}
          style={{ background: 'white', color: T.inkDark, padding: '15px 40px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Get Started
        </button>
        <div style={{ marginTop: '40px', opacity: 0.5, fontSize: '12px' }}>
          © 2026 BEAUTY PROFORMA. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
