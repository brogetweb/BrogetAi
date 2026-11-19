"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { generatePassword, logoutAgentEverywhere, resetAgentPassword, updateAgent, type AgentProfile } from "@/lib/api";
import { phoneLabel } from "@/lib/desk";

type Notify = (tone: "ok" | "bad", title: string, detail?: string) => void;
type View = "profile" | "password" | "security";

function when(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

const rules = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "A letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { label: "A number", test: (v: string) => /\d/.test(v) },
];

/** Super admin: view and edit an agent, reset their password, and end their sessions. */
export function AgentManagePanel({
  agent,
  notify,
  onClose,
  onSaved,
  onBlock,
  onDelete,
}: {
  agent: AgentProfile;
  notify: Notify;
  onClose: () => void;
  onSaved: (agent: AgentProfile) => void;
  onBlock: () => void;
  onDelete: () => void;
}) {
  const [view, setView] = useState<View>("profile");
  const initials = agent.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "A";

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close agent panel" onClick={onClose} className="absolute inset-0 bg-[#0e1b33]/45 fade-in" />
      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full flex-col bg-[#f4f7fc] shadow-2xl sm:max-w-[500px] sm:rounded-l-[28px]">
        <div className="border-b border-[#e6ebf5] bg-white px-5 pb-0 pt-4 sm:rounded-tl-[28px]">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,#3d8bff,#0047c2)] text-base font-extrabold text-white">{initials}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">AGENT · {agent.id}</p>
              <h2 className="truncate text-xl font-extrabold">{agent.name}</h2>
              <p className="truncate text-xs font-bold text-[#5c677a]">{agent.email}</p>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#eef1f6] bg-white" aria-label="Close">
              ×
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${agent.status === "active" ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>{agent.status === "active" ? "Active" : "Blocked"}</span>
            {agent.mustChangePassword ? <span className="rounded-full bg-[#fff6e5] px-2.5 py-1 text-xs font-extrabold text-[#b45309]">Must change password</span> : null}
            <span className="ml-auto flex gap-2">
              <button type="button" onClick={onBlock} className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${agent.status === "active" ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#e8f8ee] text-[#16a34a]"}`}>
                {agent.status === "active" ? "Block" : "Unblock"}
              </button>
              <button type="button" onClick={onDelete} className="rounded-xl border border-[#fecaca] bg-white px-3 py-1.5 text-xs font-extrabold text-[#dc2626]">
                Delete
              </button>
            </span>
          </div>
          <nav className="mt-4 flex gap-1" role="tablist">
            {([
              ["profile", "Profile"],
              ["password", "Password"],
              ["security", "Security"],
            ] as [View, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm font-extrabold transition ${view === id ? "border-[#2f6bff] text-[#2f6bff]" : "border-transparent text-[#8b95a7] hover:text-[#12182b]"}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {view === "profile" ? <ProfileForm key={agent.id} agent={agent} notify={notify} onSaved={onSaved} /> : null}
          {view === "password" ? <PasswordReset agent={agent} notify={notify} onSaved={onSaved} /> : null}
          {view === "security" ? <Security agent={agent} notify={notify} /> : null}
        </div>
      </aside>
    </div>
  );
}

function ProfileForm({ agent, notify, onSaved }: { agent: AgentProfile; notify: Notify; onSaved: (a: AgentProfile) => void }) {
  const [name, setName] = useState(agent.name);
  const [email, setEmail] = useState(agent.email);
  const [phone, setPhone] = useState(agent.phone.replace(/\D/g, "").slice(-10));
  const [city, setCity] = useState(agent.city);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const emailChanged = email.trim().toLowerCase() !== agent.email;
  const dirty = name.trim() !== agent.name || emailChanged || phone !== agent.phone.replace(/\D/g, "").slice(-10) || city.trim() !== agent.city;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("Enter the full name.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter a valid email.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number.");
    if (city.trim().length < 2) return setError("Enter the city.");
    setSaving(true);
    setError("");
    try {
      const saved = await updateAgent(agent.id, { name: name.trim(), email: email.trim().toLowerCase(), phone, city: city.trim() });
      onSaved(saved);
      notify("ok", "Agent updated", emailChanged ? `${saved.name} must sign in again with ${saved.email}.` : saved.name);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the agent.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-4">
      <Card title="Profile details" hint="Changes show in the agent's web panel and mobile app.">
        <Input label="Full name" value={name} onChange={setName} />
        <Input label="Login email" value={email} onChange={setEmail} type="email" />
        {emailChanged ? <p className="text-xs font-bold text-[#b45309]">Changing the email signs the agent out everywhere. They sign in with the new email.</p> : null}
        <Input label="Mobile" value={phone} onChange={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))} prefix="+91" inputMode="numeric" />
        <Input label="City" value={city} onChange={setCity} />
      </Card>
      <Card title="Account">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Agent ID" value={agent.id} />
          <Info label="Mobile" value={phoneLabel(agent.phone)} />
          <Info label="Created" value={when(agent.createdAt)} />
          <Info label="Last sign-in" value={when(agent.lastLoginAt)} />
        </dl>
      </Card>
      {error ? <p role="alert" className="rounded-xl bg-[#fff1f2] px-3 py-2.5 text-sm font-bold text-[#dc2626]">{error}</p> : null}
      <button type="submit" disabled={saving || !dirty} className="w-full rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white disabled:opacity-50">
        {saving ? "Saving" : dirty ? "Save changes" : "No changes"}
      </button>
    </form>
  );
}

function PasswordReset({ agent, notify, onSaved }: { agent: AgentProfile; notify: Notify; onSaved: (a: AgentProfile) => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<{ password: string; signedOut: number } | null>(null);
  const [error, setError] = useState("");
  const ok = rules.every((rule) => rule.test(password));

  async function reset(event: FormEvent) {
    event.preventDefault();
    if (!ok) return setError("The password does not meet the rules.");
    setSaving(true);
    setError("");
    try {
      const saved = await resetAgentPassword(agent.id, password);
      onSaved(saved);
      setDone({ password, signedOut: saved.signedOut });
      setPassword("");
      notify("ok", "Password reset", `${agent.name} was signed out and must set a new password after signing in.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not reset the password.");
    } finally {
      setSaving(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      notify("ok", "Copied");
    } catch {
      notify("bad", "Copy failed", "Select and copy it manually.");
    }
  }

  return (
    <div className="space-y-4">
      {done ? (
        <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4">
          <p className="text-sm font-extrabold text-[#166534]">New password set</p>
          <p className="mt-1 text-xs font-semibold text-[#15803d]">Share it with {agent.name} privately. It is shown only now. {done.signedOut} active session(s) were signed out.</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5">
            <code className="min-w-0 flex-1 truncate font-mono text-sm font-bold">{done.password}</code>
            <button type="button" onClick={() => void copy(done.password)} className="rounded-lg bg-[#eaf1ff] px-2.5 py-1 text-xs font-extrabold text-[#2f6bff]">Copy</button>
          </div>
        </div>
      ) : null}
      <form onSubmit={(event) => void reset(event)} className="space-y-4">
        <Card title="Reset password" hint="Use this when the agent forgot their password or it may be known to someone else.">
          <label className="block text-sm font-extrabold">
            New password
            <div className="mt-1 flex gap-2">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                maxLength={64}
                className="min-w-0 flex-1 rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-mono font-semibold outline-none focus:border-[#2f6bff]"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="rounded-xl border border-[#e6ebf5] bg-white px-3 text-xs font-extrabold">{show ? "Hide" : "Show"}</button>
            </div>
          </label>
          <button type="button" onClick={() => { setPassword(generatePassword()); setShow(true); }} className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-2 text-xs font-extrabold text-[#2f6bff]">
            Generate strong password
          </button>
          <ul className="flex flex-wrap gap-2 text-xs font-bold">
            {rules.map((rule) => (
              <li key={rule.label} className={`rounded-full px-2.5 py-1 ${rule.test(password) ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#f1f4f8] text-[#8b95a7]"}`}>
                {rule.test(password) ? "✓ " : ""}{rule.label}
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-xs font-semibold text-[#5c677a]">
            <li>• The agent is signed out of the web panel and the mobile app right away.</li>
            <li>• After signing in with this password they are asked to choose their own.</li>
          </ul>
        </Card>
        {error ? <p role="alert" className="rounded-xl bg-[#fff1f2] px-3 py-2.5 text-sm font-bold text-[#dc2626]">{error}</p> : null}
        <button type="submit" disabled={saving || !ok} className="w-full rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white disabled:opacity-50">
          {saving ? "Resetting" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

function Security({ agent, notify }: { agent: AgentProfile; notify: Notify }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      const result = await logoutAgentEverywhere(agent.id);
      notify("ok", "Signed out everywhere", `${result.signedOut} session(s) ended for ${agent.name}.`);
      setConfirm(false);
    } catch (caught) {
      notify("bad", "Could not sign out", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card title="Sign-in activity">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Last sign-in" value={when(agent.lastLoginAt)} />
          <Info label="Password changed" value={when(agent.passwordChangedAt)} />
          <Info label="Status" value={agent.status === "active" ? "Active" : "Blocked"} />
          <Info label="Own password set" value={agent.mustChangePassword ? "No - reset by admin" : agent.passwordChangedAt ? "Yes" : "Not yet"} />
        </dl>
      </Card>
      <Card title="Sign out of all devices" hint="Ends every web and mobile session for this agent. Their password stays the same.">
        {confirm ? (
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => setConfirm(false)} className="flex-1 rounded-xl border border-[#e6ebf5] bg-white py-2.5 text-sm font-extrabold">Cancel</button>
            <button type="button" disabled={busy} onClick={() => void signOut()} className="flex-1 rounded-xl bg-[#dc2626] py-2.5 text-sm font-extrabold text-white disabled:opacity-60">{busy ? "Signing out" : "Yes, sign out"}</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="w-full rounded-xl border border-[#fecaca] bg-[#fff1f2] py-2.5 text-sm font-extrabold text-[#dc2626]">Sign out everywhere</button>
        )}
      </Card>
      <p className="text-xs font-semibold leading-5 text-[#8b95a7]">Blocking an agent also signs them out everywhere. Passwords are stored only as a secure hash, so nobody (including admins) can see an existing password - you can only set a new one.</p>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl bg-white p-4">
      <div>
        <h3 className="text-sm font-extrabold">{title}</h3>
        {hint ? <p className="mt-0.5 text-xs font-semibold text-[#8b95a7]">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Input({ label, value, onChange, type = "text", prefix, inputMode }: { label: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string; inputMode?: "numeric" }) {
  return (
    <label className="block text-sm font-extrabold">
      {label}
      <span className="relative mt-1 block">
        {prefix ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8b95a7]">{prefix}</span> : null}
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] py-3 font-semibold outline-none focus:border-[#2f6bff] ${prefix ? "pl-12 pr-3" : "px-3"}`}
        />
      </span>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#f8fafc] px-3 py-2.5">
      <dt className="text-[11px] font-extrabold text-[#8b95a7]">{label}</dt>
      <dd className="mt-0.5 truncate font-extrabold text-[#12182b]">{value}</dd>
    </div>
  );
}
