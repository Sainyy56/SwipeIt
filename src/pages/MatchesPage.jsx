import { useEffect, useState, useMemo } from "react";
import { getCurrentUserProfile, getOtherUsers } from "../services/userService";
import { runMatchingUtils } from "../utils/matchUtils";
import { logout } from "../services/authService";
import SwipePage from "./SwipePage";
import ChatPage from "./ChatPage";
import ChatsListPage from "./ChatsListPage";

const SKILL_OPTIONS = [
  "React", "Firebase", "UI Design", "Node.js", "Python",
  "GraphQL", "DevOps", "Mobile", "ML/AI", "Data Analysis",
];
const RISK_OPTIONS    = ["Low Risk", "Moderate Risk", "High Conflict Risk"];
const CATEGORY_OPTIONS = ["Highly Compatible", "Moderate Match", "Risky Match"];
const SORT_OPTIONS    = ["Score (high to low)", "Score (low to high)", "Name (A-Z)"];

export default function MatchesPage({ user }) {
  const [matches, setMatches]     = useState([]);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [view, setView]           = useState("list");
  const [chatTarget, setChatTarget] = useState(null);

  const [search, setSearch]               = useState("");
  const [filterSkill, setFilterSkill]     = useState("");
  const [filterRisk, setFilterRisk]       = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy]               = useState("Score (high to low)");
  const [showFilters, setShowFilters]     = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, others] = await Promise.all([
          getCurrentUserProfile(user.uid),
          getOtherUsers(user.uid),
        ]);
        if (!p) { setError("Profile not found."); setLoading(false); return; }
        setProfile(p);
        setMatches(runMatchingUtils(p, others));
      } catch (e) { setError("Failed to load matches."); console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user.uid]);

  const filtered = useMemo(() => {
    let r = matches.filter(m => m.id !== "none");
    if (search.trim()) r = r.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));
    if (filterSkill)   r = r.filter(m => m.details?.bHelpsA?.includes(filterSkill) || m.details?.aHelpsB?.includes(filterSkill));
    if (filterRisk)    r = r.filter(m => m.riskLevel === filterRisk);
    if (filterCategory) r = r.filter(m => m.category === filterCategory);
    if (sortBy === "Score (high to low)") r.sort((a, b) => b.score - a.score);
    else if (sortBy === "Score (low to high)") r.sort((a, b) => a.score - b.score);
    else if (sortBy === "Name (A-Z)") r.sort((a, b) => a.name?.localeCompare(b.name));
    return r;
  }, [matches, search, filterSkill, filterRisk, filterCategory, sortBy]);

  const hasFilters = search || filterSkill || filterRisk || filterCategory || sortBy !== "Score (high to low)";
  function clearFilters() { setSearch(""); setFilterSkill(""); setFilterRisk(""); setFilterCategory(""); setSortBy("Score (high to low)"); }

  if (view === "swipe" && !loading && matches.length > 0)
    return <SwipePage matches={matches} profile={profile} onBack={() => setView("list")} />;
  if (view === "chat" && chatTarget)
    return <ChatPage currentUser={user} otherUser={chatTarget} onBack={() => setView("list")} />;
  if (view === "chats")
    return <ChatsListPage currentUser={user} onBack={() => setView("list")} />;

  const sc  = s => s >= 75 ? "#5A8C5A" : s >= 45 ? "#C17D3C" : "#C0392B";
  const sbg = s => s >= 75 ? "#edf7ed" : s >= 45 ? "#fef3e8" : "#fde8e8";

  return (
    <div className="grain min-h-screen" style={{ background: "#F5E6D3" }}>
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "#F5E6D3",
        borderBottom: "2.5px solid #2C1A0E", position: "sticky", top: 0, zIndex: 10,
      }}>
        <h1 className="display" style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2C1A0E", margin: 0 }}>SkillSwap ✦</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {profile && <span className="display" style={{ fontSize: "1rem", color: "#A0622A" }}>hey, {profile.name}!</span>}
          <button onClick={() => setView("chats")} className="sketch-btn"
            style={{ padding: "7px 14px", fontSize: "0.75rem", background: "#FDF6EE", color: "#5C3317" }}>💬 Messages</button>
          {!loading && filtered.length > 0 && (
            <button onClick={() => setView("swipe")} className="sketch-btn"
              style={{ padding: "7px 14px", fontSize: "0.75rem", background: "#C17D3C", color: "#FDF6EE" }}>Swipe ♥</button>
          )}
          <button onClick={logout} className="sketch-btn"
            style={{ padding: "7px 14px", fontSize: "0.75rem", background: "#FDF6EE", color: "#5C3317" }}>Sign out</button>
        </div>
      </header>

      <main style={{ maxWidth: "640px", margin: "0 auto", padding: "24px 20px" }}>

        {/* My profile card */}
        {profile && (
          <div className="sketch-card" style={{ padding: "20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <h2 className="display" style={{ fontSize: "2rem", fontWeight: 700, color: "#2C1A0E", margin: 0 }}>{profile.name}</h2>
                {profile.role && <p style={{ fontSize: "0.875rem", color: "#7A5C3C", fontWeight: 600, margin: "2px 0 0" }}>{profile.role}</p>}
              </div>
              <div className="display" style={{ textAlign: "right", fontSize: "0.875rem", color: "#A0622A" }}>
                <p style={{ margin: 0 }}>{profile.workStyle}</p>
                <p style={{ margin: 0 }}>{profile.sleep}</p>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {profile.skillsHave?.map(s => (
                <span key={s} style={{ padding: "3px 11px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: "#C17D3C", color: "#FDF6EE", border: "1.5px solid #2C1A0E" }}>{s}</span>
              ))}
              {profile.skillsWant?.map(s => (
                <span key={s} style={{ padding: "3px 11px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: "#F5E6D3", color: "#5C3317", border: "1.5px dashed #A0622A" }}>wants: {s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="sketch-card" style={{ padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: showFilters ? "14px" : 0 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name..." className="sketch-input"
              style={{ flex: 1, padding: "9px 14px", fontSize: "0.875rem" }} />
            <button onClick={() => setShowFilters(v => !v)} className="sketch-btn"
              style={{ padding: "9px 14px", fontSize: "0.8rem", background: showFilters ? "#2C1A0E" : "#FDF6EE", color: showFilters ? "#FDF6EE" : "#5C3317" }}>
              {showFilters ? "Filters ↑" : "Filters ↓"}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="sketch-btn"
                style={{ padding: "9px 12px", fontSize: "0.8rem", background: "#fde8e8", color: "#C0392B" }}>✕</button>
            )}
          </div>
          {showFilters && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <FilterSection label="Sort by">
                {SORT_OPTIONS.map(opt => <Chip key={opt} label={opt} active={sortBy === opt} onClick={() => setSortBy(opt)} activeColor="#2C1A0E" activeText="#FDF6EE" />)}
              </FilterSection>
              <FilterSection label="Category">
                {CATEGORY_OPTIONS.map(opt => <Chip key={opt} label={opt} active={filterCategory === opt} onClick={() => setFilterCategory(filterCategory === opt ? "" : opt)} activeColor="#C17D3C" activeText="#FDF6EE" />)}
              </FilterSection>
              <FilterSection label="Risk level">
                {RISK_OPTIONS.map(opt => <Chip key={opt} label={opt} active={filterRisk === opt} onClick={() => setFilterRisk(filterRisk === opt ? "" : opt)} activeColor={opt === "Low Risk" ? "#5A8C5A" : opt === "Moderate Risk" ? "#C17D3C" : "#C0392B"} activeText="#FDF6EE" />)}
              </FilterSection>
              <FilterSection label="Skill">
                {SKILL_OPTIONS.map(s => <Chip key={s} label={s} active={filterSkill === s} onClick={() => setFilterSkill(filterSkill === s ? "" : s)} activeColor="#5C3317" activeText="#FDF6EE" />)}
              </FilterSection>
            </div>
          )}
        </div>

        <p className="display" style={{ fontSize: "1.5rem", fontWeight: 700, color: "#2C1A0E", marginBottom: "14px" }}>
          {hasFilters ? `Results (${filtered.length})` : "Your Matches ✦"}
        </p>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
            <div className="spin" style={{ width: "28px", height: "28px", borderRadius: "50%", border: "3px solid #C17D3C", borderTopColor: "transparent" }} />
          </div>
        )}
        {error && <div style={{ padding: "14px", fontSize: "0.875rem", fontWeight: 700, borderRadius: "10px", background: "#fde8e8", color: "#C0392B", border: "2px solid #C0392B", boxShadow: "3px 3px 0 #2C1A0E" }}>⚠ {error}</div>}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filtered.length === 0 && hasFilters ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p className="display" style={{ fontSize: "1.5rem", color: "#A0622A" }}>No matches found ☕</p>
                <button onClick={clearFilters} className="sketch-btn" style={{ marginTop: "12px", padding: "8px 18px", fontSize: "0.875rem", background: "#C17D3C", color: "#FDF6EE" }}>Clear filters</button>
              </div>
            ) : (
              filtered.map(match => (
                <MatchCard key={match.id} match={match} sc={sc} sbg={sbg}
                  onMessage={() => { setChatTarget({ id: match.id, name: match.name }); setView("chat"); }} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div>
      <p className="display" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#5C3317", margin: "0 0 6px" }}>{label}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{children}</div>
    </div>
  );
}

function Chip({ label, active, onClick, activeColor, activeText }) {
  return (
    <button onClick={onClick} style={{
      padding: "3px 11px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
      fontFamily: "'Nunito', sans-serif", cursor: "pointer", transition: "all 0.1s",
      background: active ? activeColor : "transparent",
      color: active ? activeText : "#5C3317",
      border: `2px solid ${active ? activeColor : "#A0622A"}`,
      boxShadow: active ? "2px 2px 0 #2C1A0E" : "none",
    }}>{label}</button>
  );
}

function MatchCard({ match, sc, sbg, onMessage }) {
  const [expanded, setExpanded] = useState(false);
  const color  = sc(match.score);
  const bg     = sbg(match.score);
  const prefix = match.category === "Highly Compatible" ? "✦ " : match.category === "Moderate Match" ? "~ " : "⚠ ";
  const p      = match.profile ?? {};

  return (
    <div className="sketch-card" style={{ padding: "20px", transition: "transform 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}>

      {/* Top row: name + score */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div>
          <h3 className="display" style={{ fontSize: "1.6rem", fontWeight: 700, color: "#2C1A0E", margin: 0 }}>{match.name}</h3>
          {p.role && <p style={{ fontSize: "0.8rem", color: "#7A5C3C", fontWeight: 600, margin: "2px 0 0" }}>{p.role}</p>}
        </div>
        <ScoreRing score={match.score} color={color} bg={bg} />
      </div>

      {/* Their style badges */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
        {p.workStyle && (
          <span style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#F5E6D3", color: "#5C3317", border: "1.5px solid #A0622A" }}>⚡ {p.workStyle}</span>
        )}
        {p.sleep && (
          <span style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#F5E6D3", color: "#5C3317", border: "1.5px solid #A0622A" }}>🌙 {p.sleep}</span>
        )}
      </div>

      {/* Their skills */}
      {p.skillsHave?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
          {p.skillsHave.map(s => (
            <span key={s} style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#C17D3C", color: "#FDF6EE", border: "1.5px solid #2C1A0E" }}>{s}</span>
          ))}
          {p.skillsWant?.map(s => (
            <span key={s} style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#F5E6D3", color: "#5C3317", border: "1.5px dashed #A0622A" }}>wants: {s}</span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1.5px dashed #A0622A", marginBottom: "10px" }} />

      {/* Category + explanation */}
      <span style={{
        display: "inline-block", padding: "3px 12px", borderRadius: "999px",
        fontSize: "0.75rem", fontWeight: 700, background: bg, color,
        border: `1.5px solid ${color}`, marginBottom: "8px",
      }}>{prefix}{match.category}</span>

      <p style={{ fontSize: "0.875rem", color: "#5C3317", margin: 0 }}>{match.explanation}</p>

      {/* Positives */}
      {match.positives?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
          {match.positives.map(pos => (
            <span key={pos} style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#edf7ed", color: "#5A8C5A", border: "1.5px solid #5A8C5A" }}>✓ {pos}</span>
          ))}
        </div>
      )}

      {/* Warnings */}
      {match.warnings?.length > 0 && (
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "6px" }}>
          {match.warnings.map(w => (
            <span key={w} style={{ padding: "2px 9px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#fde8e8", color: "#C0392B", border: "1.5px solid #C0392B" }}>⚠ {w}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
        {match.details && (
          <button onClick={() => setExpanded(v => !v)} className="display"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.95rem", color: "#A0622A", fontWeight: 600, padding: 0 }}>
            {expanded ? "hide skill details ↑" : "show skill details ↓"}
          </button>
        )}
        {match.id !== "none" && (
          <button onClick={onMessage} className="sketch-btn"
            style={{ padding: "5px 14px", fontSize: "0.75rem", background: "#2C1A0E", color: "#FDF6EE", marginLeft: "auto" }}>
            💬 Message
          </button>
        )}
      </div>

      {expanded && match.details && (
        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1.5px dashed #A0622A", display: "flex", flexDirection: "column", gap: "8px" }}>
          {match.details.bHelpsA?.length > 0 && (
            <div style={{ background: "#edf7ed", border: "1.5px solid #5A8C5A", borderRadius: "8px", padding: "8px 12px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5A8C5A", margin: "0 0 4px" }}>They can teach you ↓</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {match.details.bHelpsA.map(s => (
                  <span key={s} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#5A8C5A", color: "#fff", border: "1.5px solid #2C1A0E" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {match.details.aHelpsB?.length > 0 && (
            <div style={{ background: "#fef3e8", border: "1.5px solid #C17D3C", borderRadius: "8px", padding: "8px 12px" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C17D3C", margin: "0 0 4px" }}>You can teach them ↑</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {match.details.aHelpsB.map(s => (
                  <span key={s} style={{ padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, background: "#C17D3C", color: "#fff", border: "1.5px solid #2C1A0E" }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ fontSize: "0.75rem", color: "#7A5C3C", margin: 0 }}>
            Skill exchange score: <strong>{match.details.mutualSkillScore}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score, color, bg }) {
  const r = 18, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="#E8D5C0" strokeWidth="3" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} strokeLinecap="round" />
      </svg>
      <span className="display" style={{ position: "absolute", fontSize: "1rem", fontWeight: 700, color }}>{score}</span>
    </div>
  );
}