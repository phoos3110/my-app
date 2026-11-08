import { Button } from "@/components/ui/button";
import { Sparkles, LogOut } from "lucide-react";

function CuteCat() {
  return (
    <svg viewBox="0 0 300 240" role="img" aria-labelledby="cat-title" className="mx-auto w-full max-w-72">
      <title id="cat-title">Mèo nhỏ dễ thương bên chiếc laptop</title>
      <ellipse cx="150" cy="115" rx="116" ry="102" fill="#ede9fe" />
      <path d="m48 60 4-10 4 10 10 4-10 4-4 10-4-10-10-4Z" fill="#fbbf24" />
      <circle cx="253" cy="72" r="6" fill="#f9a8d4" />
      <ellipse cx="152" cy="218" rx="99" ry="11" fill="#ddd6fe" />
      <path d="M202 180c45-34 59 26 23 26h-25" fill="none" stroke="#edbc91" strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="150" cy="171" rx="59" ry="44" fill="#ffdfb9" stroke="#9a7158" strokeWidth="3" />
      <path d="m88 97 1-59 49 33m35 0 43-33-2 61" fill="#ffdfb9" stroke="#9a7158" strokeWidth="3" strokeLinejoin="round" />
      <path d="m97 75 1-22 23 23m67-1 19-22-1 26" fill="#f4b7b4" />
      <ellipse cx="151" cy="105" rx="69" ry="54" fill="#ffdfb9" stroke="#9a7158" strokeWidth="3" />
      <path d="M108 105q10-13 20 0m46 0q10-13 20 0" fill="none" stroke="#614b44" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="108" cy="119" rx="11" ry="6" fill="#f6b5ae" />
      <ellipse cx="194" cy="119" rx="11" ry="6" fill="#f6b5ae" />
      <path d="m145 113 6 5 6-5Z" fill="#c28382" />
      <path d="M151 118v5m-10-1q5 8 10 1 5 7 10-1" fill="none" stroke="#614b44" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="89" y="155" width="125" height="60" rx="10" fill="#a5b4fc" stroke="#6366b5" strokeWidth="3" />
      <path d="M82 215h139" stroke="#6366b5" strokeWidth="7" strokeLinecap="round" />
      <path d="M151 177c-13-14-25 8 0 19 25-11 13-33 0-19Z" fill="#f5f3ff" />
      <ellipse cx="96" cy="154" rx="13" ry="8" fill="#ffdfb9" stroke="#9a7158" strokeWidth="2.5" />
      <ellipse cx="207" cy="154" rx="13" ry="8" fill="#ffdfb9" stroke="#9a7158" strokeWidth="2.5" />
    </svg>
  );
}

export default function AccountPage({ onLogout, loading }) {
  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-b from-violet-50 via-white to-pink-50">
      <header className="flex justify-end p-5">
        <Button variant="outline" className="h-11 bg-white/80" onClick={onLogout} disabled={loading}>
          <LogOut aria-hidden="true" />Đăng xuất
        </Button>
      </header>
      <main className="grid flex-1 place-items-center px-6 pb-20" aria-label="Trang người dùng">
        <section className="w-full max-w-lg text-center">
          <CuteCat />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-4 py-2 text-xs font-medium text-violet-600">
            <Sparkles className="size-4" aria-hidden="true" />Một chút mới mẻ đang đến
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">Đang cập nhật</h1>
          <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-slate-500">
            Mèo nhỏ đang chăm chỉ chuẩn bị những điều thú vị. Bạn quay lại sau một chút nhé!
          </p>
          <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
            <span className="size-2 rounded-full bg-violet-300" />
            <span className="size-2 rounded-full bg-pink-300" />
            <span className="size-2 rounded-full bg-amber-200" />
          </div>
        </section>
      </main>
    </div>
  );
}
