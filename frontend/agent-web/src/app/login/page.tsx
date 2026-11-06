"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAgent, restoreSession, saveSession } from "@/lib/api";
import { IconAlert, IconArrowRight, IconCheck, IconEye, IconEyeOff, IconLock, IconMail, IconShield } from "@/components/icons";
import { Logo } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    restoreSession().then((user) => {
      if (user) router.replace("/app");
    });
  }, [router]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await loginAgent(email.trim(), password);
      saveSession(session);
      router.replace("/app");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-2">
      {/* Form side */}
      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="bg-dots mask-radial pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex items-center justify-between">
          <Logo />
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Back to website
          </Link>
        </div>

        <div className="relative flex flex-1 items-center justify-center py-12">
          <div className="fade-up w-full max-w-[400px]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-white text-brand shadow-[var(--shadow-card)]">
              <IconLock size={20} />
            </span>
            <h1 className="mt-6 text-[2rem] font-bold leading-tight text-ink">Sign in to your desk</h1>
            <p className="mt-2 text-[15px] text-muted">Use the email and password provided by your Super Admin.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="field-label">Email address</span>
                <span className="relative block">
                  <IconMail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="username"
                    placeholder="you@company.com"
                    className="input h-12 pl-10"
                  />
                </span>
              </label>

              <label className="block">
                <span className="field-label">Password</span>
                <span className="relative block">
                  <IconLock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="input h-12 pl-10 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-subtle hover:bg-soft hover:text-ink"
                  >
                    {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                  </button>
                </span>
              </label>

              {error ? (
                <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
                  <IconAlert size={16} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              ) : null}

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? (
                  <>
                    <Spinner /> Signing in…
                  </>
                ) : (
                  <>
                    Sign in <IconArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-muted shadow-[var(--shadow-xs)]">
              <IconShield size={18} className="mt-0.5 shrink-0 text-brand" />
              <p>
                No account yet? Your <span className="font-medium text-ink">Super Admin</span> creates agent logins - it&apos;s the same account as the mobile
                app.
              </p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-subtle">© {new Date().getFullYear()} Broget AI · Encrypted agent session</p>
      </main>

      {/* Showcase side */}
      <aside className="relative hidden bg-navy-900 p-4 lg:block">
        <div className="noise relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[linear-gradient(150deg,#0b1426_0%,#0f2a5c_55%,#0057e0_100%)] p-12 text-white">
          <div className="bg-grid-dark mask-radial absolute inset-0" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#22a6f2]/25 blur-[100px]" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> Synced with the mobile app
            </span>
            <h2 className="mt-6 max-w-md text-4xl font-bold leading-[1.1]">Your CIBIL desk, now on a bigger screen.</h2>
            <ul className="mt-8 space-y-3.5">
              {["Run consent-based CIBIL checks", "Top up Broget Pay over UPI", "View and download PDF reports"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20">
                    <IconCheck size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Floating preview cards - illustrative only */}
          <div className="relative mt-auto h-64" aria-hidden>
            <div className="drift absolute bottom-4 left-0 w-72 rounded-2xl bg-white p-5 text-ink shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-subtle">Latest score</p>
                <span className="badge bg-emerald-50 text-emerald-700">Excellent</span>
              </div>
              <p className="font-display tabular mt-2 text-4xl font-bold">782</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[linear-gradient(90deg,#fca5a5,#fcd34d,#93c5fd,#6ee7b7)]">
                <div className="ml-[80%] h-2 w-1.5 rounded-full bg-ink" />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-subtle">
                <span>300</span>
                <span>900</span>
              </div>
            </div>
            <div className="absolute bottom-36 right-0 w-60 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
              <p className="text-xs text-white/60">Broget Pay balance</p>
              <p className="font-display tabular mt-1 text-2xl font-bold">₹4,820.00</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300">
                <IconCheck size={13} /> Top-up confirmed
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}
