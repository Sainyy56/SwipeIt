import {
  collection, doc, setDoc, getDoc, getDocs,
  addDoc, onSnapshot, query, orderBy,
  serverTimestamp, updateDoc
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Generate a consistent chat ID for two users (sorted so A-B == B-A)
 */
export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

/**
 * Create or fetch a chat between two users.
 * Stores participant UIDs on the doc for easy querying.
 */
export async function getOrCreateChat(uid1, uid2) {
  const chatId = getChatId(uid1, uid2);
  const chatRef = doc(db, "chats", chatId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      participants: [uid1, uid2],
      createdAt: serverTimestamp(),
      lastMessage: "",
      lastAt: serverTimestamp(),
    });
  }
  return chatId;
}

/**
 * Send a message into a chat.
 */
export async function sendMessage(chatId, senderUid, text) {
  const msgsRef = collection(db, "chats", chatId, "messages");
  await addDoc(msgsRef, {
    senderUid,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
  // Update last message preview on parent doc
  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: text.trim().slice(0, 60),
    lastAt: serverTimestamp(),
  });
}

/**
 * Subscribe to messages in real-time.
 * Returns unsubscribe function.
 */
export function subscribeToMessages(chatId, callback) {
  const msgsRef = collection(db, "chats", chatId, "messages");
  const q = query(msgsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

/**
 * Get all chats for a user (not real-time, called once).
 */
export async function getUserChats(uid) {
  const snap = await getDocs(collection(db, "chats"));
  return snap.docs
    .filter((d) => d.data().participants?.includes(uid))
    .map((d) => ({ id: d.id, ...d.data() }));
}