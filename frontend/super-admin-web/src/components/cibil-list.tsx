"use client";

import { useMemo, useState } from "react";
import { deleteCreditReport, downloadCreditReport, type CreditReportRow } from "@/lib/api";
import { phoneLabel, scoreBand } from "@/lib/desk";
import { useDesk } from "@/components/admin-shell";
import { inPeriod, useDeskRecords, whenLabel, WorkBar, type Period } from "@/components/agent-work";

export function CibilList() {
  const { notify } = useDesk();
  const { agents, customers, reports, error, loading, setCustomers, setReports } = useDeskRecords();
  const [query, setQuery] = useState("");
  const [agentId, setAgentId] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [downloading, setDownloading] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CreditReportRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
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
    } catch (caught) {
      notify("bad", "Could not delete the credit check", caught instanceof Error ? caught.message : "Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <WorkBar agents={agents} customers={customers} reports={reports} agentId={agentId} period={period} onAgent={setAgentId} onPeriod={setPeriod} />
      <section className="overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#eef1f6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reports"
            aria-label="Search reports"
            className="w-full max-w-sm rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#2f6bff]"
          />
          <p className="shrink-0 text-xs font-bold text-[#8b95a7]">{loading ? "Loading" : `${visible.length} shown`}</p>
        </div>
        {error || notice ? <p className="px-4 py-4 text-sm font-bold text-[#dc2626]">{error || notice}</p> : null}
        {!error && loading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading credit reports</p> : null}
        {!error && !loading && visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-semibold leading-6 text-[#8b95a7]">No reports for this agent and period.</p>
        ) : null}
        {!error && visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["Customer", "Agent", "Mobile", "PAN", "Score", "Status", "Checked", ""].map((column) => (
                    <th key={column || "download"} className="border-b border-[#eef1f6] px-4 py-3 font-extrabold whitespace-nowrap">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const score = row.score == null ? "—" : String(row.score);
                  const band = scoreBand(score);
                  const ready = row.status === "ready";
                  const tone = band === "Excellent" || band === "Good" ? "text-[#16a34a]" : band === "Fair" ? "text-[#d97706]" : band === "Poor" ? "text-[#dc2626]" : "text-[#8b95a7]";
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
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${ready ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>{ready ? "Ready" : "Failed"}</span>
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
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="Cancel delete" onClick={() => { if (!deleting) setPendingDelete(null); }} className="absolute inset-0 bg-[#0e1b33]/45" />
          <div className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-[0_18px_50px_rgba(18,24,43,0.16)]">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">DELETE CREDIT CHECK</p>
            <h2 className="mt-1 text-xl font-extrabold">Delete this check for {pendingDelete.name}?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5c677a]">The report leaves the desk. The customer stays on the customer list.</p>
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
