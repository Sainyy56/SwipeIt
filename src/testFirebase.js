import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

export async function testFirebase() {
  try {
    const docRef = await addDoc(collection(db, "test"), {
      message: "Firebase connected successfully 🚀",
      time: new Date()
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}