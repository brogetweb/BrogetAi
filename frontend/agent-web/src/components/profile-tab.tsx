"use client";

import { FormEvent, useEffect, useState } from "react";
import { AgentAccount, AgentProfile, changePassword, fetchProfile, logoutEverywhere, updateProfile } from "@/lib/api";
import { IconAlert, IconCheck, IconEye, IconEyeOff, IconLock, IconLogout, IconMail, IconShield } from "@/components/icons";
import { Avatar } from "@/components/ui";

type Notify = (ok: boolean, title: string, detail?: string) => void;

function when(value: string | null) {
  if (!value) return "Not recorded yet";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const passwordRules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "Contains a number", test: (v: string) => /\d/.test(v) },
];

export function ProfileTab({ notify, onSaved, onSignedOut }: { notify: Notify; onSaved: (user: AgentAccount) => void; onSignedOut: () => void }) {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile()
      .then(setProfile)
      .catch((error) => setLoadError(error instanceof Error ? error.message : "Could not load your profile."));
  }, []);

  if (loadError) {
    return (
      <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <IconAlert size={16} className="mt-0.5 shrink-0" /> {loadError}
      </p>
    );
  }
  if (!profile) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-72 w-full rounded-2xl" />
        <div className="skeleton h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={profile.name || profile.email} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display truncate text-2xl font-bold text-ink">{profile.name}</h2>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted">
            <IconMail size={14} /> {profile.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand">Agent ID {profile.code}</span>
            <span className={`rounded-full px-2.5 py-1 capitalize ${profile.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{profile.status}</span>
            {profile.memberSince ? <span className="rounded-full bg-soft px-2.5 py-1 text-muted">Member since {new Date(profile.memberSince).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailsForm
          profile={profile}
          notify={notify}
          onSaved={(next) => {
            setProfile(next);
            onSaved({ id: next.id, email: next.email, name: next.name, phone: next.phone, city: next.city, role: "agent" });
          }}
        />
        <PasswordForm notify={notify} onChanged={setProfile} />
      </div>

      <SecurityCard profile={profile} notify={notify} onSignedOut={onSignedOut} />
    </div>
  );
}

function DetailsForm({ profile, notify, onSaved }: { profile: AgentProfile; notify: Notify; onSaved: (p: AgentProfile) => void }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState((profile.phone || "").replace(/\D/g, "").slice(-10));
  const [city, setCity] = useState(profile.city || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = name.trim() !== profile.name || phone !== (profile.phone || "").replace(/\D/g, "").slice(-10) || city.trim() !== (profile.city || "");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number.");
    if (city.trim().length < 2) return setError("Enter your city.");
    setSaving(true);
    setError(null);
    try {
      const next = await updateProfile({ name: name.trim(), phone, city: city.trim() });
      onSaved(next);
      notify(true, "Profile updated", "Your details are saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card p-6">
      <h3 className="text-base font-semibold text-ink">Profile details</h3>
      <p className="mt-1 text-sm text-muted">Update your name, mobile number and city.</p>

      <label className="mt-5 block">
        <span className="field-label">Full name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" className="input" />
      </label>
      <label className="mt-4 block">
        <span className="field-label">Email (login ID)</span>
        <input value={profile.email} readOnly disabled className="input cursor-not-allowed bg-soft text-muted" />
        <span className="mt-1.5 block text-xs text-subtle">Your login email can be changed only by the Broget AI admin.</span>
      </label>
      <label className="mt-4 block">
        <span className="field-label">Mobile number</span>
        <span className="relative block">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-subtle">+91</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" autoComplete="tel-national" className="input pl-12" />
        </span>
      </label>
      <label className="mt-4 block">
        <span className="field-label">City</span>
        <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={60} autoComplete="address-level2" className="input" />
      </label>

      {error ? (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}

      <button type="submit" disabled={saving || !dirty} className="btn btn-primary mt-5 w-full">
        {saving ? "Saving…" : dirty ? "Save changes" : "No changes"}
      </button>
    </form>
  );
}

function PasswordForm({ notify, onChanged }: { notify: Notify; onChanged: (p: AgentProfile) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rulesOk = passwordRules.every((rule) => rule.test(next));
  const matches = next.length > 0 && next === confirm;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!current) return setError("Enter your current password.");
    if (!rulesOk) return setError("The new password does not meet the rules below.");
    if (!matches) return setError("The new passwords do not match.");
    if (next === current) return setError("Choose a new password that is different from the current one.");
    setSaving(true);
    setError(null);
    try {
      const profile = await changePassword(current, next);
      if (profile) onChanged(profile);
      setCurrent("");
      setNext("");
      setConfirm("");
      notify(true, "Password changed", "Other devices and the mobile app are signed out. Use the new password next time.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change your password.");
    } finally {
      setSaving(false);
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, autoComplete: string) => (
    <label className="mt-4 block first-of-type:mt-5">
      <span className="field-label">{label}</span>
      <input type={show ? "text" : "password"} value={value} onChange={(e) => set(e.target.value)} autoComplete={autoComplete} maxLength={64} className="input" />
    </label>
  );

  return (
    <form onSubmit={submit} className="card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
            <IconLock size={16} /> Change password
          </h3>
          <p className="mt-1 text-sm text-muted">You will stay signed in here. Other devices will be signed out.</p>
        </div>
        <button type="button" onClick={() => setShow((v) => !v)} className="btn btn-ghost btn-sm h-8 shrink-0" aria-label={show ? "Hide passwords" : "Show passwords"}>
          {show ? <IconEyeOff size={15} /> : <IconEye size={15} />} {show ? "Hide" : "Show"}
        </button>
      </div>

      {field("Current password", current, setCurrent, "current-password")}
      {field("New password", next, setNext, "new-password")}
      {field("Confirm new password", confirm, setConfirm, "new-password")}

      <ul className="mt-3 grid gap-1 text-xs">
        {passwordRules.map((rule) => {
          const ok = rule.test(next);
          return (
            <li key={rule.label} className={`flex items-center gap-1.5 ${ok ? "text-emerald-700" : "text-subtle"}`}>
              {ok ? <IconCheck size={13} /> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />} {rule.label}
            </li>
          );
        })}
        <li className={`flex items-center gap-1.5 ${matches ? "text-emerald-700" : "text-subtle"}`}>
          {matches ? <IconCheck size={13} /> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />} Both new passwords match
        </li>
      </ul>

      {error ? (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
          <IconAlert size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}

      <button type="submit" disabled={saving} className="btn btn-primary mt-5 w-full">
        {saving ? "Changing…" : "Change password"}
      </button>
    </form>
  );
}

function SecurityCard({ profile, notify, onSignedOut }: { profile: AgentProfile; notify: Notify; onSignedOut: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function signOutEverywhere() {
    setBusy(true);
    try {
      await logoutEverywhere();
      notify(true, "Signed out everywhere", "All browsers and the mobile app are signed out.");
      onSignedOut();
    } catch (caught) {
      notify(false, "Sign out", caught instanceof Error ? caught.message : "Try again");
      setBusy(false);
    }
  }

  return (
    <section className="card p-6">
      <h3 className="flex items-center gap-2 text-base font-semibold text-ink">
        <IconShield size={16} /> Security
      </h3>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-soft px-4 py-3">
          <dt className="text-xs font-medium text-subtle">Last sign-in</dt>
          <dd className="mt-0.5 font-semibold text-ink">{when(profile.lastLoginAt)}</dd>
        </div>
        <div className="rounded-xl bg-soft px-4 py-3">
          <dt className="text-xs font-medium text-subtle">Password last changed</dt>
          <dd className="mt-0.5 font-semibold text-ink">{profile.passwordChangedAt ? when(profile.passwordChangedAt) : "Never - we recommend changing the password you were given"}</dd>
        </div>
      </dl>
      <ul className="mt-4 space-y-1.5 text-xs text-muted">
        <li>• Sessions are encrypted (HTTPS) and expire automatically; this tab signs out when the browser tab is closed.</li>
        <li>• Passwords are stored only as a secure hash. Five wrong current-password attempts lock password changes for 15 minutes.</li>
        <li>• Never share your password. Broget AI staff will never ask for it.</li>
      </ul>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-red-800">Sign out of all devices</p>
          <p className="mt-0.5 text-xs text-red-700">Use this if you think someone else knows your password. You will need to sign in again everywhere.</p>
        </div>
        {confirming ? (
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setConfirming(false)} disabled={busy} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="button" onClick={() => void signOutEverywhere()} disabled={busy} className="btn btn-sm bg-red-600 text-white hover:bg-red-700">
              {busy ? "Signing out…" : "Yes, sign out all"}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="btn btn-sm shrink-0 border border-red-300 bg-white text-red-700 hover:bg-red-50">
            <IconLogout size={15} /> Sign out everywhere
          </button>
        )}
      </div>
    </section>
  );
}
