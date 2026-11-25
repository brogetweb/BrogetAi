"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/components/chrome";
import { cityOf, getOrder, inr, trips, type Order } from "@/lib/api";

const tone: Record<string, string> = {
  ticketed: "bg-emerald-50 text-emerald-700",
  paid: "bg-blue-50 text-brand",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
};

export default function TripsPage() {
  const { user } = useRequireAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.allSettled(trips.list().map((id) => getOrder(id))).then((rows) =>
      setOrders(rows.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))),
    );
  }, [user]);

  if (!user) return <p className="p-10 text-center text-muted">Loading…</p>;
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">My trips</h1>
      <p className="mt-1 text-sm text-muted">Bookings made from this device.</p>
      <div className="mt-6 space-y-3">
        {orders === null ? <div className="card h-24 animate-pulse bg-soft" /> : null}
        {orders && orders.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="font-display text-lg font-bold">No trips yet</p>
            <p className="mt-1 text-sm text-muted">Your bookings will show up here.</p>
            <Link href="/" className="btn-primary mt-5">Search flights</Link>
          </div>
        ) : null}
        {orders?.map((o) => {
          const f = (o.flight || {}) as Record<string, string>;
          const pay = o.status === "pending" ? o.paymentUrl || o.checkoutUrl : "";
          return (
            <article key={o.requestId} className="card rise flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display text-lg font-bold">{cityOf(f.fromCode)} → {cityOf(f.toCode)}</p>
                <p className="text-sm text-muted">{f.airline} {f.flightCode} · {f.date} · {f.depart}–{f.arrive}</p>
                <p className="mt-1 text-xs text-subtle">Booking {o.requestId}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${tone[o.status] || "bg-soft text-muted"}`}>{o.status === "ticketed" ? "Confirmed" : o.status}</span>
                <p className="font-display text-xl font-extrabold">{inr(o.total)}</p>
                {pay ? <a href={pay} className="btn-sun">Pay now</a> : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
