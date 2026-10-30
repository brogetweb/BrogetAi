"use client";

import { useEffect, useMemo, useState } from "react";
import { listFlightOrders, type FlightOrderRow } from "@/lib/api";

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function tone(status: string) {
  if (status === "ticketed" || status === "paid") return "bg-[#e8f8ee] text-[#15803d]";
  if (status === "pending") return "bg-[#fff7e8] text-[#b45309]";
  return "bg-[#fff1f2] text-[#be123c]";
}

export function FlightOrders() {
  const [rows, setRows] = useState<FlightOrderRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sector, setSector] = useState("all");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(await listFlightOrders());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load flight orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const paid = rows.filter((r) => r.status === "paid" || r.status === "ticketed");
  const pending = rows.filter((r) => r.status === "pending");
  const failed = rows.filter((r) => r.status !== "paid" && r.status !== "ticketed" && r.status !== "pending");
  const aoPay = paid.reduce((s, r) => s + (r.moneyTo?.aoPayWallet ?? r.netFare ?? 0), 0);
  const broget = paid.reduce((s, r) => s + (r.moneyTo?.brogetFee ?? r.markup ?? 0), 0);
  const gst = paid.reduce((s, r) => s + (r.moneyTo?.gst ?? r.gst ?? 0), 0);
  const customer = paid.reduce((s, r) => s + (r.moneyTo?.customerPaid ?? r.total ?? 0), 0);
  const domestic = paid.filter((r) => r.sector === "domestic").length;
  const international = paid.filter((r) => r.sector === "international").length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (sector !== "all" && row.sector !== sector) return false;
      if (!needle) return true;
      return [row.travellerName, row.travellerPhone, row.travellerEmail, row.route, row.airline, row.pnr, row.requestId]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, rows, sector, status]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Customer paid" value={money(customer)} hint={`${paid.length} successful bookings`} accent="text-[#2f6bff]" />
        <Stat label="→ AO Pay wallet" value={money(aoPay)} hint="Airline net fare" />
        <Stat label="→ Broget fee" value={money(broget)} hint="4% domestic / 7% intl" accent="text-[#16a34a]" />
        <Stat label="GST on fee" value={money(gst)} hint="18% on Broget fee" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Mini label="Pending pay" value={String(pending.length)} />
        <Mini label="Failed / other" value={String(failed.length)} />
        <Mini label="Domestic paid" value={String(domestic)} />
        <Mini label="International paid" value={String(international)} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#eef1f6] bg-white p-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customer, route, PNR…"
          className="w-full max-w-md rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#2f6bff]"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-bold outline-none"
        >
          <option value="all">All status</option>
          <option value="ticketed">Ticketed</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={sector}
          onChange={(event) => setSector(event.target.value)}
          className="rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 text-sm font-bold outline-none"
        >
          <option value="all">All sectors</option>
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
        <p className="text-sm font-semibold text-[#5c677a] sm:ml-auto">
          {loading ? "Loading…" : `${visible.length} of ${rows.length} orders`}
        </p>
        <button type="button" onClick={() => void load()} className="rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-sm font-bold text-[#0b1f3a]">
          Refresh
        </button>
      </div>

      {error ? <p className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#be123c]">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Airline</th>
                <th className="px-4 py-3">AO Pay</th>
                <th className="px-4 py-3">Broget+GST</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">PNR</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">
                    No flight payments yet. Live Book checkout orders show here.
                  </td>
                </tr>
              ) : null}
              {visible.map((row) => (
                <tr key={row.requestId} className="border-t border-[#eef1f6] hover:bg-[#f8fafc]">
                  <td className="px-4 py-3">
                    <p className="font-bold text-[#0b1f3a]">{row.travellerName || "—"}</p>
                    <p className="text-xs font-semibold text-[#8b95a7]">{row.travellerPhone || row.travellerEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0b1f3a]">{row.route || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#5c677a]">{row.airline || "—"}</td>
                  <td className="px-4 py-3 font-bold text-[#0b1f3a]">{money(row.moneyTo?.aoPayWallet ?? row.netFare)}</td>
                  <td className="px-4 py-3 font-semibold text-[#5c677a]">
                    {money((row.moneyTo?.brogetFee ?? row.markup) + (row.moneyTo?.gst ?? row.gst))}
                    <span className="block text-[10px] font-bold text-[#8b95a7]">
                      {row.markupPercent}% + GST
                    </span>
                  </td>
                  <td className="px-4 py-3 font-extrabold text-[#0066ff]">{money(row.moneyTo?.customerPaid ?? row.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${tone(row.status)}`}>{row.status}</span>
                    <span className="mt-1 block text-[10px] font-bold uppercase text-[#8b95a7]">{row.sector}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#0b1f3a]">{row.pnr || "—"}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-[#8b95a7]">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
              {!loading && rows.length > 0 && visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">
                    No orders match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#eef1f6] bg-white p-4">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">{label}</p>
      <p className={`mt-1 text-xl font-extrabold tracking-tight text-[#0b1f3a] ${accent ?? ""}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#8b95a7]">{hint}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#eef1f6] bg-[#f8fafc] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#0b1f3a]">{value}</p>
    </div>
  );
}
