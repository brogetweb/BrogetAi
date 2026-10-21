"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useDesk } from "@/components/admin-shell";
import { createAgent, deleteAgent, listAgents, setAgentStatus, type AgentProfile } from "@/lib/api";
import { phoneLabel } from "@/lib/desk";

export function AgentsDesk() {
  const { notify } = useDesk();
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AgentProfile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const openAgent = agents.find((agent) => agent.id === openId) ?? null;
  const activeCount = agents.filter((agent) => agent.status === "active").length;

  useEffect(() => {
    let active = true;
    listAgents()
      .then((rows) => {
        if (active) setAgents(rows);
      })
      .catch((caught) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load agents.";
        setError(message);
        notify("bad", "Could not load agents", message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  async function remove(agent: AgentProfile) {
    setDeleting(true);
    try {
      await deleteAgent(agent.id);
      setAgents((current) => current.filter((row) => row.id !== agent.id));
      if (openId === agent.id) setOpenId(null);
      setPendingDelete(null);
      notify("ok", "Agent deleted", `${agent.name} · ${agent.id}`);
    } catch (caught) {
      notify("bad", "Could not delete the agent", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleBlock(agent: AgentProfile) {
    const next = agent.status === "active" ? "inactive" : "active";
    try {
      const saved = await setAgentStatus(agent.id, next);
      setAgents((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      notify(next === "inactive" ? "bad" : "ok", next === "inactive" ? "Agent blocked" : "Agent active", saved.name);
    } catch (caught) {
      notify("bad", "Could not update the agent", caught instanceof Error ? caught.message : "Try again.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total agents" value={agents.length} className="bg-white" />
        <Stat label="Active agents" value={activeCount} className="bg-[#e8f8ee]" />
        <Stat label="Inactive agents" value={agents.length - activeCount} className="bg-[#fff1f2]" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#5c677a]">Each profile is an agent account. The agent ID is assigned when you save.</p>
        <button type="button" onClick={() => { setOpenId(null); setCreating(true); }} className="shrink-0 rounded-xl bg-[#2f6bff] px-4 py-2.5 text-sm font-extrabold text-white">
          Add agent
        </button>
      </div>
      {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}
      <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
        {loading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading agents</p> : agents.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">No agents yet. Add the first profile.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["Agent", "ID", "City", "Mobile", "Status", ""].map((column) => (
                    <th key={column || "view"} className="px-4 py-3 font-extrabold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr key={agent.id} className="border-t border-[#f1f4f8]">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-[#12182b]">{agent.name}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{agent.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{agent.id}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{agent.city}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{phoneLabel(agent.phone)}</td>
                    <td className="px-4 py-3"><StatusPill status={agent.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setCreating(false); setOpenId(agent.id); }} className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-1.5 text-xs font-extrabold text-[#2f6bff]">
                          View
                        </button>
                        <button type="button" onClick={() => void toggleBlock(agent)} className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${agent.status === "active" ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#e8f8ee] text-[#16a34a]"}`}>
                          {agent.status === "active" ? "Block" : "Unblock"}
                        </button>
                        <button type="button" onClick={() => setPendingDelete(agent)} className="rounded-xl border border-[#fecaca] px-3 py-1.5 text-xs font-extrabold text-[#dc2626]">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {creating ? (
        <CreateAgent
          onClose={() => setCreating(false)}
          onCreate={async (input) => {
            const saved = await createAgent(input);
            setAgents((current) => [saved, ...current]);
            setCreating(false);
            notify("ok", "Agent created", `${saved.name} · ${saved.id}`);
          }}
          onError={(message) => notify("bad", "Could not create the agent", message)}
        />
      ) : null}
      {openAgent ? <AgentPanel agent={openAgent} onClose={() => setOpenId(null)} onBlock={() => void toggleBlock(openAgent)} onDelete={() => setPendingDelete(openAgent)} /> : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="Cancel delete" onClick={() => { if (!deleting) setPendingDelete(null); }} className="absolute inset-0 bg-[#0e1b33]/45 fade-in" />
          <div className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-[0_18px_50px_rgba(18,24,43,0.16)]">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">DELETE AGENT</p>
            <h2 className="mt-1 text-xl font-extrabold">Delete {pendingDelete.name}?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5c677a]">Agent ID {pendingDelete.id} is removed. This account cannot sign in after that.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={deleting} onClick={() => setPendingDelete(null)} className="flex-1 rounded-xl border border-[#e6ebf5] py-3 text-sm font-extrabold disabled:opacity-60">Keep</button>
              <button type="button" disabled={deleting} onClick={() => void remove(pendingDelete)} className="flex-1 rounded-xl bg-[#dc2626] py-3 text-sm font-extrabold text-white disabled:opacity-60">{deleting ? "Deleting" : "Delete"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CreateAgent({ onClose, onCreate, onError }: { onClose: () => void; onCreate: (input: { name: string; email: string; phone: string; city: string; password: string }) => Promise<void>; onError: (message: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const mobile = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      const message = "Enter a 10-digit mobile number.";
      setError(message);
      onError(message);
      return;
    }
    setPending(true);
    setError("");
    try {
      await onCreate({ name: name.trim(), email: email.trim().toLowerCase(), phone: mobile, city: city.trim(), password });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not create the agent.";
      setError(message);
      onError(message);
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close create agent" onClick={onClose} className="absolute inset-0 bg-[#0e1b33]/45 fade-in" />
      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl sm:max-w-[440px] sm:rounded-l-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#eef1f6] px-5 py-4">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">AGENT PROFILE</p>
            <h2 className="text-xl font-extrabold">Add agent</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-[#eef1f6]" aria-label="Close">
            ×
          </button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void submit(event)}>
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <p className="text-sm font-semibold leading-6 text-[#5c677a]">This profile is the agent account. The agent ID is created when you save.</p>
            <Field label="Full name" value={name} onChange={setName} placeholder="Full name" />
            <Field label="Email" value={email} onChange={setEmail} placeholder="name@email.com" type="email" />
            <Field label="Mobile" value={phone} onChange={setPhone} placeholder="10-digit mobile" />
            <Field label="City" value={city} onChange={setCity} placeholder="City" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="At least 8 characters" type="password" />
            {error ? <p className="text-sm font-bold text-[#dc2626]">{error}</p> : null}
          </div>
          <div className="flex gap-3 border-t border-[#eef1f6] px-5 py-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#e6ebf5] py-3 text-sm font-extrabold">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-xl bg-[#2f6bff] py-3 text-sm font-extrabold text-white disabled:opacity-60">{pending ? "Saving" : "Create profile"}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="block text-sm font-extrabold">
      {label}
      <input required type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-3 font-semibold outline-none focus:border-[#2f6bff]" />
    </label>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <article className={`rounded-2xl border border-[#eef1f6] p-4 ${className}`}>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-extrabold">{label}</p>
    </article>
  );
}

function StatusPill({ status }: { status: AgentProfile["status"] }) {
  const active = status === "active";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${active ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>{active ? "Active" : "Inactive"}</span>;
}

function AgentPanel({ agent, onClose, onBlock, onDelete }: { agent: AgentProfile; onClose: () => void; onBlock: () => void; onDelete: () => void }) {
  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="Close agent panel" onClick={onClose} className="absolute inset-0 bg-[#0e1b33]/45 fade-in" />
      <aside className="drawer-in absolute inset-y-0 right-0 flex w-full flex-col bg-[#f4f7fc] shadow-2xl sm:max-w-[460px] sm:rounded-l-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-[#e6ebf5] bg-white px-5 py-4 sm:rounded-tl-[28px]">
          <div>
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">{agent.id}</p>
            <h2 className="text-xl font-extrabold">{agent.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-[#eef1f6] bg-white" aria-label="Close">
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <StatusPill status={agent.status} />
            <div className="flex gap-2">
              <button type="button" onClick={onBlock} className={`rounded-xl px-3 py-2 text-xs font-extrabold ${agent.status === "active" ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#e8f8ee] text-[#16a34a]"}`}>
                {agent.status === "active" ? "Block" : "Unblock"}
              </button>
              <button type="button" onClick={onDelete} className="rounded-xl border border-[#fecaca] bg-white px-3 py-2 text-xs font-extrabold text-[#dc2626]">
                Delete
              </button>
            </div>
          </div>
          <section className="rounded-2xl bg-white p-4">
            <h3 className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">Profile</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <Row label="Email" value={agent.email} />
              <Row label="Mobile" value={phoneLabel(agent.phone)} />
              <Row label="City" value={agent.city} />
              <Row label="Agent ID" value={agent.id} />
            </dl>
          </section>
          <p className="text-sm font-semibold leading-6 text-[#5c677a]">{agent.status === "inactive" ? "This agent is blocked." : "This agent can sign in to the agent app with this email and password."}</p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold text-[#8b95a7]">{label}</dt>
      <dd className="font-extrabold text-[#12182b]">{value}</dd>
    </div>
  );
}
