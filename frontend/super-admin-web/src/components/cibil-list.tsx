"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cibilRevenue,
  deleteCreditReport,
  downloadCreditReport,
  type CibilAgentRevenue,
  type CibilRevenueSnapshot,
  type CreditReportRow,
} from "@/lib/api";
import { phoneLabel, scoreBand } from "@/lib/desk";
import { useDesk } from "@/components/admin-shell";
import { inPeriod, useDeskRecords, whenLabel, type Period } from "@/components/agent-work";

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function CibilList() {
  const { notify } = useDesk();
  const { agents, customers, reports, error, loading, setCustomers, setReports } = useDeskRecords();
  const [revenue, setRevenue] = useState<CibilRevenueSnapshot | null>(null);
  const [revenueError, setRevenueError] = useState("");
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [agentId, setAgentId] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [tab, setTab] = useState<"agents" | "reports">("agents");
  const [agentFilter, setAgentFilter] = useState<"all" | "active" | "silent">("all");
  const [downloading, setDownloading] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CreditReportRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadRevenue() {
    setRevenueLoading(true);
    setRevenueError("");
    try {
      setRevenue(await cibilRevenue());
    } catch (caught) {
      setRevenueError(caught instanceof Error ? caught.message : "Could not load CIBIL revenue.");
    } finally {
      setRevenueLoading(false);
    }
  }

  useEffect(() => {
    void loadRevenue();
  }, []);

  const visibleAgents = useMemo(() => {
    const rows = revenue?.agents ?? [];
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (agentFilter === "active" && !row.hasActivity) return false;
      if (agentFilter === "silent" && row.hasActivity) return false;
      if (!needle) return true;
      return [row.name, row.agentId, row.email, row.phone, row.city].join(" ").toLowerCase().includes(needle);
    });
  }, [agentFilter, query, revenue]);

  const visibleReports = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reports.filter((row) => {
      if (agentId && row.agentId !== agentId) return false;
      if (!inPeriod(row.createdAt, period)) return false;
      if (!needle) return true;
      return [row.name, row.agentName, row.agentId, row.mobile, row.pan].join(" ").toLowerCase().includes(needle);
    });
  }, [agentId, period, query, reports]);

  async function remove(row: CreditReportRow) {
    setDeleting(true);
    try {
      const saved = await deleteCreditReport(row.id);
      setReports((current) => current.filter((item) => item.id !== row.id));
      const nextCustomer = saved.customer;
      if (nextCustomer) {
        setCustomers((current) => current.map((customer) => (customer.id === nextCustomer.id ? nextCustomer : customer)));
      }
      setPendingDelete(null);
      notify("ok", "Credit check deleted", row.name);
      void loadRevenue();
    } catch (caught) {
      notify("bad", "Could not delete the credit check", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setDeleting(false);
    }
  }

  function pickAgent(row: CibilAgentRevenue) {
    setAgentId(row.agentId);
    setTab("reports");
    setQuery("");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total collected"
          value={revenueLoading ? "…" : money(revenue?.totalAmount ?? 0)}
          hint={`₹${revenue?.chargePerCheck ?? "—"} per check (fee + GST)`}
          accent="text-[#16a34a]"
        />
        <Stat
          label="Checks run"
          value={revenueLoading ? "…" : String(revenue?.totalChecks ?? 0)}
          hint={`Fee ${money(revenue?.feePerCheck ?? 0)} · GST ${money(revenue?.gstPerCheck ?? 0)}`}
        />
        <Stat
          label="Agents earning"
          value={revenueLoading ? "…" : String(revenue?.activeAgents ?? 0)}
          hint="Agents with at least one paid check"
          accent="text-[#2f6bff]"
        />
        <Stat
          label="No CIBIL yet"
          value={revenueLoading ? "…" : String(revenue?.silentAgents ?? 0)}
          hint="Agents with zero checks so far"
          accent="text-[#b45309]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={tab === "agents"} onClick={() => setTab("agents")} label="By agent" />
        <TabButton active={tab === "reports"} onClick={() => setTab("reports")} label="All reports" />
        <button
          type="button"
          onClick={() => {
            void loadRevenue();
          }}
          className="ml-auto rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-bold text-[#0b1f3a]"
        >
          Refresh money
        </button>
      </div>

      {revenueError ? (
        <p className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#be123c]">{revenueError}</p>
      ) : null}

      {tab === "agents" ? (
        <section className="overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#eef1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agents"
              aria-label="Search agents"
              className="w-full max-w-sm rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#2f6bff]"
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "active", "silent"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAgentFilter(key)}
                  className={`rounded-xl px-3 py-2 text-xs font-extrabold ${
                    agentFilter === key ? "bg-[#0e1b33] text-white" : "border border-[#e6ebf5] bg-[#f8fafc] text-[#5c677a]"
                  }`}
                >
                  {key === "all" ? "All agents" : key === "active" ? "With amount" : "No amount"}
                </button>
              ))}
            </div>
          </div>
          {revenueLoading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading agent revenue…</p> : null}
          {!revenueLoading && visibleAgents.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm font-semibold leading-6 text-[#8b95a7]">No agents match this filter.</p>
          ) : null}
          {!revenueLoading && visibleAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-separate border-spacing-0 text-left text-sm">
                <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                  <tr>
                    {["Agent", "City", "Checks", "Amount in", "Fee", "GST", "Wallet left", "Last check", ""].map((column) => (
                      <th key={column || "open"} className="border-b border-[#eef1f6] px-4 py-3 font-extrabold whitespace-nowrap">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleAgents.map((row) => (
                    <tr key={row.agentMongoId} className="hover:bg-[#f8fafc]">
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                        <p className="font-extrabold text-[#12182b]">{row.name}</p>
                        <p className="text-xs font-bold text-[#8b95a7]">
                          {row.agentId} · {row.status}
                        </p>
                      </td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold text-[#3d4658]">{row.city || "—"}</td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-extrabold text-[#12182b]">{row.checks}</td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                        <p className={`text-base font-extrabold ${row.amount > 0 ? "text-[#16a34a]" : "text-[#8b95a7]"}`}>{money(row.amount)}</p>
                        {!row.hasActivity ? <p className="text-[11px] font-bold text-[#b45309]">Nothing yet</p> : null}
                      </td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold text-[#3d4658]">{money(row.fee)}</td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold text-[#3d4658]">{money(row.gst)}</td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-bold text-[#0b1f3a]">{money(row.walletBalance)}</td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">
                        {row.lastCheckAt ? whenLabel(row.lastCheckAt) : "—"}
                      </td>
                      <td className="border-b border-[#f4f7fc] px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => pickAgent(row)}
                          className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-2 text-xs font-extrabold text-[#2f6bff]"
                        >
                          Reports
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#eef1f6] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reports"
              aria-label="Search reports"
              className="w-full max-w-sm rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#2f6bff]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={agentId}
                onChange={(event) => setAgentId(event.target.value)}
                className="rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-bold outline-none"
              >
                <option value="">All agents</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
                className="rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-bold outline-none"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>
              <p className="text-xs font-bold text-[#8b95a7]">{loading ? "Loading" : `${visibleReports.length} shown · ${customers.length} customers`}</p>
            </div>
          </div>
          {error || notice ? <p className="px-4 py-4 text-sm font-bold text-[#dc2626]">{error || notice}</p> : null}
          {!error && loading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading credit reports</p> : null}
          {!error && !loading && visibleReports.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm font-semibold leading-6 text-[#8b95a7]">No reports for this agent and period.</p>
          ) : null}
          {!error && visibleReports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
                <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                  <tr>
                    {["Customer", "Agent", "Mobile", "PAN", "Score", "Status", "Checked", ""].map((column) => (
                      <th key={column || "download"} className="border-b border-[#eef1f6] px-4 py-3 font-extrabold whitespace-nowrap">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleReports.map((row) => {
                    const score = row.score == null ? "—" : String(row.score);
                    const band = scoreBand(score);
                    const ready = row.status === "ready";
                    const tone =
                      band === "Excellent" || band === "Good"
                        ? "text-[#16a34a]"
                        : band === "Fair"
                          ? "text-[#d97706]"
                          : band === "Poor"
                            ? "text-[#dc2626]"
                            : "text-[#8b95a7]";
                    return (
                      <tr key={row.id} className="hover:bg-[#f8fafc]">
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                          <p className="font-extrabold text-[#12182b]">{row.name}</p>
                          <p className="text-xs font-semibold text-[#8b95a7]">{row.message}</p>
                        </td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 whitespace-nowrap">
                          <p className="font-extrabold text-[#12182b]">{row.agentName}</p>
                          <p className="text-xs font-bold text-[#8b95a7]">{row.agentId}</p>
                        </td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{phoneLabel(row.mobile)}</td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{row.pan}</td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 whitespace-nowrap">
                          <p className="text-lg font-extrabold tracking-tight text-[#12182b]">{score}</p>
                          <p className={`text-xs font-extrabold ${tone}`}>{band}</p>
                        </td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ready ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>
                            {ready ? "Ready" : "Failed"}
                          </span>
                        </td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{whenLabel(row.createdAt)}</td>
                        <td className="border-b border-[#f4f7fc] px-4 py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={downloading === row.id}
                              onClick={() => {
                                setDownloading(row.id);
                                setNotice("");
                                downloadCreditReport(row.id)
                                  .catch((caught) => setNotice(caught instanceof Error ? caught.message : "Could not download the report."))
                                  .finally(() => setDownloading(""));
                              }}
                              className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-2 text-xs font-extrabold whitespace-nowrap text-[#2f6bff] disabled:opacity-60"
                            >
                              {downloading === row.id ? "Downloading" : "Download PDF"}
                            </button>
                            <button type="button" onClick={() => setPendingDelete(row)} className="rounded-xl border border-[#fecaca] px-3 py-2 text-xs font-extrabold text-[#dc2626]">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Cancel delete"
            onClick={() => {
              if (!deleting) setPendingDelete(null);
            }}
            className="absolute inset-0 bg-[#0e1b33]/45"
          />
          <div className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-[0_18px_50px_rgba(18,24,43,0.16)]">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">DELETE CREDIT CHECK</p>
            <h2 className="mt-1 text-xl font-extrabold">Delete this check for {pendingDelete.name}?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5c677a]">The report leaves the desk. The customer stays on the customer list.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" disabled={deleting} onClick={() => setPendingDelete(null)} className="flex-1 rounded-xl border border-[#e6ebf5] py-3 text-sm font-extrabold disabled:opacity-60">
                Keep
              </button>
              <button type="button" disabled={deleting} onClick={() => void remove(pendingDelete)} className="flex-1 rounded-xl bg-[#dc2626] py-3 text-sm font-extrabold text-white disabled:opacity-60">
                {deleting ? "Deleting" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#eef1f6] bg-white p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tracking-tight text-[#0b1f3a] ${accent ?? ""}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#8b95a7]">{hint}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2.5 text-sm font-extrabold ${active ? "bg-[#2f6bff] text-white" : "border border-[#e6ebf5] bg-white text-[#5c677a]"}`}
    >
      {label}
    </button>
  );
}
