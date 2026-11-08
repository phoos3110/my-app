import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserDetailsDialog({ user, role, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  function handleBackdropClick(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }

  return (
    <dialog ref={dialogRef} aria-labelledby="user-details-title"
      className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto overscroll-contain rounded-2xl border bg-card p-4 text-card-foreground shadow-xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm sm:p-6 [&_dd]:wrap-anywhere"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={handleBackdropClick}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="user-details-title" className="text-lg font-semibold">Chi tiết người dùng</h2>
        <Button variant="ghost" size="icon-sm" className="size-11 shrink-0" aria-label="Đóng chi tiết" onClick={onClose}><X aria-hidden="true" /></Button>
      </div>
      <dl className="grid gap-5 text-sm">
        <div><dt className="mb-1 text-muted-foreground">Họ tên</dt><dd className="wrap-break-word font-medium">{user.displayName || "Chưa có tên"}</dd></div>
        <div><dt className="mb-1 text-muted-foreground">Email</dt><dd className="wrap-break-word">{user.email || "Chưa có email"}</dd></div>
        <div><dt className="mb-1 text-muted-foreground">UID</dt><dd className="wrap-break-word font-mono">{user.uid}</dd></div>
        <div><dt className="mb-1 text-muted-foreground">Vai trò</dt><dd>{role === "admin" ? "Admin" : role === "user" ? "User" : "Chưa tải được"}</dd></div>
        <div><dt className="mb-1 text-muted-foreground">Đăng nhập gần nhất</dt><dd>{user.lastLoginAt?.toDate ? user.lastLoginAt.toDate().toLocaleString("vi-VN") : "Chưa có dữ liệu"}</dd></div>
      </dl>
    </dialog>
  );
}
