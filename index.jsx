import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

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

// ... [PASTE THE ENTIRE MIDDLE SECTION OF YOUR CODE HERE] ...

// ─── Root ─────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState("landing");
  return view === "landing"
    ? <Landing onEnter={() => setView("workroom")}/>
    : <Workroom onBack={() => setView("landing")}/>;
}

// THIS IS THE IGNITION SWITCH (Add this to the very bottom)
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
