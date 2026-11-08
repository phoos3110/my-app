import { Button } from "@/components/ui/button";

export default function AccountPage({ onLogout, loading }) {
  return (
    <div className="min-h-dvh bg-white">
      <header className="flex justify-end p-5">
        <Button variant="outline" onClick={onLogout} disabled={loading}>
          Đăng xuất
        </Button>
      </header>
      <main aria-label="Trang người dùng" />
    </div>
  );
}
