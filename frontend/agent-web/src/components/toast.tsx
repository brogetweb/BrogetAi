"use client";

import { useCallback, useRef, useState } from "react";
import { IconAlert, IconCheck, IconX } from "@/components/icons";

export type Notify = (ok: boolean, title: string, detail?: string) => void;

type Toast = {
  id: number;
  ok: boolean;
  title: string;
  detail?: string;
  /** Bumped when the same message repeats, so its timer restarts instead of stacking a duplicate. */
  version: number;
  leaving: boolean;
};

const MAX_VISIBLE = 3;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  // Stable identity: children list `notify` in effect deps.
  const notify = useCallback<Notify>((ok, title, detail) => {
    setToasts((list) => {
      const same = list.find((t) => !t.leaving && t.ok === ok && t.title === title && t.detail === detail);
      if (same) return list.map((t) => (t.id === same.id ? { ...t, version: t.version + 1 } : t));
      const next: Toast = { id: ++nextId.current, ok, title, detail, version: 0, leaving: false };
      const active = list.filter((t) => !t.leaving);
      // Over the limit: start the oldest one leaving rather than dropping it abruptly.
      const overflow = active.length >= MAX_VISIBLE ? active[0].id : null;
      return [...list.map((t) => (t.id === overflow ? { ...t, leaving: true } : t)), next];
    });
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  return { toasts, notify, dismiss, remove };
}

export function Toaster({ toasts, onDismiss, onRemove }: { toasts: Toast[]; onDismiss: (id: number) => void; onRemove: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[95] flex flex-col items-stretch gap-2.5 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[23rem]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.ok ? "status" : "alert"}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget && toast.leaving) onRemove(toast.id);
          }}
          className={`group pointer-events-auto relative overflow-hidden rounded-2xl border bg-white/95 shadow-[0_18px_40px_-12px_rgba(10,16,32,0.28)] backdrop-blur-xl ${
            toast.ok ? "border-emerald-100" : "border-red-100"
          } ${toast.leaving ? "toast-out" : "toast-in"}`}
        >
          <span className={`absolute inset-y-0 left-0 w-1 ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`} />
          <div className="flex items-start gap-3 py-3.5 pl-4 pr-3">
            <span
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                toast.ok ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-red-50 text-red-600 ring-1 ring-red-100"
              }`}
            >
              {toast.ok ? <IconCheck size={16} /> : <IconAlert size={16} />}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-semibold leading-5 text-ink">{toast.title}</p>
              {toast.detail ? <p className="mt-0.5 break-words text-[13px] leading-5 text-muted">{toast.detail}</p> : null}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(toast.id)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-subtle transition hover:bg-soft hover:text-ink"
            >
              <IconX size={15} />
            </button>
          </div>
          {/* Time-left bar; hovering pauses it. Its end triggers the dismiss. */}
          {!toast.leaving ? (
            <span
              key={toast.version}
              onAnimationEnd={(e) => {
                e.stopPropagation();
                onDismiss(toast.id);
              }}
              className={`toast-progress absolute bottom-0 left-0 h-[3px] w-full origin-left group-hover:[animation-play-state:paused] ${
                toast.ok ? "bg-emerald-500/70" : "bg-red-500/70"
              }`}
              style={{ animationDuration: toast.ok ? "4500ms" : "7000ms" }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
