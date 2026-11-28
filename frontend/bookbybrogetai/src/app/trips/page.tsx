"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/components/chrome";
import { BoardingPass, PastTicket } from "@/components/boarding-pass";
import { Icon } from "@/components/icons";
import { cityOf, downloadTicket, getOrder, inr, trips, type Order } from "@/lib/api";
import { payWithRazorpay } from "@/lib/razorpay";

type Tab = "upcoming" | "completed";

const today = () => new Date().toISOString().slice(0, 10);
const flightOf = (o: Order) => (o.flight || {}) as Record<string, string>;
const isUpcoming = (o: Order) => (flightOf(o).date || "") >= today() && o.status !== "failed";
const dayDiff = (date: string) => Math.round((new Date(`${date}T00:00:00`).getTime() - new Date(`${today()}T00:00:00`).getTime()) / 86_400_000);

export default function TripsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}>
      <Trips />
    </Suspense>
  );
}

function Trips() {
  const { user } = useRequireAuth();
  const params = useSearchParams();
  const fresh = params.get("new") || "";
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.allSettled(trips.list().map((id) => getOrder(id))).then((rows) => setOrders(rows.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))));
  }, [user]);

  const groups = useMemo(() => {
    const all = orders ?? [];
    const by = (dir: number) => (a: Order, b: Order) => dir * (flightOf(a).date || "").localeCompare(flightOf(b).date || "") || dir * (flightOf(a).depart || "").localeCompare(flightOf(b).depart || "");
    return { upcoming: all.filter(isUpcoming).sort(by(1)), completed: all.filter((o) => !isUpcoming(o)).sort(by(-1)) };
  }, [orders]);
  const freshOrder = orders?.find((o) => o.requestId === fresh);

  async function ticket(o: Order) {
    setBusy(o.requestId);
    setError("");
    try {
      await downloadTicket(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download the ticket.");
    } finally {
      setBusy("");
    }
  }

  async function payNow(o: Order) {
    if (!user) return;
    setBusy(o.requestId);
    setError("");
    try {
      const outcome = await payWithRazorpay(o, user);
      const next = outcome.kind === "paid" ? outcome.order : await getOrder(o.requestId).catch(() => o);
      setOrders((rows) => (rows ?? []).map((r) => (r.requestId === o.requestId ? next : r)));
      if (outcome.kind === "dismissed") setError("Payment not completed. No money was taken.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the payment window.");
    } finally {
      setBusy("");
    }
  }

  if (!user) return <p className="p-10 text-center text-muted">Loading…</p>;
  const shown = groups[tab];
  const next = groups.upcoming[0];

  return (
    <div className="pb-12">
      <div className="border-b border-line bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">My trips</h1>
              <p className="mt-1 text-sm text-muted">
                {orders === null ? "Loading your bookings…" : next ? `Next trip: ${cityOf(flightOf(next).fromCode)} to ${cityOf(flightOf(next).toCode)}, ${whenLabel(flightOf(next).date).toLowerCase()}.` : "Your flight bookings, e-tickets and payments in one place."}
              </p>
            </div>
            <Link href="/" className="btn-primary"><Icon name="plane" size={16} /> Book a flight</Link>
          </div>
          <div role="tablist" className="mt-5 inline-grid grid-cols-2 gap-1 rounded-xl bg-soft p-1">
            {([["upcoming", "Upcoming"], ["completed", "Completed"]] as [Tab, string][]).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition sm:px-6 ${tab === id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}>
                {label}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === id ? "bg-brand text-white" : "bg-white text-muted"}`}>{orders ? groups[id].length : "…"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6">
        {freshOrder && (freshOrder.status === "ticketed" || freshOrder.status === "paid") ? (
          <div className="rise mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Icon name="check" size={18} strokeWidth={3} /></span>
            <div>
              <p className="font-bold text-emerald-900">Booking confirmed{freshOrder.pnr ? `, PNR ${freshOrder.pnr}` : ""}</p>
              <p className="text-sm text-emerald-800">Your e-ticket is ready below. We have also saved it to your trips.</p>
            </div>
          </div>
        ) : null}
        {error ? <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

        {orders === null ? (
          <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl border border-line bg-soft/60" />)}</div>
        ) : shown.length === 0 ? (
          <Empty tab={tab} />
        ) : tab === "upcoming" ? (
          <div className="space-y-6">
            {shown.map((o) => <UpcomingTrip key={o.requestId} o={o} highlight={o.requestId === fresh} busy={busy === o.requestId} onTicket={() => void ticket(o)} onPay={() => void payNow(o)} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {shown.map((o) => <PastTrip key={o.requestId} o={o} busy={busy === o.requestId} onTicket={() => void ticket(o)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function whenLabel(date?: string) {
  if (!date) return "";
  const d = dayDiff(date);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d > 1 && d < 30) return `In ${d} days`;
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function UpcomingTrip({ o, highlight, busy, onTicket, onPay }: { o: Order; highlight: boolean; busy: boolean; onTicket: () => void; onPay: () => void }) {
  const link = o.status === "pending" && !o.razorpay ? o.paymentUrl || o.checkoutUrl : "";
  const action =
    o.status === "ticketed" || o.status === "paid" ? (
      <button type="button" onClick={onTicket} disabled={busy} className="btn-primary w-full py-2.5 text-sm"><Icon name="arrow" size={15} className="rotate-90" />{busy ? "Preparing…" : "Download e-ticket"}</button>
    ) : o.status === "pending" && o.razorpay ? (
      <button type="button" onClick={onPay} disabled={busy} className="btn-sun w-full py-2.5 text-sm">{busy ? "Opening…" : `Pay ${inr(o.total)}`}</button>
    ) : link ? (
      <a href={link} className="btn-sun w-full py-2.5 text-sm">Pay now</a>
    ) : null;
  return <BoardingPass order={o} when={whenLabel(flightOf(o).date)} highlight={highlight} action={action} />;
}

function PastTrip({ o, busy, onTicket }: { o: Order; busy: boolean; onTicket: () => void }) {
  const f = flightOf(o);
  const again = `/flights?from=${f.fromCode}&to=${f.toCode}&adults=${o.passengers?.length || 1}&cabin=${f.cabin || "0"}`;
  return (
    <PastTicket
      order={o}
      actions={
        <>
          {o.status === "ticketed" || o.status === "paid" ? <button type="button" onClick={onTicket} disabled={busy} className="btn-ghost flex-1 px-3 py-2 text-xs sm:flex-none">{busy ? "Preparing…" : "E-ticket"}</button> : null}
          <Link href={again} className="btn-ghost flex-1 px-3 py-2 text-xs sm:flex-none">Book again</Link>
        </>
      }
    />
  );
}

function Empty({ tab }: { tab: Tab }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-brand"><Icon name={tab === "upcoming" ? "plane" : "suitcase"} size={26} /></span>
      <p className="mt-4 font-display text-xl font-extrabold">{tab === "upcoming" ? "No upcoming trips" : "No past trips yet"}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{tab === "upcoming" ? "Book a flight and it shows up here with your e-ticket and payment status." : "Trips move here after the travel date."}</p>
      {tab === "upcoming" ? <Link href="/" className="btn-primary mt-6">Search flights</Link> : null}
    </div>
  );
}
