"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  return (
    <Suspense>
      <Register />
    </Suspense>
  );
}

function Register() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", city: "", gender: "Male" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.fullName.trim().length < 2) return setError("Enter your full name as on your ID.");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    setError("");
    try {
      await register({ ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), city: form.city.trim() || undefined });
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create your profile.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl items-start gap-8 px-4 py-10 md:grid-cols-[1fr_1.1fr] md:py-16">
      <div className="hidden md:block">
        <h1 className="text-4xl font-extrabold leading-tight">Create your traveller profile</h1>
        <p className="mt-3 text-muted">Needed once before your first booking. We use it to fill tickets and send your trip details.</p>
        <ul className="mt-6 space-y-3 text-sm">
          {["Book any flight in seconds", "All your trips & e-tickets in one place", "Your details stay private and secure"].map((t) => (
            <li key={t} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">✓</span>{t}</li>
          ))}
        </ul>
      </div>
      <form onSubmit={submit} className="card p-6 sm:p-8">
        <p className="text-xs font-bold tracking-[.16em] text-brand">CREATE PROFILE</p>
        <h2 className="mt-1 text-2xl font-extrabold">Let&apos;s get you booking</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="label sm:col-span-2">Full name (as on ID)<input value={form.fullName} onChange={set("fullName")} autoComplete="name" className="field" required /></label>
          <label className="label">Mobile number<input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" autoComplete="tel-national" className="field" placeholder="10 digits" required /></label>
          <label className="label">Email<input type="email" value={form.email} onChange={set("email")} autoComplete="email" className="field" required /></label>
          <label className="label">City<input value={form.city} onChange={set("city")} autoComplete="address-level2" className="field" placeholder="Optional" /></label>
          <label className="label">Gender
            <select value={form.gender} onChange={set("gender")} className="field">
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </label>
          <label className="label sm:col-span-2">Password<input type="password" value={form.password} onChange={set("password")} autoComplete="new-password" className="field" placeholder="At least 6 characters" required /></label>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{error}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary mt-6 w-full py-3 text-[15px]">{busy ? "Creating…" : "Create profile"}</button>
        <p className="mt-4 text-center text-sm text-muted">Already have a profile? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-brand">Log in</Link></p>
      </form>
    </div>
  );
}
