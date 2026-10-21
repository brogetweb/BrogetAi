"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { inPeriod, useDeskRecords, whenLabel, WorkBar, type Period } from "@/components/agent-work";
import { useDesk } from "@/components/admin-shell";
import { deleteCustomer, type CustomerRow } from "@/lib/api";
import { phoneLabel, scoreBand } from "@/lib/desk";

export function CustomerList() {
  const params = useSearchParams();
  const { notify } = useDesk();
  const { agents, customers, reports, error, loading, setCustomers, setReports } = useDeskRecords();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [agentId, setAgentId] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CustomerRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return customers.filter((customer) => {
      if (agentId && customer.agentId !== agentId) return false;
      if (!inPeriod(customer.createdAt, period)) return false;
      if (!needle) return true;
      return [customer.name, customer.mobile, customer.email, customer.id, customer.agentName, customer.agentId, customer.pan].join(" ").toLowerCase().includes(needle);
    });
  }, [agentId, customers, period, query]);
  const open = customers.find((customer) => customer.id === openId) ?? null;

  async function remove(customer: CustomerRow) {
    setDeleting(true);
    try {
      await deleteCustomer(customer.id);
      setCustomers((current) => current.filter((row) => row.id !== customer.id));
      setReports((current) => current.filter((row) => !(row.agentId === customer.agentId && row.mobile === customer.mobile)));
      if (openId === customer.id) setOpenId(null);
      setPendingDelete(null);
      notify("ok", "Customer deleted", customer.name);
    } catch (caught) {
      notify("bad", "Could not delete the customer", caught instanceof Error ? caught.message : "Try again.");
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
            placeholder="Search customers"
            aria-label="Search customers"
            className="w-full max-w-sm rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#2f6bff]"
          />
          <p className="shrink-0 text-xs font-bold text-[#8b95a7]">{loading ? "Loading" : `${visible.length} shown`}</p>
        </div>
        {error ? <p className="px-4 py-4 text-sm font-bold text-[#dc2626]">{error}</p> : null}
        {!error && loading ? <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">Loading customers</p> : null}
        {!error && !loading && visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">No customers for this agent and period.</p>
        ) : null}
        {!error && visible.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["Name", "Agent", "Mobile", "Email", "PAN", "Score", "KYC", "Added", ""].map((column) => (
                    <th key={column || "view"} className="border-b border-[#eef1f6] px-4 py-3 font-extrabold whitespace-nowrap">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#f8fafc]">
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                      <p className="font-extrabold text-[#12182b]">{customer.name}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{customer.id}</p>
                    </td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 whitespace-nowrap">
                      <p className="font-extrabold text-[#12182b]">{customer.agentName}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{customer.agentId}</p>
                    </td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{phoneLabel(customer.mobile)}</td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold text-[#3d4658]">{customer.email}</td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{customer.pan}</td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 whitespace-nowrap">
                      <p className="text-lg font-extrabold tracking-tight text-[#12182b]">{customer.score ?? "—"}</p>
                      <p className="text-xs font-extrabold text-[#16a34a]">{customer.score == null ? customer.cibil : scoreBand(String(customer.score))}</p>
                    </td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5">
                      <span className="rounded-full bg-[#fff6e5] px-2.5 py-1 text-xs font-extrabold text-[#d97706]">{customer.kyc}</span>
                    </td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 font-semibold whitespace-nowrap text-[#3d4658]">{whenLabel(customer.createdAt)}</td>
                    <td className="border-b border-[#f4f7fc] px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setOpenId(customer.id)} className="rounded-xl border border-[#d6e4ff] bg-[#eaf1ff] px-3 py-2 text-xs font-extrabold text-[#2f6bff]">
                          View
                        </button>
                        <button type="button" onClick={() => setPendingDelete(customer)} className="rounded-xl border border-[#fecaca] px-3 py-2 text-xs font-extrabold text-[#dc2626]">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close customer" onClick={() => setOpenId(null)} className="absolute inset-0 bg-[#0e1b33]/45" />
          <aside className="drawer-in absolute inset-y-0 right-0 w-full bg-white p-5 shadow-2xl sm:max-w-[420px] sm:rounded-l-[28px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">{open.id}</p>
                <h2 className="text-xl font-extrabold">{open.name}</h2>
              </div>
              <button type="button" onClick={() => setOpenId(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#eef1f6]" aria-label="Close">×</button>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <Item label="Agent" value={`${open.agentName} · ${open.agentId}`} />
              <Item label="Mobile" value={phoneLabel(open.mobile)} />
              <Item label="Email" value={open.email} />
              <Item label="Date of birth" value={open.dateOfBirth} />
              <Item label="PAN" value={open.pan} />
              <Item label="Score" value={open.score == null ? "—" : `${open.score} · ${scoreBand(String(open.score))}`} />
              <Item label="Credit check" value={open.cibil} />
              <Item label="KYC" value={open.kyc} />
              <Item label="Added" value={whenLabel(open.createdAt)} />
            </dl>
            <button type="button" onClick={() => setPendingDelete(open)} className="mt-6 w-full rounded-xl border border-[#fecaca] py-3 text-sm font-extrabold text-[#dc2626]">
              Delete customer
            </button>
          </aside>
        </div>
      ) : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[70]">
          <button type="button" aria-label="Cancel delete" onClick={() => { if (!deleting) setPendingDelete(null); }} className="absolute inset-0 bg-[#0e1b33]/45" />
          <div className="absolute left-1/2 top-1/2 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e6ebf5] bg-white p-5 shadow-[0_18px_50px_rgba(18,24,43,0.16)]">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">DELETE CUSTOMER</p>
            <h2 className="mt-1 text-xl font-extrabold">Delete {pendingDelete.name}?</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5c677a]">This removes the customer and their credit checks from the desk.</p>
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

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-extrabold text-[#8b95a7]">{label}</dt>
      <dd className="font-extrabold text-[#12182b]">{value}</dd>
    </div>
  );
}
