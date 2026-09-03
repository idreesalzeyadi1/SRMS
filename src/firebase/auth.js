import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./config";

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

// Fires with the Firebase user (or null) whenever auth state changes,
// and again immediately with the current state.
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
