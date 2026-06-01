import { useEffect, useState } from "react";
import { getUserChats } from "../services/chatService";
import { getCurrentUserProfile } from "../services/userService";
import ChatPage from "./chatPage";

export default function ChatsListPage({ currentUser, onBack }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openChat, setOpenChat] = useState(null); 

    useEffect(() => {
        async function load() {
            const rawChats = await getUserChats(currentUser.uid);
            
            const enriched = await Promise.all(
                rawChats.map(async (chat) => {
                    const otherId = chat.participants.find(p => p !== currentUser.uid);
                    const profile = await getCurrentUserProfile(otherId);
                    return { ...chat, otherUser: { id: otherId, ...profile } };
                })
            );
            enriched.sort((a, b) => (b.lastAt?.seconds ?? 0) - (a.lastAt?.seconds ?? 0));
            setChats(enriched);
            setLoading(false);
        }
        load();
    }, [currentUser.uid]);

    if (openChat) {
        return (
            <ChatPage
                currentUser={currentUser}
                otherUser={openChat}
                onBack={() => setOpenChat(null)}
            />
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#F5E6D3", fontFamily: "'Nunito', sans-serif" }}>
            {/* Header */}
            <header style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 20px", borderBottom: "2.5px solid #2C1A0E",
                background: "#FDF6EE",
            }}>
                <button onClick={onBack} style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'Caveat', cursive", fontSize: "1.3rem", fontWeight: 700, color: "#2C1A0E",
                }}>←</button>
                <h1 style={{ fontFamily: "'Caveat', cursive", fontSize: "2rem", fontWeight: 700, color: "#2C1A0E", margin: 0 }}>
                    Messages ✦
                </h1>
            </header>

            <main style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>
                {loading && (
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: "60px" }}>
                        <div className="spin" style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            border: "3px solid #C17D3C", borderTopColor: "transparent",
                        }} />
                    </div>
                )}

                {!loading && chats.length === 0 && (
                    <div style={{ textAlign: "center", paddingTop: "80px" }}>
                        <p style={{ fontFamily: "'Caveat', cursive", fontSize: "1.8rem", color: "#A0622A" }}>No chats yet ☕</p>
                        <p style={{ fontSize: "0.875rem", color: "#7A5C3C" }}>Go to matches and start a conversation!</p>
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {chats.map(chat => {
                        const other = chat.otherUser;
                        const time = chat.lastAt?.toDate?.()?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "";
                        return (
                            <button key={chat.id} onClick={() => setOpenChat(other)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "14px",
                                    padding: "14px 16px", background: "#FDF6EE",
                                    border: "2.5px solid #2C1A0E", borderRadius: "12px",
                                    boxShadow: "3px 3px 0 #2C1A0E", cursor: "pointer",
                                    textAlign: "left", width: "100%", transition: "transform 0.1s",
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translate(-1px,-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = ""}>

                                {/* Avatar */}
                                <div style={{
                                    width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                                    background: "#C17D3C", border: "2px solid #2C1A0E",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: "1.2rem", color: "#FDF6EE",
                                }}>
                                    {other?.name?.[0]?.toUpperCase() ?? "?"}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <p style={{ margin: 0, fontWeight: 800, color: "#2C1A0E", fontSize: "0.95rem" }}>
                                            {other?.name ?? "Unknown"}
                                        </p>
                                        <span style={{ fontSize: "0.65rem", color: "#A0622A", flexShrink: 0 }}>{time}</span>
                                    </div>
                                    <p style={{
                                        margin: "2px 0 0", fontSize: "0.8rem", color: "#7A5C3C", fontWeight: 600,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                        {chat.lastMessage || "Start a conversation ✦"}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}