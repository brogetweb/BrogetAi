"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRequireAuth } from "@/components/chrome";
import { Icon, type IconName } from "@/components/icons";
import { changePassword, me, session, trips, updateMe, type Traveller } from "@/lib/api";

export default function ProfilePage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}>
      <ProfileRoute />
    </Suspense>
  );
}

function ProfileRoute() {
  const { user } = useRequireAuth();
  useEffect(() => {
    if (user) me().catch(() => undefined);
  }, [user]);
  if (!user) return <p className="p-10 text-center text-muted">Loading…</p>;
  return <Profile key={user.id} user={user} />;
}

function Profile({ user }: { user: Traveller }) {
  const router = useRouter();
  const params = useSearchParams();
  const completing = params.get("complete") === "1";
  const next = params.get("next") || "";
  const [form, setForm] = useState(() => ({ fullName: user.name, phone: user.phone, city: user.city, gender: user.gender || "Male" }));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [tripCount] = useState(() => trips.list().length);

  const checks: [string, boolean][] = [
    ["Full name", form.fullName.trim().length >= 2],
    ["Email", Boolean(user.email)],
    ["Mobile number", /^[6-9]\d{9}$/.test(form.phone)],
    ["City", form.city.trim().length >= 2],
    ["Gender", Boolean(form.gender)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const percent = Math.round((done / checks.length) * 100);
  const dirty = form.fullName.trim() !== user.name || form.phone !== user.phone || form.city.trim() !== user.city || form.gender !== user.gender;
  const initials = (user.name || user.email || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  async function save(event: FormEvent) {
    event.preventDefault();
    if (form.fullName.trim().length < 2) return setMsg({ ok: false, text: "Enter your full name as on your ID." });
    if (!/^[6-9]\d{9}$/.test(form.phone)) return setMsg({ ok: false, text: "Enter a valid 10-digit mobile number." });
    if (form.city.trim().length < 2) return setMsg({ ok: false, text: "Enter your city." });
    setBusy(true);
    try {
      await updateMe({ ...form, fullName: form.fullName.trim(), city: form.city.trim() });
      setMsg({ ok: true, text: "Profile saved." });
      if (completing) router.push(next || "/");
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not save." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1630_0%,#123a8f_55%,#1d5bff_100%)] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] font-display text-2xl font-extrabold text-white ring-4 ring-white/20 sm:h-24 sm:w-24 sm:text-3xl">{initials}</span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">My profile</p>
              <h1 className="truncate text-2xl font-extrabold text-white sm:text-3xl">{user.name || "Traveller"}</h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/75">
                <Meta icon="lock"><span className="break-all">{user.email}</span></Meta>
                {user.phone ? <Meta icon="headset">+91 {user.phone}</Meta> : null}
                {user.city ? <Meta icon="hotel">{user.city}</Meta> : null}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link href="/trips" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"><Icon name="suitcase" size={16} /> My trips</Link>
            <button type="button" onClick={() => { session.clear(); router.push("/"); }} className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50">Log out</button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">

        {completing ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><Icon name="edit" size={18} /></span>
            <div>
              <p className="font-bold text-amber-900">Complete your profile</p>
              <p className="text-sm text-amber-800">Add your mobile number and city so we can issue your tickets. You only do this once.</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold">Profile strength</span>
                <span className={`font-bold ${percent === 100 ? "text-emerald-600" : "text-sun"}`}>{percent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                <div className={`h-full rounded-full transition-all ${percent === 100 ? "bg-emerald-500" : "bg-[linear-gradient(90deg,#ff8a3d,#ffb37a)]"}`} style={{ width: `${percent}%` }} />
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {checks.map(([label, ok]) => (
                  <li key={label} className={`flex items-center gap-2 ${ok ? "text-ink" : "text-subtle"}`}>
                    <span className={`grid h-5 w-5 place-items-center rounded-full ${ok ? "bg-emerald-500 text-white" : "border border-line"}`}>{ok ? <Icon name="check" size={12} strokeWidth={3} /> : null}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 border-y border-line py-4 text-center">
              <div>
                <p className="font-display text-2xl font-extrabold">{tripCount}</p>
                <p className="text-xs font-semibold text-muted">Trips booked</p>
              </div>
              <div className="border-l border-line">
                <p className="font-display text-2xl font-extrabold">{user.gender || "-"}</p>
                <p className="text-xs font-semibold text-muted">Gender</p>
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs leading-5 text-muted"><Icon name="shield" size={15} className="mt-0.5 shrink-0" />Your details are only used to issue tickets and are never shared.</p>
          </aside>

          <form onSubmit={save} className="divide-y divide-line rounded-2xl border border-line bg-white">
            <Section title="Personal details" hint="Exactly as on your government ID. Used on every ticket.">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label sm:col-span-2">Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="field" /></label>
                <div className="sm:col-span-2">
                  <span className="label">Gender</span>
                  <div className="mt-1.5 grid max-w-sm grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((g) => (
                      <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })} className={`rounded-xl border py-2.5 text-sm font-semibold transition ${form.gender === g ? "border-brand bg-[#eef4ff] text-brand ring-2 ring-brand/15" : "border-line bg-white text-muted hover:border-[#cfd8e8]"}`}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
            <Section title="Contact" hint="We send booking updates and e-tickets here.">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="label">Mobile number<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" className="field" /></label>
                <label className="label">City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="field" /></label>
                <label className="label sm:col-span-2">Email (login)<input value={user.email} disabled className="field cursor-not-allowed bg-soft text-subtle" /></label>
              </div>
            </Section>
            <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className={`text-sm font-semibold ${msg ? (msg.ok ? "text-emerald-700" : "text-red-700") : "text-subtle"}`}>{msg ? msg.text : dirty ? "You have unsaved changes." : "All changes saved."}</p>
              <button type="submit" disabled={busy || (!dirty && !completing)} className="btn-primary px-6">{busy ? "Saving…" : completing ? "Save & continue" : "Save changes"}</button>
            </div>
          </form>
          <PasswordCard />
        </div>
      </div>
    </div>
  );
}

function PasswordCard() {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const strength = [pw.next.length >= 8, /[A-Z]/.test(pw.next) && /[a-z]/.test(pw.next), /\d/.test(pw.next), /[^A-Za-z0-9]/.test(pw.next)].filter(Boolean).length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pw.current) return setMsg({ ok: false, text: "Enter your current password." });
    if (pw.next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (pw.next !== pw.confirm) return setMsg({ ok: false, text: "New passwords do not match." });
    setBusy(true);
    setMsg(null);
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      setMsg({ ok: true, text: "Password updated. Use the new password next time you log in." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Could not update the password." });
    } finally {
      setBusy(false);
    }
  }

  const type = show ? "text" : "password";
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white lg:col-start-2">
      <Section title="Change password" hint="Use at least 8 characters. Mixing letters, numbers and a symbol makes it stronger.">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label sm:col-span-2">Current password<input type={type} autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="field" /></label>
          <label className="label">New password<input type={type} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="field" /></label>
          <label className="label">Confirm new password<input type={type} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className="field" /></label>
        </div>
        {pw.next ? (
          <div className="mt-3 flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 rounded-full ${i < strength ? (strength >= 3 ? "bg-emerald-500" : "bg-sun") : "bg-line"}`} />)}
            </div>
            <span className="text-xs font-semibold text-muted">{strength >= 3 ? "Strong" : strength === 2 ? "Okay" : "Weak"}</span>
          </div>
        ) : null}
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-[#1d5bff]" /> Show passwords
        </label>
      </Section>
      <div className="flex flex-col gap-3 border-t border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className={`text-sm font-semibold ${msg ? (msg.ok ? "text-emerald-700" : "text-red-700") : "text-subtle"}`}>{msg ? msg.text : "You stay logged in after changing it."}</p>
        <button type="submit" disabled={busy || !pw.current || !pw.next} className="btn-primary px-6"><Icon name="lock" size={16} /> {busy ? "Updating…" : "Update password"}</button>
      </div>
    </form>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="p-5 sm:p-6">
      <h2 className="text-lg font-extrabold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted">{hint}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Meta({ icon, children }: { icon: IconName; children: ReactNode }) {
  return <span className="flex items-center gap-1.5"><Icon name={icon} size={14} />{children}</span>;
}
