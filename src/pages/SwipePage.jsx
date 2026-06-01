import { useState, useRef } from "react";
import { logout } from "../services/authService";

const SWIPE_THRESHOLD = 100;

export default function SwipePage({ matches, profile, onBack }) {
  const [current, setCurrent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [decision, setDecision] = useState(null);
  const [connected, setConnected] = useState([]);
  const [passed, setPassed] = useState([]);
  const [done, setDone] = useState(false);
  const startPos = useRef(null);
  const cardRef = useRef(null);

  const cards = matches.filter((m) => m.id !== "none");
  const card = cards[current];
  const rotation = (offset.x / 20).toFixed(1);
  const isRight = offset.x > 60;
  const isLeft = offset.x < -60;

  function onPointerDown(e) {
    startPos.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    cardRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragging || !startPos.current) return;
    setOffset({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (offset.x > SWIPE_THRESHOLD) handleSwipe("connect");
    else if (offset.x < -SWIPE_THRESHOLD) handleSwipe("pass");
    else setOffset({ x: 0, y: 0 });
    startPos.current = null;
  }
  function handleSwipe(dir) {
    setDecision(dir);
    setTimeout(() => {
      if (dir === "connect") setConnected((p) => [...p, card]);
      else setPassed((p) => [...p, card]);
      setOffset({ x: 0, y: 0 });
      setDecision(null);
      if (current + 1 >= cards.length) setDone(true);
      else setCurrent((c) => c + 1);
    }, 380);
  }

  const sc  = (s) => s >= 80 ? "#5A8C5A" : s >= 50 ? "#C17D3C" : "#C0392B";
  const sbg = (s) => s >= 80 ? "#edf7ed" : s >= 50 ? "#fef3e8" : "#fde8e8";

  if (done || cards.length === 0) {
    return (
      <DoneScreen connected={connected} passed={passed}
        onBack={onBack}
        onRestart={() => { setCurrent(0); setConnected([]); setPassed([]); setDone(false); }} />
    );
  }

  return (
    <div className="grain min-h-screen flex flex-col" style={{ background: "#F5E6D3", userSelect: "none" }}>

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", borderBottom: "2.5px solid #2C1A0E", background: "#F5E6D3",
      }}>
        <button onClick={onBack} className="display"
          style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2C1A0E", background: "none", border: "none", cursor: "pointer" }}>
          ← SkillSwap
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="display" style={{ fontSize: "1.1rem", color: "#A0622A" }}>
            {current + 1} / {cards.length}
          </span>
          <button onClick={logout} className="sketch-btn"
            style={{ padding: "6px 12px", fontSize: "0.75rem", background: "#FDF6EE", color: "#5C3317" }}>
            Sign out
          </button>
        </div>
      </header>

      {/* Profile strip */}
      {profile && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
          padding: "10px 24px", borderBottom: "1.5px dashed #A0622A",
        }}>
          <div className="display" style={{
            width: "30px", height: "30px", borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 700,
            background: "#C17D3C", color: "#FDF6EE", border: "2px solid #2C1A0E", flexShrink: 0,
          }}>
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#2C1A0E" }}>{profile.name}</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {profile.skillsHave?.slice(0, 3).map((s) => (
              <span key={s} style={{
                padding: "2px 10px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                background: "#C17D3C", color: "#FDF6EE", border: "1.5px solid #2C1A0E",
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Card stack area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative" }}>

        {/* Background stack */}
        {cards.slice(current + 1, current + 3).reverse().map((c, i) => (
          <div key={c.id} style={{
            position: "absolute", width: "100%", maxWidth: "360px", height: "440px",
            background: "#FDF6EE", border: "2.5px solid #2C1A0E", borderRadius: "16px",
            boxShadow: `${4 + i * 2}px ${4 + i * 2}px 0 #2C1A0E`,
            transform: `scale(${0.93 + i * 0.04}) translateY(${-14 + i * 14}px)`,
            zIndex: i,
          }} />
        ))}

        {/* Main swipe card */}
        <div
          ref={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "relative", width: "100%", maxWidth: "360px",
            background: "#FDF6EE", border: "2.5px solid #2C1A0E", borderRadius: "16px",
            boxShadow: "5px 5px 0 #2C1A0E", zIndex: 10, overflow: "hidden",
            cursor: dragging ? "grabbing" : "grab",
            transform: `translateX(${
              decision === "connect" ? 650 : decision === "pass" ? -650 : offset.x
            }px) translateY(${offset.y * 0.25}px) rotate(${
              decision ? (decision === "connect" ? 25 : -25) : rotation
            }deg)`,
            transition: dragging ? "none" : "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          {/* CONNECT stamp */}
          <div style={{
            position: "absolute", top: 20, left: 14, zIndex: 20,
            border: "3px solid #5A8C5A", borderRadius: "8px", padding: "3px 10px",
            transform: "rotate(-16deg)",
            opacity: isRight ? Math.min(1, offset.x / 80) : 0,
            transition: "opacity 0.1s",
          }}>
            <span className="display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "#5A8C5A" }}>CONNECT!</span>
          </div>

          {/* NOPE stamp */}
          <div style={{
            position: "absolute", top: 20, right: 14, zIndex: 20,
            border: "3px solid #C0392B", borderRadius: "8px", padding: "3px 10px",
            transform: "rotate(16deg)",
            opacity: isLeft ? Math.min(1, -offset.x / 80) : 0,
            transition: "opacity 0.1s",
          }}>
            <span className="display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "#C0392B" }}>NOPE</span>
          </div>

          {/* Score bar */}
          <div style={{ height: "5px", width: "100%", background: sc(card.score) }} />

          {/* Card body */}
          <div style={{ padding: "20px 22px" }}>
            {/* Name + score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <h2 className="display" style={{ fontSize: "2.2rem", fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                  {card.name}
                </h2>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: sc(card.score), margin: "2px 0 0" }}>
                  {card.riskLevel}
                </p>
              </div>
              <ScoreRing score={card.score} color={sc(card.score)} bg={sbg(card.score)} />
            </div>

            {/* Category badge */}
            <span style={{
              display: "inline-block", padding: "3px 12px", borderRadius: "999px",
              fontSize: "0.75rem", fontWeight: 700, marginBottom: "14px",
              background: sbg(card.score), color: sc(card.score),
              border: `1.5px solid ${sc(card.score)}`,
            }}>
              {card.category === "Highly Compatible" ? "✦ " : card.category === "Moderate Match" ? "~ " : "⚠ "}
              {card.category}
            </span>

            {/* Skill exchange */}
            {card.details && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {card.details.bHelpsA?.length > 0 && (
                  <div style={{ background: "#edf7ed", border: "1.5px solid #5A8C5A", borderRadius: "10px", padding: "10px" }}>
                    <p className="display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#5A8C5A", margin: "0 0 6px" }}>
                      They can teach you ↓
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {card.details.bHelpsA.map((s) => (
                        <span key={s} style={{
                          padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                          background: "#5A8C5A", color: "#fff", border: "1.5px solid #2C1A0E",
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {card.details.aHelpsB?.length > 0 && (
                  <div style={{ background: "#fef3e8", border: "1.5px solid #C17D3C", borderRadius: "10px", padding: "10px" }}>
                    <p className="display" style={{ fontSize: "0.85rem", fontWeight: 700, color: "#C17D3C", margin: "0 0 6px" }}>
                      You can teach them ↑
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {card.details.aHelpsB.map((s) => (
                        <span key={s} style={{
                          padding: "2px 8px", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700,
                          background: "#C17D3C", color: "#fff", border: "1.5px solid #2C1A0E",
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <p style={{ fontSize: "0.875rem", color: "#5C3317", margin: 0 }}>{card.explanation}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "28px", marginTop: "28px", zIndex: 20 }}>
          <button onClick={() => handleSwipe("pass")}
            style={{
              width: "60px", height: "60px", borderRadius: "50%", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
              background: "#FDF6EE", border: "2.5px solid #C0392B", color: "#C0392B",
              boxShadow: "3px 3px 0 #2C1A0E", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            }}>
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>✕</span>
            <span style={{ fontSize: "0.65rem" }}>Pass</span>
          </button>

          <button onClick={() => handleSwipe("connect")}
            style={{
              width: "72px", height: "72px", borderRadius: "50%", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
              background: "#C17D3C", border: "2.5px solid #2C1A0E", color: "#FDF6EE",
              boxShadow: "4px 4px 0 #2C1A0E", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            }}>
            <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>♥</span>
            <span style={{ fontSize: "0.65rem" }}>Connect</span>
          </button>

          <button onClick={() => handleSwipe("pass")}
            style={{
              width: "60px", height: "60px", borderRadius: "50%", display: "flex",
              flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
              background: "#FDF6EE", border: "2.5px solid #5C3317", color: "#5C3317",
              boxShadow: "3px 3px 0 #2C1A0E", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700,
            }}>
            <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>★</span>
            <span style={{ fontSize: "0.65rem" }}>Super</span>
          </button>
        </div>

        <p className="display" style={{ marginTop: "14px", fontSize: "1rem", color: "#A0622A" }}>
          drag to swipe ✦
        </p>
      </div>
    </div>
  );
}

function ScoreRing({ score, color, bg }) {
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E8D5C0" strokeWidth="3" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} strokeLinecap="round" />
      </svg>
      <span className="display" style={{ position: "absolute", fontSize: "1.1rem", fontWeight: 700, color }}>{score}</span>
    </div>
  );
}

function DoneScreen({ connected, passed, onBack, onRestart }) {
  return (
    <div className="grain min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#F5E6D3" }}>
      <div className="sketch-card" style={{ padding: "32px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }}>{connected.length > 0 ? "🎉" : "☕"}</div>
        <h2 className="display" style={{ fontSize: "2.5rem", fontWeight: 700, color: "#2C1A0E", margin: "0 0 4px" }}>
          All done!
        </h2>
        <p className="display" style={{ fontSize: "1.2rem", color: "#A0622A", margin: "0 0 24px" }}>
          {connected.length} connected · {passed.length} passed
        </p>

        {connected.length > 0 && (
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <p className="display" style={{ fontSize: "1rem", fontWeight: 700, color: "#5C3317", marginBottom: "10px" }}>
              Connected with ✦
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {connected.map((c) => (
                <div key={c.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: "10px",
                  background: "#edf7ed", border: "1.5px solid #5A8C5A", boxShadow: "2px 2px 0 #2C1A0E",
                }}>
                  <span style={{ fontWeight: 700, color: "#2C1A0E" }}>{c.name}</span>
                  <span className="display" style={{ fontSize: "1rem", fontWeight: 700, color: "#5A8C5A" }}>{c.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onBack} className="sketch-btn"
            style={{ flex: 1, padding: "10px", fontSize: "0.875rem", background: "#F5E6D3", color: "#2C1A0E" }}>
            ← Back
          </button>
          <button onClick={onRestart} className="sketch-btn"
            style={{ flex: 1, padding: "10px", fontSize: "0.875rem", background: "#C17D3C", color: "#FDF6EE" }}>
            Start over ↺
          </button>
        </div>
      </div>
    </div>
  );
}