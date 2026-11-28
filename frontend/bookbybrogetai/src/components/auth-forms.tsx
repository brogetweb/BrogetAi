"use client";

import { useState, type FormEvent } from "react";
import { FormError, IconField } from "@/components/auth-layout";
import { login, me, register, type Traveller } from "@/lib/api";

/** A profile is complete when everything needed on a ticket is filled. */
export const profileComplete = (u: Traveller | null) => Boolean(u && u.name.trim().length >= 2 && u.email && /^[6-9]\d{9}$/.test(u.phone) && u.city.trim() && u.gender);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;

/** Email + password only. Reloads the full profile from the server after signing in. */
export function LoginForm({ onDone, onSwitch }: { onDone: (user: Traveller) => void; onSwitch?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!isEmail(email)) return setError("Enter the email you signed up with.");
    if (password.length < 6) return setError("Enter your password (at least 6 characters).");
    setBusy(true);
    setError("");
    try {
      await login(email.trim().toLowerCase(), password);
      onDone(await me().catch(() => null as unknown as Traveller));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not log in.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <IconField label="Email" icon="mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@email.com" autoFocus />
      <IconField
        label="Password"
        icon="lock"
        type={show ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        placeholder="Your password"
        action={<button type="button" onClick={() => setShow((v) => !v)} className="text-xs font-bold text-brand">{show ? "Hide" : "Show"}</button>}
      />
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-[15px]">{busy ? <Spinner /> : null}{busy ? "Logging in…" : "Log in"}</button>
      {onSwitch ? (
        <p className="text-center text-sm text-muted">New here? <button type="button" onClick={onSwitch} className="font-bold text-brand">Create a free profile</button></p>
      ) : null}
    </form>
  );
}

const strength = (p: string) => [p.length >= 6, /[A-Za-z]/.test(p) && /\d/.test(p), p.length >= 10].filter(Boolean).length;

/** Full traveller profile in one go: name, mobile, email, city, gender, password. */
export function RegisterForm({ onDone, onSwitch }: { onDone: (user: Traveller) => void; onSwitch?: () => void }) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", city: "", gender: "Male", password: "" });
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const level = strength(form.password);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.fullName.trim().length < 2) return setError("Enter your full name as on your ID.");
    if (!isEmail(form.email)) return setError("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Enter a valid 10-digit mobile number.");
    if (form.city.trim().length < 2) return setError("Enter your city.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (!agree) return setError("Please accept the terms to continue.");
    setBusy(true);
    setError("");
    try {
      await register({ ...form, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), city: form.city.trim() });
      onDone(await me().catch(() => null as unknown as Traveller));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create your profile.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <IconField label="Full name (as on ID)" icon="user" value={form.fullName} onChange={set("fullName")} autoComplete="name" placeholder="e.g. Rahul Sharma" autoFocus />
      <IconField label="Email" icon="mail" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@email.com" hint="You log in with this email. E-tickets are sent here." />
      <div className="grid gap-4 sm:grid-cols-2">
        <IconField label="Mobile number" icon="phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" autoComplete="tel-national" placeholder="10 digits" />
        <IconField label="City" icon="pin" value={form.city} onChange={set("city")} autoComplete="address-level2" placeholder="e.g. Pune" />
      </div>
      <div>
        <span className="text-[13px] font-semibold text-ink">Gender</span>
        <div className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Gender">
          {["Male", "Female", "Other"].map((g) => (
            <button key={g} type="button" role="radio" aria-checked={form.gender === g} onClick={() => setForm((f) => ({ ...f, gender: g }))} className={`rounded-xl border py-2.5 text-sm font-semibold transition ${form.gender === g ? "border-brand bg-[#eef4ff] text-brand ring-2 ring-brand/15" : "border-line bg-white text-muted hover:border-[#cfd8e8]"}`}>{g}</button>
          ))}
        </div>
      </div>
      <div>
        <IconField
          label="Password"
          icon="lock"
          type={show ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          action={<button type="button" onClick={() => setShow((v) => !v)} className="text-xs font-bold text-brand">{show ? "Hide" : "Show"}</button>}
        />
        {form.password ? (
          <div className="mt-2 flex items-center gap-2">
            {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < level ? ["bg-red-400", "bg-amber-400", "bg-emerald-500"][level - 1] : "bg-line"}`} />)}
            <span className="w-12 text-right text-xs font-semibold text-muted">{["Weak", "Weak", "Good", "Strong"][level]}</span>
          </div>
        ) : null}
      </div>
      <label className="flex items-start gap-2.5 text-sm text-muted">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand" />
        <span>I agree to the <a href="https://www.brogetai.com/terms" className="font-semibold text-brand">Terms</a> and <a href="https://www.brogetai.com/privacy" className="font-semibold text-brand">Privacy Policy</a>.</span>
      </label>
      <FormError message={error} />
      <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-[15px]">{busy ? <Spinner /> : null}{busy ? "Creating profile…" : "Create profile"}</button>
      {onSwitch ? (
        <p className="text-center text-sm text-muted">Already have a profile? <button type="button" onClick={onSwitch} className="font-bold text-brand">Log in</button></p>
      ) : null}
    </form>
  );
}
