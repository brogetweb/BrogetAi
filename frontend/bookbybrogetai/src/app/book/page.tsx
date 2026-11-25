"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useRequireAuth } from "@/components/chrome";
import { checkout, cityOf, demoPay, inr, picked, quote, sectorOf, trips, type Order, type Quote, type Traveller } from "@/lib/api";

type Pax = { title: string; fullName: string };

export default function BookPage() {
  const { user } = useRequireAuth();
  if (!user) return <p className="p-10 text-center text-muted">Loading…</p>;
  return <Booking key={user.id} user={user} />;
}

function Booking({ user }: { user: Traveller }) {
  const router = useRouter();
  const [pick] = useState(() => picked.get());
  const [pax, setPax] = useState<Pax[]>(() =>
    Array.from({ length: pick?.search.adults ?? 0 }, (_, i) => ({ title: i === 0 && user.gender === "Female" ? "Ms" : "Mr", fullName: i === 0 ? user.name : "" })),
  );
  const [phone, setPhone] = useState(user.phone);
  const [price, setPrice] = useState<Quote | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pick) return;
    quote(pick.flight.price * pick.search.adults, sectorOf(pick.flight.fromCode, pick.flight.toCode))
      .then(setPrice)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not price this flight."));
  }, [pick]);

  async function pay(event: FormEvent) {
    event.preventDefault();
    if (!pick) return;
    if (pax.some((p) => p.fullName.trim().length < 2)) return setError("Enter every traveller's full name as on their ID.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile for payment.");
    setBusy(true);
    setError("");
    const f = pick.flight;
    try {
      const res = await checkout({
        netFare: f.price * pick.search.adults,
        sector: sectorOf(f.fromCode, f.toCode),
        payMobile: phone,
        flight: { id: f.id, airline: f.airlineName, airlineCode: f.airlineCode, flightCode: `${f.airlineCode}-${f.flightNumber}`, fromCode: f.fromCode, toCode: f.toCode, date: pick.search.travelDate, depart: f.depart, arrive: f.arrive, duration: f.duration, cabin: pick.search.cabin },
        passengers: pax.map((p, i) => ({ title: p.title, fullName: p.fullName.trim(), ...(i === 0 ? { email: user.email, phone } : {}) })),
      });
      trips.add(res.requestId);
      const url = res.paymentUrl || res.checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      setOrder(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the booking.");
    }
    setBusy(false);
  }

  async function confirmDemo() {
    if (!order) return;
    setBusy(true);
    try {
      await demoPay(order.requestId);
      router.push(`/trips?new=${order.requestId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
      setBusy(false);
    }
  }

  if (!pick) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">No flight selected</h1>
        <p className="mt-2 text-muted">Search and pick a flight first.</p>
        <Link href="/" className="btn-primary mt-6">Search flights</Link>
      </div>
    );
  }

  const f = pick.flight;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.6fr_1fr]">
      <form onSubmit={pay} className="space-y-5">
        <div className="card p-5">
          <p className="text-xs font-bold tracking-[.16em] text-brand">YOUR FLIGHT</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-soft font-display font-extrabold text-brand">{f.airlineCode}</span>
            <div>
              <p className="font-display text-lg font-bold">{cityOf(f.fromCode)} → {cityOf(f.toCode)}</p>
              <p className="text-sm text-muted">{f.airlineName} {f.airlineCode}-{f.flightNumber} · {new Date(pick.search.travelDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} · {f.depart} – {f.arrive} · {f.duration} · {f.stops ? `${f.stops} stop` : "Non-stop"}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-extrabold">Travellers</h2>
          <p className="text-sm text-muted">Names exactly as on government ID.</p>
          <div className="mt-4 space-y-3">
            {pax.map((p, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-[110px_1fr]">
                <label className="label">Title
                  <select value={p.title} onChange={(e) => setPax(pax.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="field"><option>Mr</option><option>Ms</option><option>Mrs</option></select>
                </label>
                <label className="label">Adult {i + 1}{i === 0 ? " (lead)" : ""} – full name
                  <input value={p.fullName} onChange={(e) => setPax(pax.map((x, j) => (j === i ? { ...x, fullName: e.target.value } : x)))} className="field" required />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="label">Contact mobile<input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" className="field" /></label>
            <label className="label">Ticket email<input value={user.email} disabled className="field bg-soft text-subtle" /></label>
          </div>
        </div>

        {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        {!order ? (
          <button type="submit" disabled={busy || !price} className="btn-sun w-full py-3.5 text-base">{busy ? "Starting payment…" : price ? `Pay ${inr(price.total)} securely` : "Pricing…"}</button>
        ) : (
          <div className="card border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-amber-900">Booking created · {order.requestId}</p>
            <p className="mt-1 text-sm text-amber-800">{order.message || "Online payment is not switched on yet. Confirm to complete this booking in demo mode."}</p>
            <button type="button" onClick={() => void confirmDemo()} disabled={busy} className="btn-primary mt-4">{busy ? "Confirming…" : "Confirm booking"}</button>
          </div>
        )}
      </form>

      <aside className="card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-extrabold">Fare summary</h2>
        {price ? (
          <dl className="mt-4 space-y-2.5 text-sm">
            <Row k={`Airfare (${pick.search.adults} adult${pick.search.adults > 1 ? "s" : ""})`} v={inr(price.netFare)} />
            <Row k="Convenience fee" v={inr(price.markup)} />
            <Row k="GST" v={inr(price.gst)} />
            <div className="border-t border-line pt-3"><Row k="Total" v={inr(price.total)} strong /></div>
          </dl>
        ) : (
          <div className="mt-4 h-28 animate-pulse rounded-xl bg-soft" />
        )}
        <p className="mt-4 rounded-xl bg-soft px-3 py-2.5 text-xs leading-5 text-muted">🔒 Secure payment. Your e-ticket will be in <b>My trips</b> once the airline confirms.</p>
      </aside>
    </div>
  );
}

function Row({ k, v, strong = false }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className={strong ? "font-bold" : "text-muted"}>{k}</dt>
      <dd className={strong ? "font-display text-xl font-extrabold" : "font-semibold"}>{v}</dd>
    </div>
  );
}
