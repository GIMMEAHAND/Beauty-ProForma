import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

// --- Design Tokens ---
const T = {
  cream: "#FAF7F2",
  teal: "#59c5c5",
  inkDark: "#1C1612",
  inkMid: "#4A3F35"
};

// --- Landing Page ---
const Landing = ({ onEnter }) => (
  <div style={{ backgroundColor: T.cream, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "20px" }}>
    <h1 style={{ color: T.inkDark, fontSize: "3rem", marginBottom: "20px", fontFamily: "serif" }}>Sovereign Foundation</h1>
    <p style={{ color: T.inkMid, maxWidth: "600px", marginBottom: "40px", fontSize: "1.2rem" }}>The High-End Suite for Beauty Professionals.</p>
    <button 
      onClick={onEnter}
      style={{ backgroundColor: T.teal, color: "white", padding: "15px 40px", border: "none", borderRadius: "50px", fontSize: "1.1rem", cursor: "pointer", fontWeight: "bold" }}
    >
      Enter Workroom
    </button>
  </div>
);

// --- Workroom Page ---
const Workroom = ({ onBack }) => (
  <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "40px" }}>
    <button onClick={onBack} style={{ color: T.teal, border: "none", background: "none", cursor: "pointer", marginBottom: "20px" }}>← Back to Landing</button>
    <h2 style={{ color: T.inkDark }}>The Workroom</h2>
    <p>Your creative suite is ready.</p>
  </div>
);

// --- Main App Logic ---
function App() {
  const [view, setView] = useState("landing");
  return (
    <>
      {view === "landing" ? (
        <Landing onEnter={() => setView("workroom")} />
      ) : (
        <Workroom onBack={() => setView("landing")} />
      )}
    </>
  );
}

// --- The Ignition Switch ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
