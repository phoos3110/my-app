import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export function watchUserRole(uid, onChange, onError) {
  const timer = setTimeout(() => {
    const error = new Error("Chưa xác nhận được quyền từ máy chủ.");
    error.code = "app/role-timeout";
    onError(error);
  }, 15000);
  const unsubscribe = onSnapshot(doc(db, "roles", uid), { includeMetadataChanges: true }, (snapshot) => {
    // Dữ liệu cache chưa đủ để quyết định trang admin hay user.
    if (snapshot.metadata.fromCache) return;
    clearTimeout(timer);
    onChange(snapshot.data()?.role === "admin" ? "admin" : "user");
  }, (error) => {
    clearTimeout(timer);
    onError(error);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
