import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export function watchUserRole(uid, onChange, onError) {
  return onSnapshot(doc(db, "roles", uid), { includeMetadataChanges: true }, (snapshot) => {
    // Chỉ hiện quyền admin sau khi dữ liệu được xác nhận từ máy chủ.
    const isAdmin = !snapshot.metadata.fromCache && snapshot.data()?.role === "admin";
    onChange(isAdmin ? "admin" : "user");
  }, onError);
}
