"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDesk } from "@/components/admin-shell";
import { changeAdminPassword, fetchAdminProfile, updateAdminProfile, type AdminProfile } from "@/lib/api";

function when(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const rules = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "A letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
];

/** Super admin's own account: name, password and sign-in activity. */
export function AdminAccountDesk() {
  const { notify } = useDesk();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminProfile()
      .then(setProfile)
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Could not load your account."));
  }, []);

  if (error) return <p className="rounded-xl bg-[#fff1f2] px-4 py-3 text-sm font-bold text-[#dc2626]">{error}</p>;
  if (!profile) return <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading your account</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <NameCard profile={profile} onSaved={setProfile} notify={notify} />
      <PasswordCard onChanged={setProfile} notify={notify} />
      <section className="rounded-2xl border border-[#eef1f6] bg-white p-5 lg:col-span-2">
        <h2 className="text-base font-extrabold">Security</h2>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <Info label="Last sign-in" value={when(profile.lastLoginAt)} />
          <Info label="Password changed" value={profile.passwordChangedAt ? when(profile.passwordChangedAt) : "Never - change the starting password"} />
          <Info label="Admin since" value={when(profile.memberSince)} />
        </dl>
        <p className="mt-3 text-xs font-semibold leading-5 text-[#8b95a7]">Changing your password signs out every other super-admin session. Five wrong current-password attempts lock changes for 15 minutes.</p>
      </section>
    </div>
  );
}

function NameCard({ profile, onSaved, notify }: { profile: AdminProfile; onSaved: (p: AdminProfile) => void; notify: (tone: "ok" | "bad", title: string, detail?: string) => void }) {
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);
  const dirty = name.trim() !== profile.name;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return notify("bad", "Enter your full name");
    setSaving(true);
    try {
      onSaved(await updateAdminProfile(name.trim()));
      notify("ok", "Profile updated");
    } catch (caught) {
      notify("bad", "Could not save", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-4 rounded-2xl border border-[#eef1f6] bg-white p-5">
      <div>
        <h2 className="text-base font-extrabold">Profile</h2>
        <p className="text-xs font-semibold text-[#8b95a7]">Your super-admin details.</p>
      </div>
      <label className="block text-sm font-extrabold">
        Full name
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} className="mt-1 w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-semibold outline-none focus:border-[#2f6bff]" />
      </label>
      <label className="block text-sm font-extrabold">
        Login email
        <input value={profile.email} disabled className="mt-1 w-full cursor-not-allowed rounded-xl border border-[#e6ebf5] bg-[#f1f4f8] px-3 py-3 font-semibold text-[#8b95a7]" />
      </label>
      <button type="submit" disabled={saving || !dirty} className="w-full rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white disabled:opacity-50">{saving ? "Saving" : dirty ? "Save changes" : "No changes"}</button>
    </form>
  );
}

function PasswordCard({ onChanged, notify }: { onChanged: (p: AdminProfile) => void; notify: (tone: "ok" | "bad", title: string, detail?: string) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const ok = rules.every((rule) => rule.test(next));
  const matches = next.length > 0 && next === confirm;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!current) return setError("Enter your current password.");
    if (!ok) return setError("The new password does not meet the rules.");
    if (!matches) return setError("The new passwords do not match.");
    setSaving(true);
    setError("");
    try {
      const profile = await changeAdminPassword(current, next);
      if (profile) onChanged(profile);
      setCurrent("");
      setNext("");
      setConfirm("");
      notify("ok", "Password changed", "Other super-admin sessions were signed out.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change your password.");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, auto: string) => (
    <label className="block text-sm font-extrabold">
      {label}
      <input type={show ? "text" : "password"} value={value} onChange={(event) => set(event.target.value)} autoComplete={auto} maxLength={64} className="mt-1 w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-semibold outline-none focus:border-[#2f6bff]" />
    </label>
  );

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4 rounded-2xl border border-[#eef1f6] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold">Change password</h2>
          <p className="text-xs font-semibold text-[#8b95a7]">You stay signed in here.</p>
        </div>
        <button type="button" onClick={() => setShow((v) => !v)} className="rounded-xl border border-[#e6ebf5] px-3 py-1.5 text-xs font-extrabold">{show ? "Hide" : "Show"}</button>
      </div>
      {field("Current password", current, setCurrent, "current-password")}
      {field("New password", next, setNext, "new-password")}
      {field("Confirm new password", confirm, setConfirm, "new-password")}
      <ul className="flex flex-wrap gap-2 text-xs font-bold">
        {[...rules.map((rule) => ({ label: rule.label, on: rule.test(next) })), { label: "Passwords match", on: matches }].map((item) => (
          <li key={item.label} className={`rounded-full px-2.5 py-1 ${item.on ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#f1f4f8] text-[#8b95a7]"}`}>{item.on ? "✓ " : ""}{item.label}</li>
        ))}
      </ul>
      {error ? <p role="alert" className="rounded-xl bg-[#fff1f2] px-3 py-2.5 text-sm font-bold text-[#dc2626]">{error}</p> : null}
      <button type="submit" disabled={saving} className="w-full rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white disabled:opacity-60">{saving ? "Changing" : "Change password"}</button>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8fafc] px-3 py-2.5">
      <dt className="text-[11px] font-extrabold text-[#8b95a7]">{label}</dt>
      <dd className="mt-0.5 font-extrabold text-[#12182b]">{value}</dd>
    </div>
  );
}
