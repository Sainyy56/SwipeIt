import { useEffect, useRef, useState } from "react";
import { getOrCreateChat, sendMessage, subscribeToMessages } from "../services/chatService";
import { getCurrentUserProfile } from "../services/userService";

export default function ChatPage({ currentUser, otherUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatId, setChatId] = useState(null);
  const [otherProfile, setOtherProfile] = useState(otherUser);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Init chat + subscribe
  useEffect(() => {
    let unsub = () => {};
    async function init() {
      // Fetch other user's profile if we only have uid
      if (!otherProfile?.name && otherUser?.id) {
        const p = await getCurrentUserProfile(otherUser.id);
        if (p) setOtherProfile(p);
      }
      const id = await getOrCreateChat(currentUser.uid, otherUser.id);
      setChatId(id);
      unsub = subscribeToMessages(id, setMessages);
    }
    init();
    return () => unsub();
  }, [currentUser.uid, otherUser.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !chatId || sending) return;
    setSending(true);
    try { await sendMessage(chatId, currentUser.uid, text); setText(""); }
    finally { setSending(false); }
  }

  const displayName = otherProfile?.name ?? "User";

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      background: "#F5E6D3", fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 20px", borderBottom: "2.5px solid #2C1A0E",
        background: "#FDF6EE", flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "1.3rem", color: "#2C1A0E", fontWeight: 700,
          fontFamily: "'Caveat', cursive",
        }}>←</button>

        {/* Avatar */}
        <div style={{
          width: "38px", height: "38px", borderRadius: "50%",
          background: "#C17D3C", border: "2px solid #2C1A0E",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "1.1rem", color: "#FDF6EE",
          flexShrink: 0,
        }}>
          {displayName[0]?.toUpperCase()}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: 800, color: "#2C1A0E", fontSize: "1rem" }}>{displayName}</p>
          {otherProfile?.role && (
            <p style={{ margin: 0, fontSize: "0.72rem", color: "#A0622A", fontWeight: 600 }}>{otherProfile.role}</p>
          )}
        </div>

        {/* Skill chips */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {otherProfile?.skillsHave?.slice(0, 2).map(s => (
            <span key={s} style={{
              padding: "2px 8px", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700,
              background: "#C17D3C", color: "#FDF6EE", border: "1.5px solid #2C1A0E",
            }}>{s}</span>
          ))}
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: "10px",
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.5rem", color: "#A0622A" }}>
              Say hello to {displayName}! ✦
            </p>
            <p style={{ fontSize: "0.8rem", color: "#7A5C3C" }}>Start the skill conversation</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderUid === currentUser.uid;
          const time = msg.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
          return (
            <div key={msg.id} style={{
              display: "flex", justifyContent: isMe ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "72%", padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: isMe ? "#C17D3C" : "#FDF6EE",
                color: isMe ? "#FDF6EE" : "#2C1A0E",
                border: "2px solid #2C1A0E",
                boxShadow: isMe ? "2px 2px 0 #5C3317" : "2px 2px 0 #2C1A0E",
                fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.4,
              }}>
                <p style={{ margin: 0 }}>{msg.text}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.65rem", opacity: 0.7, textAlign: "right" }}>{time}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{
        display: "flex", gap: "10px", padding: "14px 16px",
        borderTop: "2.5px solid #2C1A0E", background: "#FDF6EE", flexShrink: 0,
      }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Message ${displayName}...`}
          className="sketch-input"
          style={{ flex: 1, padding: "10px 14px", fontSize: "0.875rem" }}
        />
        <button type="submit" disabled={!text.trim() || sending}
          className="sketch-btn"
          style={{
            padding: "10px 18px", fontSize: "0.875rem",
            background: text.trim() ? "#C17D3C" : "#E8D5C0",
            color: text.trim() ? "#FDF6EE" : "#A0622A",
            opacity: sending ? 0.6 : 1,
          }}>
          Send ✦
        </button>
      </form>
    </div>
  );
}