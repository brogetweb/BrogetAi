"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { login } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(id.trim(), password);
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-20">
      {params.get("reason") === "book" ? (
        <p className="mb-4 rounded-xl border border-brand/20 bg-[#eef4ff] px-4 py-3 text-sm text-brand-dark">
          <b>Almost there!</b> Log in or create your free profile to book this flight.
        </p>
      ) : null}
      <form onSubmit={submit} className="card p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[.16em] text-brand">WELCOME BACK</p>
        <h1 className="mt-1 text-2xl font-extrabold">Log in</h1>
        <label className="label mt-6">Email or mobile<input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" className="field" required /></label>
        <label className="label mt-4">Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="field" required /></label>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full py-3 text-[15px]">{busy ? "Logging in…" : "Log in"}</button>
        <p className="mt-4 text-center text-sm text-muted">New here? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-bold text-brand">Create your profile</Link></p>
      </form>
    </div>
  );
}
