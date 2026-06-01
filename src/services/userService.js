import { setDoc, doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

export async function saveUserProfile(userId, profileData) {
  const userDocRef = doc(db, "users", userId);
  await setDoc(userDocRef, profileData, { merge: true });
}

export async function getCurrentUserProfile(userId) {
  const userDocRef = doc(db, "users", userId);
  const snapshot = await getDoc(userDocRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getOtherUsers(currentUserId) {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .filter((d) => d.id !== currentUserId)
    .map((d) => ({ id: d.id, ...d.data() }));
}
