"use client";

import { useEffect, useState } from "react";
import { listAgents, listCreditReports, listCustomers, type AgentProfile, type CreditReportRow, type CustomerRow } from "@/lib/api";

export type Period = "day" | "week" | "month" | "year" | "all";

const periods: { id: Period; label: string }[] = [
  { id: "day", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All" },
];

export function useDeskRecords() {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [reports, setReports] = useState<CreditReportRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([listAgents(), listCustomers(), listCreditReports()])
      .then(([agentRows, customerRows, reportRows]) => {
        if (!active) return;
        setAgents(agentRows);
        setCustomers(customerRows);
        setReports(reportRows);
      })
      .catch((caught) => {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load the desk.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { agents, customers, reports, error, loading, setCustomers, setReports };
}

export function inPeriod(iso: string, period: Period) {
  if (period === "all") return true;
  const value = new Date(iso);
  const start = periodStart(period);
  return !Number.isNaN(value.getTime()) && value >= start;
}

export function whenLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function WorkBar({
  agents,
  customers,
  reports,
  agentId,
  period,
  onAgent,
  onPeriod,
}: {
  agents: AgentProfile[];
  customers: CustomerRow[];
  reports: CreditReportRow[];
  agentId: string;
  period: Period;
  onAgent: (id: string) => void;
  onPeriod: (period: Period) => void;
}) {
  const scopedCustomers = customers.filter((row) => !agentId || row.agentId === agentId);
  const scopedReports = reports.filter((row) => !agentId || row.agentId === agentId);
  const rows = agents
    .map((agent) => tally(agent, customers, reports, period))
    .sort((a, b) => b.checks - a.checks || a.name.localeCompare(b.name));

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6ebf5] bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="block min-w-0 lg:w-72">
          <span className="mb-1 block text-[11px] font-extrabold tracking-wide text-[#8b95a7]">AGENT</span>
          <select
            value={agentId}
            onChange={(event) => onAgent(event.target.value)}
            className="w-full rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-extrabold text-[#12182b] outline-none focus:border-[#2f6bff]"
          >
            <option value="">All agents</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name} · {agent.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#f4f7fc] p-1">
          {periods.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onPeriod(item.id)}
              className={`rounded-lg px-3 py-2 text-sm font-extrabold ${period === item.id ? "bg-[#2f6bff] text-white" : "text-[#5c677a]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {periods
          .filter((item) => item.id !== "all")
          .map((item) => {
            const stats = count(scopedCustomers, scopedReports, item.id);
            const active = period === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPeriod(item.id)}
                className={`rounded-2xl border p-4 text-left ${active ? "border-[#2f6bff] bg-[#eaf1ff]" : "border-[#e6ebf5] bg-white"}`}
              >
                <p className="text-xs font-extrabold tracking-wide text-[#8b95a7]">{item.label.toUpperCase()}</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#12182b]">{stats.checks}</p>
                <p className="mt-1 text-sm font-semibold text-[#5c677a]">{stats.customers} customers · {stats.ready} ready</p>
              </button>
            );
          })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white">
        <div className="border-b border-[#eef1f6] px-4 py-3">
          <p className="text-sm font-extrabold text-[#12182b]">What each agent did · {periods.find((item) => item.id === period)?.label}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
              <tr>
                {["Agent", "Customers", "Checks", "Ready", "Average score"].map((column) => (
                  <th key={column} className="px-4 py-3 font-extrabold">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-[#8b95a7]">No agents yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className={`border-t border-[#f1f4f8] ${agentId === row.id ? "bg-[#f4f8ff]" : ""}`}>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => onAgent(agentId === row.id ? "" : row.id)} className="text-left">
                        <p className="font-extrabold text-[#12182b]">{row.name}</p>
                        <p className="text-xs font-bold text-[#8b95a7]">{row.id}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-[#12182b]">{row.customers}</td>
                    <td className="px-4 py-3 font-extrabold text-[#12182b]">{row.checks}</td>
                    <td className="px-4 py-3 font-extrabold text-[#12182b]">{row.ready}</td>
                    <td className="px-4 py-3 font-extrabold text-[#12182b]">{row.average}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function tally(agent: AgentProfile, customers: CustomerRow[], reports: CreditReportRow[], period: Period) {
  const ownCustomers = customers.filter((row) => row.agentId === agent.id && inPeriod(row.createdAt, period));
  const ownReports = reports.filter((row) => row.agentId === agent.id && inPeriod(row.createdAt, period));
  const scores = ownReports.map((row) => row.score).filter((score): score is number => score != null);
  const average = scores.length ? String(Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)) : "—";
  return {
    id: agent.id,
    name: agent.name,
    customers: ownCustomers.length,
    checks: ownReports.length,
    ready: ownReports.filter((row) => row.status === "ready").length,
    average,
  };
}

function count(customers: CustomerRow[], reports: CreditReportRow[], period: Period) {
  const ownCustomers = customers.filter((row) => inPeriod(row.createdAt, period));
  const ownReports = reports.filter((row) => inPeriod(row.createdAt, period));
  return {
    customers: ownCustomers.length,
    checks: ownReports.length,
    ready: ownReports.filter((row) => row.status === "ready").length,
  };
}

function periodStart(period: Exclude<Period, "all">) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === "week") {
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  }
  if (period === "month") start.setDate(1);
  if (period === "year") start.setMonth(0, 1);
  return start;
}
