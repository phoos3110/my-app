import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/config/firebase";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export const watchAuthState = (onChange, onError) =>
  onAuthStateChanged(auth, onChange, onError);
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const logout = () => signOut(auth);
