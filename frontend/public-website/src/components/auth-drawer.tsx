"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Mode = "login" | "register";

const AuthContext = createContext<{ openAuth: (mode: Mode) => void }>({ openAuth: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const openAuth = useCallback((next: Mode) => {
    setMode(next);
    setOpen(true);
  }, []);

  return (
    <AuthContext.Provider value={{ openAuth }}>
      {children}
      <AuthDrawer open={open} mode={mode} onMode={setMode} onClose={() => setOpen(false)} />
    </AuthContext.Provider>
  );
}

export function OpenAccount({ mode, className, children }: { mode: Mode; className?: string; children: React.ReactNode }) {
  const { openAuth } = useAuth();
  return (
    <button type="button" className={className} onClick={() => openAuth(mode)}>
      {children}
    </button>
  );
}

function AuthDrawer({ open, mode, onMode, onClose }: { open: boolean; mode: Mode; onMode: (mode: Mode) => void; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  function switchMode(next: Mode) {
    setSent(false);
    setError("");
    onMode(next);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (mode === "register" && password !== confirm) {
      setError("Those passwords do not match.");
      setSent(false);
      return;
    }
    setError("");
    setName(String(data.get("name") || ""));
    setEmail(String(data.get("email") || ""));
    setSent(true);
  }

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button type="button" aria-label="Close account" className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={mode === "login" ? "Log in" : "Register"}
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold">Account</p>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto px-5 py-6">
          <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold" role="tablist" aria-label="Account">
            <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")} className={`flex-1 rounded-full px-4 py-2 ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              Log in
            </button>
            <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")} className={`flex-1 rounded-full px-4 py-2 ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              Register
            </button>
          </div>

          {sent ? (
            <div className="mt-8" role="status">
              <h2 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Welcome back." : "Account created."}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "login" ? `${email} is ready to search.` : `${name}, your account is ${email}.`}
              </p>
              <button type="button" onClick={onClose} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                Continue
              </button>
            </div>
          ) : (
            <form className="mt-8" onSubmit={submit} key={mode}>
              <h2 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Log in" : "Create an account"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {mode === "login" ? "Use the email and password for your BerogetAI account." : "A name, an email, and a password are enough to start."}
              </p>
              {mode === "register" ? <Field label="Name" name="name" placeholder="Name" autoComplete="name" /> : null}
              <Field label="Email" name="email" type="email" placeholder="Email" autoComplete="email" />
              <PasswordField placeholder="Password" show={show} onToggle={() => setShow((value) => !value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              {mode === "register" ? <PasswordField label="Confirm password" name="confirm" placeholder="Confirm password" show={show} autoComplete="new-password" /> : null}
              {error ? <p role="alert" className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}
              <button type="submit" className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                {mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, autoComplete }: { label: string; name: string; type?: string; placeholder: string; autoComplete: string }) {
  return (
    <label className="mt-5 block text-sm font-semibold text-slate-700">
      {label}
      <input required name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white" />
    </label>
  );
}

function PasswordField({
  label = "Password",
  name = "password",
  placeholder,
  show,
  onToggle,
  autoComplete,
}: {
  label?: string;
  name?: string;
  placeholder: string;
  show: boolean;
  onToggle?: () => void;
  autoComplete: string;
}) {
  return (
    <label className="mt-5 block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-1.5 block">
        <input required name={name} type={show ? "text" : "password"} placeholder={placeholder} minLength={8} autoComplete={autoComplete} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-16 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white" />
        {onToggle ? (
          <button type="button" onClick={onToggle} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-slate-500">
            {show ? "Hide" : "Show"}
          </button>
        ) : null}
      </span>
    </label>
  );
}
