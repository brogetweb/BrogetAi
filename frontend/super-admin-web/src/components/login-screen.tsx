"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { publicWebsiteUrl } from "@/components/public-chrome";
import { login, type AdminSession } from "@/lib/api";

const features: [string, string][] = [
  ["Agents & wallets", "Create agents, reset passwords, see every top-up and what they spent."],
  ["CIBIL reports", "Per-agent checks, revenue and every report, with PAN masked."],
  ["Bookings", "Flights and hotels paid through Book by Broget AI."],
];

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
    <div className="grid h-dvh overflow-y-auto bg-[#f3f6fb] lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[linear-gradient(150deg,#0f1d3a_0%,#13285a_50%,#1d3f99_100%)] text-white lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-[#2f6bff]/35 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[#7c3aed]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />

        <a href={publicWebsiteUrl} className="relative flex items-center gap-3">
          <Image src="/mark.png" alt="" width={44} height={44} className="h-11 w-11 rounded-2xl" />
          <span>
            <span className="block text-lg font-extrabold tracking-tight">Broget AI</span>
            <span className="block text-[10px] font-bold tracking-[0.16em] text-[#9fb0d0]">SUPER ADMIN</span>
          </span>
        </a>

        <div className="relative max-w-lg">
          <h1 className="text-[44px] font-extrabold leading-[1.05] tracking-[-0.04em]">The whole desk,<br />one sign-in.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-white/70">Manage agents, wallets, CIBIL checks and bookings from a single, secure panel.</p>
          <ul className="mt-8 space-y-3">
            {features.map(([title, copy]) => (
              <li key={title} className="flex gap-3 rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10 backdrop-blur">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#2f6bff] text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" /></svg>
                </span>
                <span>
                  <span className="block text-sm font-extrabold">{title}</span>
                  <span className="block text-[13px] leading-5 text-white/65">{copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs font-semibold text-white/55">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6l-8-3z" /></svg>
          Encrypted sessions · admin access only
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Image src="/mark.png" alt="" width={40} height={40} className="h-10 w-10 rounded-2xl" />
            <span className="text-lg font-extrabold">Broget AI · Super Admin</span>
          </div>
          <div className="rounded-3xl border border-[#e6ebf5] bg-white p-7 shadow-[0_24px_60px_-30px_rgba(18,24,43,0.35)] sm:p-8">
            <p className="text-xs font-extrabold tracking-[0.18em] text-[#2f6bff]">WELCOME BACK</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#12182b]">Sign in</h2>
            <p className="mt-2 text-sm font-semibold text-[#5c677a]">Use your super admin email and password.</p>

            <form className="mt-7 space-y-4" onSubmit={submit}>
              <label className="block text-sm font-extrabold text-[#12182b]">
                Email
                <span className="relative mt-1.5 block">
                  <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b95a7]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@brogetai.com"
                    className="w-full rounded-xl border border-[#e3e9f3] bg-[#f8fafc] py-3 pl-10 pr-3 font-semibold outline-none transition placeholder:text-[#a3adbd] focus:border-[#2f6bff] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,255,0.12)]"
                  />
                </span>
              </label>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="admin-password" className="text-sm font-extrabold text-[#12182b]">Password</label>
                  <button type="button" onClick={() => setShow((open) => !open)} className="text-xs font-extrabold text-[#2f6bff]">
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                <span className="relative mt-1.5 block">
                  <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b95a7]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" /></svg>
                  <input
                    id="admin-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    className="w-full rounded-xl border border-[#e3e9f3] bg-[#f8fafc] py-3 pl-10 pr-3 font-semibold outline-none transition placeholder:text-[#a3adbd] focus:border-[#2f6bff] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,255,0.12)]"
                  />
                </span>
              </div>
              {error ? (
                <p role="alert" className="rounded-xl bg-[#fff1f2] px-3 py-2.5 text-sm font-bold text-[#be123c]">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="mt-1 w-full rounded-xl bg-[linear-gradient(180deg,#4a7dff,#2f6bff_55%,#2559e6)] py-3.5 text-sm font-extrabold text-white shadow-[0_12px_24px_-12px_rgba(47,107,255,0.8)] transition hover:brightness-105 disabled:opacity-60"
              >
                {pending ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs font-semibold text-[#8b95a7]">
            © {new Date().getFullYear()} Broget AI Private Limited ·{" "}
            <a href={publicWebsiteUrl} className="font-extrabold text-[#2f6bff]">Website</a>
          </p>
        </div>
      </section>
    </div>
  );
}
