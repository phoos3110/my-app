import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { withTimeout } from "@/lib/withTimeout";

export function syncUserProfile(user) {
  return withTimeout(
    setDoc(
      doc(db, "users", user.uid),
      {
        displayName: user.displayName || "",
        email: user.email || "",
        lastLoginAt: serverTimestamp(),
      },
      { merge: true },
    ),
  );
}

export function watchUsers(onChange, onError) {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      onChange(snapshot.docs.map((item) => ({ ...item.data(), uid: item.id })));
    },
    onError,
  );
}

export function watchRoles(onChange, onError) {
  return onSnapshot(
    collection(db, "roles"),
    (snapshot) => {
      onChange(
        Object.fromEntries(
          snapshot.docs.map((item) => [
            item.id,
            item.data().role === "admin" ? "admin" : "user",
          ]),
        ),
      );
    },
    onError,
  );
}
