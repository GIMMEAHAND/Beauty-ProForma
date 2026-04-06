import { useState, useEffect, useRef } from "react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PARTNERSHIP = {
  id: "p_001",
  pro: { name: "Dominique Ellis", specialty: "Color Specialist & Lash Artist", avatar: "DE" },
  manager: { name: "Camille Voss", skills: ["Pinterest Management", "SEO", "Affiliate Strategy"], avatar: "CV" },
  status: "Active",
  dignity_clause_version: "v1.0",
};

const MOCK_ASSETS = [
  { id: "a1", tier: "raw", type: "video", title: "Balayage Full Tutorial — 90 min", uploader: "DE", size: "2.4 GB", date: "Jun 12", thumbnail: "🎬", metrixs_id: "mx_001" },
  { id: "a2", tier: "raw", type: "image", title: "Before & After — Rose Gold Retouch", uploader: "DE", size: "18 MB", date: "Jun 10", thumbnail: "📸", metrixs_id: "mx_002" },
  { id: "a3", tier: "raw", type: "video", title: "Lash Set ASMR — Natural Hybrid", uploader: "DE", size: "1.1 GB", date: "Jun 8", thumbnail: "🎬", metrixs_id: null },
  { id: "a4", tier: "processed", type: "pinterest_pin", title: "5-Pin Carousel — Balayage Steps", uploader: "CV", size: "4.2 MB", date: "Jun 13", thumbnail: "📌", source: "a1", metrixs_id: "mx_003" },
  { id: "a5", tier: "processed", type: "etsy_product", title: "Digital Guide: Rose Gold Formula", uploader: "CV", size: "890 KB", date: "Jun 11", thumbnail: "🛍️", source: "a2", metrixs_id: "mx_004" },
  { id: "a6", tier: "processed", type: "video", title: "TikTok Cut — 60s Balayage Reveal", uploader: "CV", size: "78 MB", date: "Jun 14", thumbnail: "📱", source: "a1", metrixs_id: "mx_005" },
];

const MOCK_TASKS = [
  { id: "t1", title: "Scheduled 5 pins in SalonFlow", category: "Pinterest Scheduling", status: "Verified", created: "Jun 13", proof: "https://proof.link", proNote: "Confirmed — pins went live at 9AM ✓", manager_note: "Scheduled for optimal Tue/Thu windows" },
  { id: "t2", title: "Optimized 3 Etsy listings with SEO tags", category: "SEO Optimization", status: "Submitted", created: "Jun 14", proof: "https://etsy-report.link", manager_note: "Updated titles, tags, and alt text" },
  { id: "t3", title: "Set up Amazon affiliate links in bio", category: "Affiliate Setup", status: "Pending", created: "Jun 15", proof: null, manager_note: "Awaiting brand approval from 2 partners" },
  { id: "t4", title: "Published TikTok cut with trending audio", category: "Social Post", status: "Disputed", created: "Jun 12", proof: null, proNote: "Audio not pre-approved — needs review", manager_note: "Selected audio from approved list" },
  { id: "t5", title: "Monthly analytics report — May", category: "Analytics Report", status: "Verified", created: "Jun 3", proof: "https://report.pdf", proNote: "Great work on the Etsy numbers 🙌", manager_note: "Includes MetriXs + Etsy dashboard" },
];

const MOCK_METRICS = {
  mx_001: { platform: "TikTok", views: 84200, likes: 6100, shares: 920, watchAvg: "0:42", trend: "+18%" },
  mx_002: { platform: "Instagram", reach: 12400, saves: 1840, impressions: 31000, profileVisits: 870, trend: "+6%" },
  mx_003: { platform: "Pinterest", impressions: 58000, saves: 3200, clicks: 1450, ctr: "2.5%", trend: "+31%" },
  mx_004: { platform: "Etsy", views: 4400, favorites: 280, sales: 34, revenue: "$748", trend: "+12%" },
  mx_005: { platform: "TikTok", views: 220000, likes: 19800, shares: 4300, watchAvg: "0:55", trend: "+89%" },
};

const MOCK_ACTIVITY = [
  { id: "ac1", type: "task_verified", actor: "DE", msg: "Dominique verified Pinterest scheduling task", time: "2m ago" },
  { id: "ac2", type: "asset_processed", actor: "CV", msg: "Camille uploaded TikTok cut from Balayage Tutorial", time: "1h ago" },
  { id: "ac3", type: "metrics_refreshed", actor: "system", msg: "MetriXs synced — TikTok cut hit 220K views", time: "3h ago" },
  { id: "ac4", type: "task_submitted", actor: "CV", msg: "Camille submitted SEO optimization task", time: "5h ago" },
  { id: "ac5", type: "asset_uploaded", actor: "DE", msg: "Dominique uploaded Balayage Full Tutorial", time: "Jun 12" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColors = {
  Pending:   { bg: "#2a2018", text: "#f5a623", border: "#f5a62340" },
  Submitted: { bg: "#0f1e2e", text: "#4a9eff", border: "#4a9eff40" },
  Verified:  { bg: "#0a1f14", text: "#3dd68c", border: "#3dd68c40" },
  Disputed:  { bg: "#2a0f0f", text: "#ff6b6b", border: "#ff6b6b40" },
};

const activityIcons = {
  asset_uploaded: "↑", asset_processed: "✦", task_created: "+",
  task_submitted: "→", task_verified: "✓", task_disputed: "!",
  metrics_refreshed: "◎", partner_joined: "◈",
};

const platformColors = {
  TikTok: "#ff2d55", Pinterest: "#e60023", Instagram: "#c13584", Etsy: "#f1641e",
};

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ initials, size = 36, color = "#c9a96e" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `${color}22`, border: `1px solid ${color}55`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.33, fontFamily: "'DM Serif Display', serif",
      color, flexShrink: 0,
    }}>{initials}</div>
  );
}

function StatusPill({ status }) {
  const c = statusColors[status] || statusColors.Pending;
  return (
    <span style={{
      fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 20,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      fontFamily: "'DM Mono', monospace", fontWeight: 500,
    }}>{status}</span>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div style={{ padding: "14px 16px", borderRadius: 10, background: "#0d0d0f", border: "1px solid #1e1e22" }}>
      <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, color: "#f0e8d8", fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#3dd68c", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{sub}</div>}
    </div>
  );
}

function MetriXsPanel({ asset }) {
  const m = MOCK_METRICS[asset.metrixs_id];
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, [asset.id]);

  if (!asset.metrixs_id) return (
    <div style={{ padding: 20, textAlign: "center", color: "#444", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
      No MetriXs ID linked to this asset
    </div>
  );

  if (loading) return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ display: "inline-block", width: 20, height: 20, border: "2px solid #c9a96e44", borderTopColor: "#c9a96e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <div style={{ marginTop: 10, fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace" }}>Pulling from MetriXs API…</div>
    </div>
  );

  const pc = platformColors[m.platform] || "#c9a96e";

  return (
    <div style={{ padding: "16px 0 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #1a1a1e" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: pc }}/>
        <span style={{ fontSize: 11, color: pc, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{m.platform.toUpperCase()}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#3dd68c", fontFamily: "'DM Mono', monospace" }}>{m.trend} this week</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {m.platform === "TikTok" && <>
          <MetricCard label="Views" value={m.views.toLocaleString()} />
          <MetricCard label="Likes" value={m.likes.toLocaleString()} />
          <MetricCard label="Shares" value={m.shares.toLocaleString()} />
          <MetricCard label="Avg Watch" value={m.watchAvg} />
        </>}
        {m.platform === "Pinterest" && <>
          <MetricCard label="Impressions" value={m.impressions.toLocaleString()} />
          <MetricCard label="Saves" value={m.saves.toLocaleString()} />
          <MetricCard label="Clicks" value={m.clicks.toLocaleString()} />
          <MetricCard label="CTR" value={m.ctr} />
        </>}
        {m.platform === "Instagram" && <>
          <MetricCard label="Reach" value={m.reach.toLocaleString()} />
          <MetricCard label="Saves" value={m.saves.toLocaleString()} />
          <MetricCard label="Impressions" value={m.impressions.toLocaleString()} />
          <MetricCard label="Profile Visits" value={m.profileVisits.toLocaleString()} />
        </>}
        {m.platform === "Etsy" && <>
          <MetricCard label="Views" value={m.views.toLocaleString()} />
          <MetricCard label="Favorites" value={m.favorites.toLocaleString()} />
          <MetricCard label="Sales" value={m.sales} />
          <MetricCard label="Revenue" value={m.revenue} sub="this period" />
        </>}
      </div>
    </div>
  );
}

// ─── Asset Vault ──────────────────────────────────────────────────────────────
function AssetVault({ role }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showMetriXs, setShowMetriXs] = useState(false);

  const filtered = MOCK_ASSETS.filter(a =>
    filter === "all" ? true : a.tier === filter
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 16, transition: "all 0.3s" }}>
      <div>
        {/* Filters + Upload */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          {["all", "raw", "processed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase",
              background: filter === f ? "#c9a96e" : "transparent",
              color: filter === f ? "#0a0a0c" : "#666",
              border: `1px solid ${filter === f ? "#c9a96e" : "#252528"}`,
              transition: "all 0.2s",
            }}>{f}</button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {role === "pro" && (
              <button style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                background: "#1a1a1e", color: "#c9a96e", border: "1px solid #c9a96e44",
                fontFamily: "'DM Mono', monospace",
              }}>↑ Upload Raw</button>
            )}
            {role === "manager" && (
              <button style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                background: "#1a1a1e", color: "#4a9eff", border: "1px solid #4a9eff44",
                fontFamily: "'DM Mono', monospace",
              }}>↑ Upload Processed</button>
            )}
          </div>
        </div>

        {/* Asset Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {filtered.map(asset => (
            <div key={asset.id}
              onClick={() => { setSelected(selected?.id === asset.id ? null : asset); setShowMetriXs(false); }}
              style={{
                padding: 16, borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                background: selected?.id === asset.id ? "#12120f" : "#0d0d0f",
                border: `1px solid ${selected?.id === asset.id ? "#c9a96e66" : "#1a1a1e"}`,
              }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{asset.thumbnail}</div>
              <div style={{ fontSize: 12, color: "#f0e8d8", marginBottom: 4, fontWeight: 500, lineHeight: 1.3 }}>{asset.title}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>{asset.size} · {asset.date}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 9, padding: "2px 7px", borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.08em",
                  fontFamily: "'DM Mono', monospace",
                  background: asset.tier === "raw" ? "#1a1208" : "#0f1a24",
                  color: asset.tier === "raw" ? "#c9a96e" : "#4a9eff",
                  border: `1px solid ${asset.tier === "raw" ? "#c9a96e33" : "#4a9eff33"}`,
                }}>{asset.tier}</span>
                <span style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace" }}>
                  {asset.uploader}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div style={{
          background: "#0a0a0c", borderRadius: 14, border: "1px solid #1a1a1e",
          padding: 20, height: "fit-content", position: "sticky", top: 0,
          animation: "slideIn 0.25s ease",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ fontSize: 24 }}>{selected.thumbnail}</div>
            <button onClick={() => setSelected(null)} style={{
              background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", lineHeight: 1,
            }}>×</button>
          </div>
          <div style={{ fontSize: 14, color: "#f0e8d8", fontWeight: 500, marginBottom: 4 }}>{selected.title}</div>
          <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>
            {selected.type} · {selected.size} · {selected.date}
          </div>

          {selected.source && (
            <div style={{ fontSize: 11, color: "#4a9eff", fontFamily: "'DM Mono', monospace", marginBottom: 16, padding: "8px 12px", background: "#0f1a24", borderRadius: 8, border: "1px solid #4a9eff22" }}>
              Derived from: {MOCK_ASSETS.find(a => a.id === selected.source)?.title}
            </div>
          )}

          <div style={{ borderTop: "1px solid #1a1a1e", paddingTop: 16 }}>
            <button onClick={() => setShowMetriXs(!showMetriXs)} style={{
              width: "100%", padding: "9px 14px", borderRadius: 8, cursor: "pointer",
              background: showMetriXs ? "#c9a96e11" : "transparent",
              color: "#c9a96e", border: "1px solid #c9a96e44", fontSize: 11,
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span>◎</span> {showMetriXs ? "Hide" : "Pull"} MetriXs Data
            </button>
            {showMetriXs && <MetriXsPanel asset={selected} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Task Ledger ──────────────────────────────────────────────────────────────
function TaskLedger({ role }) {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "Pinterest Scheduling", manager_note: "" });
  const [filter, setFilter] = useState("all");

  const filtered = tasks.filter(t => filter === "all" || t.status === filter);

  const verify = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status: "Verified", proNote: "Verified ✓" } : t));
  const dispute = (id) => setTasks(ts => ts.map(t => t.id === id ? { ...t, status: "Disputed", proNote: "Flagged for review" } : t));
  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks(ts => [{ id: `t${Date.now()}`, ...newTask, status: "Pending", created: "Today", proof: null, proNote: null }, ...ts]);
    setNewTask({ title: "", category: "Pinterest Scheduling", manager_note: "" });
    setShowNew(false);
  };
  const deleteTask = (id) => setTasks(ts => ts.filter(t => t.id !== id));

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "Pending", "Submitted", "Verified", "Disputed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 12px", borderRadius: 20, fontSize: 10, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase",
            background: filter === f ? "#c9a96e" : "transparent",
            color: filter === f ? "#0a0a0c" : "#666",
            border: `1px solid ${filter === f ? "#c9a96e" : "#252528"}`,
          }}>{f}</button>
        ))}
        {role === "manager" && (
          <button onClick={() => setShowNew(!showNew)} style={{
            marginLeft: "auto", padding: "7px 16px", borderRadius: 8, cursor: "pointer",
            background: "#1a1a1e", color: "#3dd68c", border: "1px solid #3dd68c44", fontSize: 12,
            fontFamily: "'DM Mono', monospace",
          }}>+ Log Task</button>
        )}
      </div>

      {/* New task form */}
      {showNew && role === "manager" && (
        <div style={{ background: "#0d0f0e", border: "1px solid #3dd68c33", borderRadius: 12, padding: 18, marginBottom: 16 }}>
          <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task title — be specific (e.g. 'Scheduled 5 pins in SalonFlow')"
            style={{ width: "100%", background: "#0a0a0c", border: "1px solid #1e1e22", borderRadius: 8, padding: "10px 14px", color: "#f0e8d8", fontSize: 13, boxSizing: "border-box", fontFamily: "'DM Mono', monospace", outline: "none", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })}
              style={{ flex: 1, background: "#0a0a0c", border: "1px solid #1e1e22", borderRadius: 8, padding: "9px 12px", color: "#f0e8d8", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
              {["Pinterest Scheduling","SEO Optimization","Affiliate Setup","Content Editing","Analytics Report","Email Campaign","Etsy Listing","Social Post","Other"].map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
          </div>
          <textarea value={newTask.manager_note} onChange={e => setNewTask({ ...newTask, manager_note: e.target.value })}
            placeholder="Notes / proof of work description…"
            rows={2}
            style={{ width: "100%", background: "#0a0a0c", border: "1px solid #1e1e22", borderRadius: 8, padding: "10px 14px", color: "#f0e8d8", fontSize: 12, boxSizing: "border-box", fontFamily: "'DM Mono', monospace", resize: "none", outline: "none", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addTask} style={{ padding: "8px 18px", borderRadius: 8, background: "#3dd68c22", color: "#3dd68c", border: "1px solid #3dd68c55", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Submit Task</button>
            <button onClick={() => setShowNew(false)} style={{ padding: "8px 18px", borderRadius: 8, background: "transparent", color: "#555", border: "1px solid #252528", fontSize: 12, cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Task rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(task => (
          <div key={task.id} style={{
            background: "#0d0d0f", borderRadius: 12, border: "1px solid #1a1a1e",
            padding: "16px 18px", transition: "border-color 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <StatusPill status={task.status} />
                  <span style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace" }}>{task.category}</span>
                  <span style={{ fontSize: 10, color: "#333", fontFamily: "'DM Mono', monospace", marginLeft: "auto" }}>{task.created}</span>
                </div>
                <div style={{ fontSize: 13, color: "#f0e8d8", fontWeight: 500, marginBottom: 6 }}>{task.title}</div>
                {task.manager_note && <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>Manager: {task.manager_note}</div>}
                {task.proNote && <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Pro: {task.proNote}</div>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                {role === "pro" && task.status === "Submitted" && <>
                  <button onClick={() => verify(task.id)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", background: "#0a1f14", color: "#3dd68c", border: "1px solid #3dd68c44", fontFamily: "'DM Mono', monospace" }}>✓ Verify</button>
                  <button onClick={() => dispute(task.id)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", background: "#2a0f0f", color: "#ff6b6b", border: "1px solid #ff6b6b44", fontFamily: "'DM Mono', monospace" }}>⚑ Dispute</button>
                </>}
                {role === "manager" && task.status === "Pending" && (
                  <button onClick={() => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, status: "Submitted" } : t))} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", background: "#0f1a24", color: "#4a9eff", border: "1px solid #4a9eff44", fontFamily: "'DM Mono', monospace" }}>→ Submit</button>
                )}
                {role === "manager" && (task.status === "Pending" || task.status === "Disputed") && (
                  <button onClick={() => deleteTask(task.id)} style={{ padding: "6px 12px", borderRadius: 7, fontSize: 11, cursor: "pointer", background: "transparent", color: "#444", border: "1px solid #252528", fontFamily: "'DM Mono', monospace" }}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {MOCK_ACTIVITY.map(a => (
        <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "#12120f", border: "1px solid #252520",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#c9a96e", fontFamily: "'DM Mono', monospace",
          }}>{activityIcons[a.type]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.4 }}>{a.msg}</div>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function Workroom() {
  const [tab, setTab] = useState("vault");
  const [role, setRole] = useState("pro");
  const p = MOCK_PARTNERSHIP;

  const tabs = [
    { id: "vault", label: "Asset Vault", icon: "◫" },
    { id: "tasks", label: "Task Ledger", icon: "≡" },
    { id: "feed",  label: "Activity",    icon: "◎" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #070709; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        input::placeholder, textarea::placeholder { color: #444; }
        select option { background: #12120f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #252528; border-radius: 2px; }
      `}</style>

      <div style={{
        minHeight: "100vh", background: "#070709",
        color: "#c8c0b4", fontFamily: "'DM Sans', sans-serif",
        animation: "fadeUp 0.4s ease",
      }}>

        {/* Header */}
        <div style={{
          borderBottom: "1px solid #111114", padding: "0 24px",
          background: "#07070980", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: "#c9a96e", letterSpacing: "-0.01em" }}>
              Beauty ProForma
            </div>
            <div style={{ width: 1, height: 20, background: "#1e1e22" }}/>
            <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Mono', monospace" }}>Workroom</div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace" }}>Viewing as</span>
              <button onClick={() => setRole(r => r === "pro" ? "manager" : "pro")} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 10, cursor: "pointer",
                fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase",
                background: role === "pro" ? "#c9a96e22" : "#0f1a24",
                color: role === "pro" ? "#c9a96e" : "#4a9eff",
                border: `1px solid ${role === "pro" ? "#c9a96e44" : "#4a9eff44"}`,
                transition: "all 0.2s",
              }}>{role === "pro" ? "Pro ⇄" : "Manager ⇄"}</button>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 24px 48px" }}>

          {/* Partnership Card */}
          <div style={{
            background: "linear-gradient(135deg, #0f0e0a 0%, #0a0c0f 100%)",
            borderRadius: 16, border: "1px solid #1a1a1e",
            padding: "20px 24px", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <Avatar initials={p.pro.avatar} color="#c9a96e" />
              <div>
                <div style={{ fontSize: 14, color: "#f0e8d8", fontWeight: 500 }}>{p.pro.name}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>{p.pro.specialty}</div>
              </div>
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 10, letterSpacing: "0.1em",
              fontFamily: "'DM Mono', monospace", color: "#3dd68c",
              background: "#0a1f14", border: "1px solid #3dd68c44",
            }}>ACTIVE PARTNERSHIP</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "flex-end" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, color: "#f0e8d8", fontWeight: 500 }}>{p.manager.name}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>{p.manager.skills.slice(0,2).join(" · ")}</div>
              </div>
              <Avatar initials={p.manager.avatar} color="#4a9eff" />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, alignItems: "start" }}>
            <div>
              {/* Tabs */}
              <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#0a0a0c", padding: 4, borderRadius: 12, border: "1px solid #111114", width: "fit-content" }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{
                    padding: "8px 18px", borderRadius: 9, fontSize: 12, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
                    background: tab === t.id ? "#1a1a1e" : "transparent",
                    color: tab === t.id ? "#f0e8d8" : "#555",
                    border: `1px solid ${tab === t.id ? "#252528" : "transparent"}`,
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 10 }}>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div key={tab} style={{ animation: "fadeUp 0.25s ease" }}>
                {tab === "vault" && <AssetVault role={role} />}
                {tab === "tasks" && <TaskLedger role={role} />}
                {tab === "feed"  && <ActivityFeed />}
              </div>
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Quick Stats */}
              <div style={{ background: "#0a0a0c", borderRadius: 14, border: "1px solid #111114", padding: 18 }}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 14 }}>WORKROOM STATS</div>
                {[
                  { label: "Raw Assets", value: MOCK_ASSETS.filter(a=>a.tier==="raw").length, color: "#c9a96e" },
                  { label: "Processed", value: MOCK_ASSETS.filter(a=>a.tier==="processed").length, color: "#4a9eff" },
                  { label: "Tasks Verified", value: MOCK_TASKS.filter(t=>t.status==="Verified").length, color: "#3dd68c" },
                  { label: "Pending Review", value: MOCK_TASKS.filter(t=>t.status==="Submitted").length, color: "#f5a623" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f0f12" }}>
                    <span style={{ fontSize: 11, color: "#666", fontFamily: "'DM Mono', monospace" }}>{s.label}</span>
                    <span style={{ fontSize: 16, color: s.color, fontFamily: "'DM Serif Display', serif" }}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Dignity Clause badge */}
              <div style={{ background: "#0a0a0c", borderRadius: 14, border: "1px solid #c9a96e22", padding: 18 }}>
                <div style={{ fontSize: 10, color: "#c9a96e", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 10 }}>DIGNITY CLAUSE</div>
                <div style={{ fontSize: 11, color: "#666", lineHeight: 1.6 }}>
                  All content in this vault is owned 100% by <span style={{ color: "#c9a96e" }}>{p.pro.name}</span>. Likeness rights revert automatically on termination.
                </div>
                <div style={{ marginTop: 12, fontSize: 10, color: "#3dd68c", fontFamily: "'DM Mono', monospace" }}>✓ Both parties signed · {p.dignity_clause_version}</div>
              </div>

              {/* Live Activity */}
              <div style={{ background: "#0a0a0c", borderRadius: 14, border: "1px solid #111114", padding: 18 }}>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginBottom: 14 }}>LIVE ACTIVITY</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {MOCK_ACTIVITY.slice(0,3).map(a => (
                    <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 11, color: "#c9a96e", marginTop: 1 }}>{activityIcons[a.type]}</span>
                      <div>
                        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4 }}>{a.msg}</div>
                        <div style={{ fontSize: 9, color: "#444", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import React from 'react';
import ReactDOM from 'react-dom/client';

// This connects the Workroom component to the <div id="root"> in your HTML
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Workroom /> 
  </React.StrictMode>
);
