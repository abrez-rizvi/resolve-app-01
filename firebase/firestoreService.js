import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const createUserDoc = async (uid, { displayName }) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
  displayName: displayName,
  currentStreak: 0,
  bestStreak: 0,
  lastCheckIn: null,
  relapseCount: 0,
  logs: [],
  badges: [],
}, { merge: true });
};
