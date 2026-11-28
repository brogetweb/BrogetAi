"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LoginForm, RegisterForm, profileComplete } from "@/components/auth-forms";
import type { Traveller } from "@/lib/api";
import { Icon } from "@/components/icons";

type Mode = "login" | "register";
type OpenDetail = { mode: Mode; next?: string };

/** Open the side drawer from anywhere: openAuth("login", "/book"). */
export function openAuth(mode: Mode, next?: string) {
  window.dispatchEvent(new CustomEvent<OpenDetail>("bbb-open-auth", { detail: { mode, next } }));
}

/** After signing in: an incomplete profile goes to "Complete your profile", otherwise on to `next`. */
export function afterAuth(router: ReturnType<typeof useRouter>, user: Traveller | null, next?: string) {
  if (!profileComplete(user)) router.push(`/profile?complete=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  else if (next) router.push(next);
  else router.refresh();
}

export function AuthDrawer() {
  const router = useRouter();
  const [state, setState] = useState<OpenDetail | null>(null);

  useEffect(() => {
    const open = (e: Event) => setState((e as CustomEvent<OpenDetail>).detail);
    window.addEventListener("bbb-open-auth", open);
    return () => window.removeEventListener("bbb-open-auth", open);
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setState(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  if (!state) return null;
  const mode = state.mode;
  const done = (user: Traveller) => {
    const next = state.next;
    setState(null);
    afterAuth(router, user, next);
  };

  // Portal to <body>: the sticky header uses backdrop-blur, which would otherwise trap this fixed panel inside it.
  return createPortal(
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true" aria-label={mode === "login" ? "Log in" : "Create profile"}>
      <button type="button" aria-label="Close" onClick={() => setState(null)} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] [animation:fade_.2s_ease]" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-white shadow-2xl [animation:slide-in_.32s_cubic-bezier(.22,1,.36,1)]">
        <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1630,#123a8f_60%,#1d5bff)] px-6 pb-6 pt-5 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky/40 blur-3xl" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-bold tracking-[.18em] text-white/60">{mode === "login" ? "WELCOME BACK" : "CREATE PROFILE"}</p>
              <h2 className="mt-1 text-2xl font-extrabold">{mode === "login" ? "Log in to your profile" : "Create your traveller profile"}</h2>
              <p className="mt-1 text-sm text-white/70">{state.next === "/book" ? "Sign in to book your selected flight." : mode === "login" ? "Use the email you signed up with." : "Needed once before your first booking."}</p>
            </div>
            <button type="button" onClick={() => setState(null)} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/80 hover:bg-white/15"><Icon name="close" size={18} /></button>
          </div>
          <div className="relative mt-5 grid grid-cols-2 rounded-xl bg-white/10 p-1" role="tablist">
            {(["login", "register"] as Mode[]).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setState({ ...state, mode: m })} className={`rounded-lg py-2 text-sm font-bold transition ${mode === m ? "bg-white text-ink shadow" : "text-white/80 hover:text-white"}`}>
                {m === "login" ? "Log in" : "Create profile"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {mode === "login" ? (
            <LoginForm key="login" onDone={done} onSwitch={() => setState({ ...state, mode: "register" })} />
          ) : (
            <RegisterForm key="register" onDone={done} onSwitch={() => setState({ ...state, mode: "login" })} />
          )}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-subtle"><Icon name="lock" size={13} /> Your details are encrypted and never shared.</p>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
