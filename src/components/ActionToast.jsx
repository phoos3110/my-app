import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActionToast({ message, type }) {
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, [paused]);

  if (!visible) return null;
  const Icon = type === "error" ? CircleAlert : CheckCircle2;

  return (
    <div
      className="fixed inset-x-4 top-[max(1rem,env(safe-area-inset-top))] z-50 mx-auto flex max-w-md animate-in slide-in-from-top-full fade-in duration-300 items-center gap-3 rounded-xl border bg-white p-4 shadow-lg motion-reduce:animate-none"
      role={type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setPaused(false);
      }}
    >
      <Icon
        className={`size-5 shrink-0 ${type === "error" ? "text-destructive" : "text-emerald-600"}`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm wrap-break-word">{message}</p>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Đóng thông báo"
        onClick={() => setVisible(false)}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}
