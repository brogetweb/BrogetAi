"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AccountScreen({ mode }: { mode: "login" | "register" }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

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
    <>
      <SiteHeader />
      <main className="bg-[#f6f5f2] px-4 pb-20 pt-24 text-[#17191e] lg:px-8">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-slate-200 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="flex flex-col justify-between bg-[#12141a] p-8 text-white sm:p-10">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-300 uppercase">Account</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">One account for the fare and the room.</h1>
              <ul className="mt-8 space-y-3 text-sm text-white/75">
                <li>Search flights and holds from the same profile.</li>
                <li>Keep hotel stays next to the fare you picked.</li>
                <li>Credit score and SIP stay on this account.</li>
              </ul>
            </div>
            <p className="mt-10 text-sm text-white/50">BerogetAI</p>
          </aside>

          <div className="p-6 sm:p-10">
            <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold" role="tablist" aria-label="Account">
              <Link href="/login" role="tab" aria-selected={mode === "login"} className={`flex-1 rounded-full px-4 py-2 text-center ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                Log in
              </Link>
              <Link href="/register" role="tab" aria-selected={mode === "register"} className={`flex-1 rounded-full px-4 py-2 text-center ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                Register
              </Link>
            </div>

            {sent ? (
              <div className="mt-8" role="status">
                <h2 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Welcome back." : "Account created."}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === "login" ? `${email} is ready to search.` : `${name ? `${name}, your` : "Your"} account is ${email}.`}
                </p>
                <Link href="/" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                  Continue
                </Link>
              </div>
            ) : (
              <form className="mt-8" onSubmit={submit}>
                <h2 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Log in" : "Create an account"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {mode === "login" ? "Use the email and password for your BerogetAI account." : "A name, an email, and a password are enough to start."}
                </p>

                {mode === "register" ? <Field label="Full name" name="name" autoComplete="name" /> : null}
                <Field label="Email" name="email" type="email" autoComplete="email" />
                <PasswordField show={show} onToggle={() => setShow((value) => !value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
                {mode === "register" ? <PasswordField label="Confirm password" name="confirm" show={show} autoComplete="new-password" /> : null}

                {error ? <p role="alert" className="mt-4 text-sm font-semibold text-rose-600">{error}</p> : null}

                <button type="submit" className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
                  {mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete: string }) {
  return (
    <label className="mt-5 block text-sm font-semibold text-slate-700">
      {label}
      <input required name={name} type={type} autoComplete={autoComplete} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 font-medium text-slate-900 outline-none focus:border-indigo-400 focus:bg-white" />
    </label>
  );
}

function PasswordField({
  label = "Password",
  name = "password",
  show,
  onToggle,
  autoComplete,
}: {
  label?: string;
  name?: string;
  show: boolean;
  onToggle?: () => void;
  autoComplete: string;
}) {
  return (
    <label className="mt-5 block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-1.5 block">
        <input required name={name} type={show ? "text" : "password"} minLength={8} autoComplete={autoComplete} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-16 font-medium text-slate-900 outline-none focus:border-indigo-400 focus:bg-white" />
        {onToggle ? (
          <button type="button" onClick={onToggle} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-slate-500">
            {show ? "Hide" : "Show"}
          </button>
        ) : null}
      </span>
    </label>
  );
}
