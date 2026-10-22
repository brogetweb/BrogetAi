"use client";

import { useState, type FormEvent } from "react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { login, type AdminSession } from "@/lib/api";

export function LoginScreen({ onSuccess, onError }: { onSuccess: (session: AdminSession) => void; onError: (message: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || password.length < 8) {
      const message = "Enter the super admin email and password.";
      setError(message);
      onError(message);
      return;
    }
    setPending(true);
    setError("");
    try {
      onSuccess(await login(mail, password));
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "That email or password does not match.";
      setError(message);
      onError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-y-auto bg-white">
      <PublicHeader />
      <div className="grid min-h-[36rem] flex-1 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0b1b3a] text-white lg:flex lg:flex-col lg:justify-between lg:px-16 lg:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(47,107,255,0.35),transparent_36%)]" />
        <div className="relative max-w-lg">
          <p className="text-xs font-bold tracking-[0.22em] text-blue-100 uppercase">Super admin</p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-extrabold tracking-[-0.045em]">The whole desk, in one sign-in.</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-white/75">Flights, hotels, every agent's customers, and the CIBIL reports they run.</p>
        </div>
        <p className="relative text-sm font-semibold text-blue-100/80">Signed in through the API</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <p className="text-xs font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">Welcome back</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-[#12182b]">Sign in</h2>
          <p className="mt-3 text-base leading-7 text-[#5c677a]">Use the super admin email and password.</p>
          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="block text-sm font-bold text-[#12182b]">
              Email
              <input
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@beroget.ai"
                className="mt-2 w-full border-b border-slate-300 bg-transparent px-0 py-3 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#1d4ed8]"
              />
            </label>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="text-sm font-bold text-[#12182b]">Password</label>
                <button type="button" onClick={() => setShow((open) => !open)} className="text-xs font-bold text-[#1d4ed8]">
                  {show ? "Hide" : "Show"}
                </button>
              </div>
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                className="mt-2 w-full border-b border-slate-300 bg-transparent px-0 py-3 font-semibold outline-none transition placeholder:text-slate-400 focus:border-[#1d4ed8]"
              />
            </div>
            {error ? <p role="alert" className="text-sm font-semibold text-rose-700">{error}</p> : null}
            <button type="submit" disabled={pending} className="mt-2 w-full bg-[#1d4ed8] py-3.5 text-sm font-bold text-white transition hover:bg-[#1e40af] disabled:opacity-60">
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </section>
      </div>
      <PublicFooter />
    </div>
  );
}
