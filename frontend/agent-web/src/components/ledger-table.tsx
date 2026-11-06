"use client";

import { useMemo, useState } from "react";
import type { WalletSnapshot } from "@/lib/api";
import { IconArrowDown, IconArrowUp, IconCheck, IconCopy, IconSearch, IconSheet, IconWallet } from "@/components/icons";
import type { Notify } from "@/components/toast";

type Entry = WalletSnapshot["entries"][number];
type KindFilter = "all" | "topup" | "usage" | "withdraw";
type StatusFilter = "all" | "success" | "pending" | "failed";

const KIND_LABEL: Record<string, string> = { topup: "Wallet top-up", usage: "CIBIL check", withdraw: "Withdrawal" };

function inr(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
const isCredit = (e: Entry) => e.kind === "topup";
const normStatus = (s: string) => (s || "").toLowerCase();

function datePart(v: string) {
  return new Date(v).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function timePart(v: string) {
  return new Date(v).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function Status({ status }: { status: string }) {
  const s = normStatus(status);
  const tone =
    s === "success"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
      : s === "failed"
        ? "bg-red-50 text-red-700 ring-red-600/15"
        : s === "pending"
          ? "bg-amber-50 text-amber-700 ring-amber-600/20"
          : "bg-slate-100 text-slate-600 ring-slate-500/15";
  const dot = s === "success" ? "bg-emerald-500" : s === "failed" ? "bg-red-500" : s === "pending" ? "bg-amber-500" : "bg-slate-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status || "-"}
    </span>
  );
}

/** Excel formula wrapper so long numeric IDs (UTR) stay text instead of turning into 4.31E+11. */
const asText = (v: string) => `="${v.replace(/"/g, '""')}"`;

/** CSV with a UTF-8 BOM so Excel opens ₹ and dates correctly. */
function exportCsv(rows: Entry[]) {
  const head = ["S.No", "Date", "Time", "Type", "Details", "Order ID", "UTR", "Status", "Debit (INR)", "Credit (INR)"];
  const cell = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((e, i) => [
    i + 1,
    datePart(e.createdAt),
    timePart(e.createdAt),
    KIND_LABEL[e.kind] ?? e.kind,
    e.note ?? "",
    asText(e.id),
    e.utr ? asText(e.utr) : "",
    e.status,
    isCredit(e) ? "" : e.amount.toFixed(2),
    isCredit(e) ? e.amount.toFixed(2) : "",
  ]);
  const csv = "﻿" + [head, ...lines].map((r) => r.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `broget-wallet-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function LedgerTable({ entries, loading, notify }: { entries: Entry[] | null; loading: boolean; notify: Notify }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const all = useMemo(() => entries ?? [], [entries]);
  const hasWithdraw = all.some((e) => e.kind === "withdraw");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (e) =>
        (kind === "all" || e.kind === kind) &&
        (status === "all" || normStatus(e.status) === status) &&
        (!q || [e.id, e.utr, e.note, KIND_LABEL[e.kind], e.status, String(e.amount)].some((v) => (v || "").toLowerCase().includes(q))),
    );
  }, [all, kind, status, query]);

  // Totals count settled (successful) movements only, matching the wallet balance logic on the server.
  const settled = rows.filter((e) => normStatus(e.status) === "success");
  const credit = settled.filter(isCredit).reduce((s, e) => s + e.amount, 0);
  const debit = settled.filter((e) => !isCredit(e)).reduce((s, e) => s + e.amount, 0);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1500);
    } catch {
      notify(false, "Could not copy", "Select the reference and copy it manually.");
    }
  }

  const kinds: [KindFilter, string][] = [
    ["all", "All"],
    ["topup", "Top-ups"],
    ["usage", "Checks"],
    ...(hasWithdraw ? ([["withdraw", "Withdrawals"]] as [KindFilter, string][]) : []),
  ];

  return (
    <section className="card overflow-hidden">
      {/* Toolbar */}
      <div className="space-y-3 border-b border-line px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(140deg,#3d8bff,#0047c2)] text-white shadow-[var(--shadow-brand)]">
              <IconSheet size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-ink">Ledger</h3>
              <p className="truncate text-xs text-subtle">
                Showing {rows.length} of {all.length} entries · last 100 wallet movements
              </p>
            </div>
          </div>
          <button type="button" disabled={rows.length === 0} onClick={() => exportCsv(rows)} className="btn h-9 shrink-0 bg-emerald-600 px-3.5 text-[13px] text-white shadow-sm hover:bg-emerald-700">
            <IconSheet size={15} /> <span className="hidden sm:inline">Export to</span> Excel
          </button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative block sm:w-64">
            <IconSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search order ID, UTR, amount…" className="input h-9 pl-9 text-[13px]" />
          </label>
          <div className="inline-flex w-fit rounded-xl bg-soft p-1 text-xs font-semibold ring-1 ring-inset ring-line">
            {kinds.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setKind(id)}
                className={`rounded-lg px-3 py-1.5 transition ${kind === id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="input h-9 w-auto cursor-pointer py-0 text-[13px]" aria-label="Filter by status">
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          {kind !== "all" || status !== "all" || query ? (
            <button
              type="button"
              onClick={() => {
                setKind("all");
                setStatus("all");
                setQuery("");
              }}
              className="text-xs font-semibold text-brand hover:underline sm:ml-1"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      {loading && !entries ? (
        <div className="space-y-2 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">
            <IconWallet size={22} />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink">{all.length ? "No entries match these filters" : "No wallet movement yet"}</p>
          <p className="mt-1 text-sm text-muted">{all.length ? "Try another type, status or search." : "Add money through Broget Pay to get started."}</p>
        </div>
      ) : (
        <div className="panel-scroll max-h-[620px] overflow-auto">
          <table className="w-full min-w-[960px] border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f3f5fa] text-[11px] font-semibold uppercase tracking-wider text-subtle">
                <th className="w-12 border-b border-line px-4 py-3 text-center">#</th>
                <th className="border-b border-l border-line px-4 py-3">Date &amp; time</th>
                <th className="border-b border-l border-line px-4 py-3">Type</th>
                <th className="border-b border-l border-line px-4 py-3">Details</th>
                <th className="border-b border-l border-line px-4 py-3">Reference</th>
                <th className="border-b border-l border-line px-4 py-3">Status</th>
                <th className="border-b border-l border-line px-4 py-3 text-right">Debit</th>
                <th className="border-b border-l border-line px-4 py-3 text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => {
                const credit = isCredit(e);
                const settledRow = normStatus(e.status) === "success";
                const failedRow = normStatus(e.status) === "failed";
                const amountTone = failedRow ? "text-subtle line-through decoration-1" : !settledRow ? "text-subtle" : credit ? "text-emerald-600" : "text-red-600";
                return (
                  <tr key={`${e.id}-${i}`} className="group odd:bg-white even:bg-[#fafbfd] hover:bg-brand-50/60">
                    <td className="border-b border-line px-4 py-3 text-center text-xs tabular text-subtle">{i + 1}</td>
                    <td className="whitespace-nowrap border-b border-l border-line px-4 py-3">
                      <p className="font-medium text-ink">{datePart(e.createdAt)}</p>
                      <p className="text-xs text-subtle">{timePart(e.createdAt)}</p>
                    </td>
                    <td className="whitespace-nowrap border-b border-l border-line px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${credit ? "bg-emerald-50 text-emerald-600" : e.kind === "withdraw" ? "bg-amber-50 text-amber-700" : "bg-violet-50 text-violet-600"}`}
                        >
                          {credit ? <IconArrowDown size={14} /> : <IconArrowUp size={14} />}
                        </span>
                        <span className="font-medium text-ink">{KIND_LABEL[e.kind] ?? e.kind}</span>
                      </span>
                    </td>
                    <td className="max-w-[220px] border-b border-l border-line px-4 py-3">
                      <p className="truncate text-ink-2" title={e.note || undefined}>
                        {e.note || "-"}
                      </p>
                      {e.fee != null && e.gst != null ? (
                        <p className="text-xs text-subtle">
                          Fee {inr(e.fee)} + GST {inr(e.gst)}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap border-b border-l border-line px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-ink-2">{e.id}</span>
                        <button
                          type="button"
                          onClick={() => void copy(e.id)}
                          aria-label={`Copy order ID ${e.id}`}
                          className="grid h-6 w-6 place-items-center rounded-md text-subtle opacity-0 transition hover:bg-white hover:text-ink focus:opacity-100 group-hover:opacity-100"
                        >
                          {copied === e.id ? <IconCheck size={13} className="text-emerald-600" /> : <IconCopy size={13} />}
                        </button>
                      </span>
                      {e.utr ? <p className="font-mono text-[11px] text-subtle">UTR {e.utr}</p> : null}
                    </td>
                    <td className="whitespace-nowrap border-b border-l border-line px-4 py-3">
                      <Status status={e.status} />
                    </td>
                    <td className={`whitespace-nowrap border-b border-l border-line px-4 py-3 text-right font-semibold tabular ${credit ? "" : amountTone}`}>
                      {credit ? <span className="text-line-strong">-</span> : `−${inr(e.amount)}`}
                    </td>
                    <td className={`whitespace-nowrap border-b border-l border-line px-4 py-3 text-right font-semibold tabular ${credit ? amountTone : ""}`}>
                      {credit ? `+${inr(e.amount)}` : <span className="text-line-strong">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-10">
              <tr className="bg-[#f3f5fa] text-sm">
                <td colSpan={6} className="border-t border-line px-4 py-3">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="ml-2 text-xs text-subtle">successful entries only · net {credit - debit >= 0 ? "+" : "−"}
                    {inr(Math.abs(credit - debit))}</span>
                </td>
                <td className="whitespace-nowrap border-l border-t border-line px-4 py-3 text-right font-bold tabular text-red-600">−{inr(debit)}</td>
                <td className="whitespace-nowrap border-l border-t border-line px-4 py-3 text-right font-bold tabular text-emerald-600">+{inr(credit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
