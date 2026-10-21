"use client";

import Image from "next/image";
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
    <div className="flex h-dvh flex-col overflow-y-auto bg-[#eef3fb]">
      <PublicHeader />
      <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#0e1b33] text-white lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#2f6bff]/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-[#2f6bff]/20 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <Image src="/mark.png" alt="BerogetAI" width={48} height={48} className="h-12 w-12 rounded-2xl" />
            <div>
              <p className="text-lg font-extrabold tracking-tight">BerogetAI</p>
              <p className="text-[11px] font-bold tracking-[0.16em] text-[#9fb0d0]">SUPER ADMIN</p>
            </div>
          </div>
          <div className="relative max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight">The whole desk, in one sign-in.</h1>
            <p className="mt-4 text-base font-semibold leading-7 text-[#c5d2ea]">Flights, hotels, every agent's customers, and the CIBIL reports they run.</p>
            <div className="mt-8 grid gap-3">
              {["Flights and hotels", "Every agent's customers", "CIBIL reports from the agents"].map((item) => (
                <p key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold">{item}</p>
              ))}
            </div>
          </div>
          <p className="relative text-xs font-bold tracking-[0.12em] text-[#7f93b8]">SIGNED IN THROUGH THE API</p>
        </section>

        <section className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <Image src="/mark.png" alt="BerogetAI" width={44} height={44} className="h-11 w-11 rounded-2xl" />
              <div>
                <p className="text-base font-extrabold">BerogetAI</p>
                <p className="text-[10px] font-bold tracking-[0.14em] text-[#8b95a7]">SUPER ADMIN</p>
              </div>
            </div>
            <div className="rounded-[28px] border border-[#e6ebf5] bg-white p-6 shadow-[0_20px_50px_rgba(18,24,43,0.06)] sm:p-8">
              <h2 className="text-2xl font-extrabold tracking-tight">Welcome back</h2>
              <p className="mt-1 text-sm font-semibold text-[#5c677a]">Sign in with the super admin email and password.</p>
              <form className="mt-6 space-y-4" onSubmit={submit}>
                <label className="block text-sm font-extrabold">
                  Email
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@beroget.ai"
                    className="mt-1 w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-semibold outline-none transition-colors duration-200 focus:border-[#2f6bff]"
                  />
                </label>
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="admin-password" className="text-sm font-extrabold">Password</label>
                    <button type="button" onClick={() => setShow((open) => !open)} className="text-xs font-extrabold text-[#2f6bff]">
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
                    className="mt-1 w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-semibold outline-none transition-colors duration-200 focus:border-[#2f6bff]"
                  />
                </div>
                {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}
                <button type="submit" disabled={pending} className="w-full rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(47,107,255,0.28)] disabled:opacity-60">
                  {pending ? "Signing in" : "Login"}
                </button>
              </form>
              <p className="mt-5 rounded-2xl bg-[#f4f7fc] px-4 py-3 text-xs font-semibold leading-5 text-[#5c677a]">
                Sign-in is checked by the API. The first super admin is created in Mongo from the API env.
              </p>
            </div>
          </div>
        </section>
      </div>
      <PublicFooter />
    </div>
  );
}
