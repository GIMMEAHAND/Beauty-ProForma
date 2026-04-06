import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";

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

// ... [The rest of your code for Nav, Ticker, SplitHero, etc. goes here] ...

// ─── Root ─────────────────────────────────────────────────────
function App() {
  const [view, setView] = useState("landing");
  
  // This part adds your custom Teal styles to the page
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${T.cream}; color: ${T.inkDark}; overflow-x: hidden; }
      .reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); }
      .reveal.vis { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  return view === "landing"
    ? <Landing onEnter={() => setView("workroom")}/>
    : <Workroom onBack={() => setView("landing")}/>;
}

// THE IGNITION SWITCH - THIS TURNS THE WHITE SCREEN INTO YOUR SITE
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
