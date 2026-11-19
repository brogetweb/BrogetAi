"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDesk } from "@/components/admin-shell";
import { walletOverview, type WalletOverview } from "@/lib/api";

const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const when = (v?: string | null) => (v ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "-");

type TopupFilter = "all" | "success" | "pending" | "failed" | "test";

/** Super admin: AO Pay balance, what every agent recharged and used, and each top-up as it comes in. */
export function WalletOverviewDesk() {
  const { notify } = useDesk();
  const [data, setData] = useState<WalletOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TopupFilter>("all");

  // State changes only in promise callbacks, so this is safe to call from an effect.
  const fetchData = useCallback(
    () =>
      walletOverview()
        .then(setData)
        .catch((caught) => notify("bad", "Wallet overview", caught instanceof Error ? caught.message : "Try again."))
        .finally(() => setLoading(false)),
    [notify],
  );

  const load = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    void fetchData();
    const timer = window.setInterval(() => void fetchData(), 60_000);
    return () => window.clearInterval(timer);
  }, [fetchData]);

  const agents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.agents ?? []).filter((a) => !q || `${a.name} ${a.agentId} ${a.email} ${a.phone}`.toLowerCase().includes(q));
  }, [data, query]);

  const topups = useMemo(
    () =>
      (data?.recentTopups ?? []).filter((t) => {
        if (filter === "test") return t.testMode;
        if (filter === "all") return true;
        return !t.testMode && t.status === filter;
      }),
    [data, filter],
  );

  if (!data) {
    return <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">{loading ? "Loading wallet overview" : "Could not load the wallet overview."}</p>;
  }

  const { aopay, totals } = data;
  const aopayChecksLeft = aopay.balance != null && data.chargePerCheck > 0 ? Math.floor(aopay.balance / data.chargePerCheck) : null;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className={`rounded-2xl border p-4 ${aopay.ok && (aopay.balance ?? 0) < 500 ? "border-[#fecaca] bg-[#fff1f2]" : "border-[#d6e4ff] bg-[#eaf1ff]"}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-extrabold">AO Pay balance</p>
            <button type="button" onClick={() => void load()} disabled={loading} className="rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-[#2f6bff] disabled:opacity-50">{loading ? "…" : "Refresh"}</button>
          </div>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{aopay.balance != null ? inr(aopay.balance) : "-"}</p>
          <p className="mt-1 text-xs font-bold text-[#5c677a]">
            {aopay.ok ? `≈ ${aopayChecksLeft ?? 0} CIBIL checks · ${when(aopay.checkedAt)}` : aopay.message}
          </p>
        </article>
        <Stat label="Agents recharged" value={inr(totals.recharged)} hint={`${totals.topups} payments · ${totals.agentsWithRecharge} agents`} />
        <Stat label="Used for CIBIL" value={inr(totals.used)} hint={`${totals.checks} checks`} />
        <Stat label="Agent wallets now" value={inr(totals.agentBalances)} hint={totals.testRecharged ? `Test payments (not real): ${inr(totals.testRecharged)}` : "Spendable balance of all agents"} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eef1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold">Agent-wise recharge &amp; usage</h2>
            <p className="text-xs font-semibold text-[#8b95a7]">Recharged = real Razorpay top-ups only. Used = CIBIL checks charged from the wallet.</p>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agent, ID, mobile" className="w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2 text-sm font-semibold outline-none focus:border-[#2f6bff] sm:w-64" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
              <tr>
                {["Agent", "Recharged", "Top-ups", "Used", "Checks", "Balance now", "Last top-up", "Last check"].map((c) => (
                  <th key={c} className="px-4 py-3">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center font-semibold text-[#8b95a7]">No agents match.</td></tr>
              ) : (
                agents.map((a) => (
                  <tr key={a.agentId} className="border-t border-[#f1f4f8]">
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-[#12182b]">{a.name}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{a.agentId} · {a.status === "active" ? "Active" : a.status === "deleted" ? "Deleted" : "Blocked"}</p>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#16a34a]">{inr(a.recharged)}{a.testRecharged ? <span className="block text-[10px] font-bold text-[#b45309]">+{inr(a.testRecharged)} test</span> : null}</td>
                    <td className="px-4 py-3 font-semibold">{a.topups}{a.pendingTopups ? <span className="ml-1 text-[10px] font-bold text-[#b45309]">({a.pendingTopups} pending)</span> : null}</td>
                    <td className="px-4 py-3 font-extrabold text-[#dc2626]">{inr(a.used)}</td>
                    <td className="px-4 py-3 font-semibold">{a.checks}</td>
                    <td className="px-4 py-3 font-extrabold">{inr(a.balance)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#5c677a]">{when(a.lastTopupAt)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-[#5c677a]">{when(a.lastCheckAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eef1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold">Latest agent top-ups</h2>
            <p className="text-xs font-semibold text-[#8b95a7]">Every Add-money payment, newest first. Refreshes every minute.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "success", "pending", "failed", "test"] as TopupFilter[]).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${filter === f ? "bg-[#2f6bff] text-white" : "bg-[#f1f4f8] text-[#5c677a]"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
              <tr>{["Time", "Agent", "Amount", "Status", "Reference", "Order"].map((c) => <th key={c} className="px-4 py-3">{c}</th>)}</tr>
            </thead>
            <tbody>
              {topups.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center font-semibold text-[#8b95a7]">No top-ups here yet.</td></tr>
              ) : (
                topups.map((t) => (
                  <tr key={t.id} className="border-t border-[#f1f4f8]">
                    <td className="px-4 py-3 text-xs font-semibold text-[#5c677a]">{when(t.createdAt)}</td>
                    <td className="px-4 py-3"><p className="font-extrabold">{t.agentName}</p><p className="text-xs font-bold text-[#8b95a7]">{t.agentId}</p></td>
                    <td className="px-4 py-3 font-extrabold">{inr(t.amount)}</td>
                    <td className="px-4 py-3"><TopupStatus status={t.status} test={t.testMode} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{t.utr || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#8b95a7]">{t.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-[#eef1f6] bg-white p-4">
      <p className="text-sm font-extrabold">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#8b95a7]">{hint}</p>
    </article>
  );
}

function TopupStatus({ status, test }: { status: string; test: boolean }) {
  if (test) return <span className="rounded-full bg-[#fff6e5] px-2.5 py-1 text-xs font-extrabold text-[#b45309]">Test · not real</span>;
  const tone = status === "success" ? "bg-[#e8f8ee] text-[#16a34a]" : status === "pending" ? "bg-[#fff6e5] text-[#b45309]" : "bg-[#fff1f2] text-[#dc2626]";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ${tone}`}>{status}</span>;
}
