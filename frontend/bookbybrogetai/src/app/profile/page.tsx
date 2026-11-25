"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRequireAuth } from "@/components/chrome";
import { me, updateMe, type Traveller } from "@/lib/api";

export default function ProfilePage() {
  const { user } = useRequireAuth();
  useEffect(() => {
    if (user) me().catch(() => undefined);
  }, [user]);
  if (!user) return <p className="p-10 text-center text-muted">Loading…</p>;
  return <Profile key={user.id} user={user} />;
}

function Profile({ user }: { user: Traveller }) {
  const [form, setForm] = useState(() => ({ fullName: user.name, phone: user.phone, city: user.city, gender: user.gender || "Male" }));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setMsg({ ok: false, text: "Enter a valid 10-digit mobile number." });
    setBusy(true);
    try {
      await updateMe({ ...form, fullName: form.fullName.trim(), city: form.city.trim() });
      setMsg({ ok: true, text: "Profile saved." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="card flex items-center gap-4 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] font-display text-2xl font-extrabold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">{user.name}</h1>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-1 text-xs text-subtle">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
      </div>
      <form onSubmit={save} className="card mt-5 p-6">
        <h2 className="text-lg font-extrabold">Traveller details</h2>
        <p className="text-sm text-muted">Used as the lead traveller on your bookings.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="label sm:col-span-2">Full name (as on ID)<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field" required /></label>
          <label className="label">Mobile<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" className="field" /></label>
          <label className="label">Email<input value={user.email} disabled className="field cursor-not-allowed bg-soft text-subtle" /></label>
          <label className="label">City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="field" /></label>
          <label className="label">Gender
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="field"><option>Male</option><option>Female</option><option>Other</option></select>
          </label>
        </div>
        {msg ? <p className={`mt-4 rounded-xl px-3 py-2.5 text-sm font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg.text}</p> : null}
        <button type="submit" disabled={busy} className="btn-primary mt-5 px-6">{busy ? "Saving…" : "Save profile"}</button>
      </form>
    </div>
  );
}
