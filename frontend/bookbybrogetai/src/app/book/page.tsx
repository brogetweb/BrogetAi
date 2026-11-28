"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRequireAuth } from "@/components/chrome";
import { Icon, type IconName } from "@/components/icons";
import { checkout, cityOf, demoPay, digitsPhone, inr, picked, quote, sectorOf, trips, type Order, type Quote, type Traveller } from "@/lib/api";
import { payWithRazorpay } from "@/lib/razorpay";

type Pax = { title: string; fullName: string };
type Phase = "form" | "paying" | "dismissed" | "pending" | "demo";

const cabins: Record<string, string> = { "0": "Economy", "3": "Premium economy", "1": "Business", "2": "First" };
const methods = ["UPI", "Cards", "Net banking", "Wallets"];

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
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pick) return;
    quote(pick.flight.price * pick.search.adults, sectorOf(pick.flight.fromCode, pick.flight.toCode))
      .then(setPrice)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not price this flight."));
  }, [pick]);

  async function openPayment(o: Order) {
    setPhase("paying");
    setError("");
    try {
      const outcome = await payWithRazorpay(o, { ...user, phone: digitsPhone(phone) });
      if (outcome.kind === "paid") return router.push(`/trips?new=${o.requestId}`);
      setPhase(outcome.kind === "pending" ? "pending" : "dismissed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open the payment window.");
      setPhase("dismissed");
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!pick) return;
    if (order?.razorpay) return openPayment(order);
    if (pax.some((p) => p.fullName.trim().length < 2)) return setError("Enter every traveller's full name as on their ID.");
    if (!/^[6-9]\d{9}$/.test(phone)) return setError("Enter a valid 10-digit mobile number.");
    setPhase("paying");
    setError("");
    const f = pick.flight;
    try {
      const res = await checkout({
        netFare: f.price * pick.search.adults,
        sector: sectorOf(f.fromCode, f.toCode),
        payMobile: digitsPhone(phone),
        flight: { id: f.id, airline: f.airlineName, airlineCode: f.airlineCode, flightCode: [f.airlineCode, f.flightNumber].filter(Boolean).join(" "), fromCode: f.fromCode, toCode: f.toCode, date: pick.search.travelDate, depart: f.depart, arrive: f.arrive, duration: f.duration, cabin: pick.search.cabin },
        passengers: pax.map((p, i) => ({ fullName: p.fullName.trim(), title: p.title, ...(i === 0 ? { email: user.email, phone: digitsPhone(phone) } : {}) })),
      });
      trips.add(res.requestId);
      setOrder(res);
      if (res.razorpay) return openPayment(res);
      const url = res.paymentUrl || res.checkoutUrl;
      if (url) {
        window.location.href = url;
        return;
      }
      setPhase("demo");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start the booking.");
      setPhase("form");
    }
  }

  async function confirmDemo() {
    if (!order) return;
    setPhase("paying");
    try {
      await demoPay(order.requestId);
      router.push(`/trips?new=${order.requestId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
      setPhase("demo");
    }
  }

  if (!pick) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eef4ff] text-brand"><Icon name="plane" size={28} /></span>
        <h1 className="mt-5 text-2xl font-extrabold">No flight selected</h1>
        <p className="mt-2 text-muted">Search and pick a flight first.</p>
        <Link href="/" className="btn-primary mt-6">Search flights</Link>
      </div>
    );
  }

  const f = pick.flight;
  const adults = pick.search.adults;
  const locked = Boolean(order);
  const busy = phase === "paying";
  const step = order ? 3 : 2;
  const date = new Date(pick.search.travelDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const payLabel = busy ? "Opening secure payment…" : order?.razorpay ? `Pay ${inr(order.total)} now` : price ? `Continue to pay ${inr(price.total)}` : "Pricing…";

  return (
    <div className="pb-28 lg:pb-12">
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <Link href={`/flights?from=${f.fromCode}&to=${f.toCode}&date=${pick.search.travelDate}&adults=${adults}&cabin=${pick.search.cabin}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-brand">
              <Icon name="arrow" size={15} className="rotate-180" /> Change flight
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold">Review and book</h1>
          </div>
          <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            {["Flight", "Travellers", "Payment"].map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${i + 1 < step ? "bg-emerald-500 text-white" : i + 1 === step ? "bg-brand text-white ring-4 ring-brand/15" : "bg-soft text-subtle"}`}>{i + 1 < step ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</span>
                <span className={i + 1 <= step ? "text-ink" : "text-subtle"}>{label}</span>
                {i < 2 ? <span className={`h-px w-5 sm:w-10 ${i + 1 < step ? "bg-emerald-400" : "bg-line"}`} /> : null}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form id="booking" onSubmit={submit} className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-soft/60 px-5 py-3 text-sm">
              <span className="font-bold">Departure <span className="font-semibold text-muted">· {date}</span></span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${f.refundable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{f.refundable ? "Refundable" : "Non-refundable"}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft font-display text-sm font-extrabold text-brand">{f.airlineCode}</span>
                <div>
                  <p className="font-bold">{f.airlineName}</p>
                  <p className="text-xs text-subtle">{f.airlineCode} {f.flightNumber} · {cabins[pick.search.cabin] ?? "Economy"}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                <div>
                  <p className="font-display text-3xl font-extrabold">{f.depart}</p>
                  <p className="text-sm font-bold">{f.fromCode}</p>
                  <p className="text-xs text-muted">{cityOf(f.fromCode)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-muted">{f.duration}</p>
                  <div className="my-1.5 flex items-center gap-1 text-brand">
                    <span className="h-2 w-2 rounded-full border-2 border-brand" />
                    <span className="h-px flex-1 border-t-2 border-dashed border-line" />
                    <Icon name="plane" size={16} className="rotate-45" />
                  </div>
                  <p className={`text-xs font-semibold ${f.stops ? "text-sun" : "text-emerald-600"}`}>{f.stops ? `${f.stops} stop` : "Non-stop"}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl font-extrabold">{f.arrive}</p>
                  <p className="text-sm font-bold">{f.toCode}</p>
                  <p className="text-xs text-muted">{cityOf(f.toCode)}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-muted">
                <Fact icon="suitcase" label="Cabin bag" value={f.cabinBaggage || "7 kg"} />
                <Fact icon="suitcase" label="Check-in" value={f.checkInBaggage || "15 kg"} />
                <Fact icon="headset" label="Travellers" value={`${adults} adult${adults > 1 ? "s" : ""}`} />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHead icon="edit" title="Traveller details" hint="Enter names exactly as on the government ID. Name changes are not allowed after booking." />
            <div className="divide-y divide-line">
              {pax.map((p, i) => (
                <div key={i} className="grid gap-4 px-5 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-end">
                  <div>
                    <p className="mb-1.5 text-sm font-bold">Adult {i + 1}{i === 0 ? <span className="ml-1.5 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[11px] text-brand">Lead</span> : null}</p>
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-soft p-1">
                      {["Mr", "Ms", "Mrs"].map((t) => (
                        <button key={t} type="button" disabled={locked} onClick={() => setPax(pax.map((x, j) => (j === i ? { ...x, title: t } : x)))} className={`rounded-lg py-1.5 text-sm font-semibold transition ${p.title === t ? "bg-white text-brand shadow-sm" : "text-muted hover:text-ink"}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <label className="label">Full name
                    <input value={p.fullName} disabled={locked} onChange={(e) => setPax(pax.map((x, j) => (j === i ? { ...x, fullName: e.target.value } : x)))} placeholder="First and last name" className="field" required />
                  </label>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHead icon="headset" title="Contact details" hint="Your e-ticket and booking updates go here." />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <label className="label">Mobile number
                <span className="relative block">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 mt-[3px] -translate-y-1/2 text-sm font-semibold text-muted">+91</span>
                  <input value={phone} disabled={locked} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" className="field pl-12" />
                </span>
              </label>
              <label className="label">Email<input value={user.email} disabled className="field bg-soft text-subtle" /></label>
            </div>
          </Panel>

          <Panel>
            <PanelHead icon="lock" title="Payment" hint="You pay securely through Razorpay. We never see your card or UPI PIN." />
            <div className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => <span key={m} className="rounded-lg border border-line bg-soft/60 px-3 py-1.5 text-xs font-bold text-ink">{m}</span>)}
              </div>
              {order?.razorpay?.testMode ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                  <span><b>Test mode.</b> No real money is charged. In the Razorpay window use UPI ID <b>success@razorpay</b> or a Razorpay test card.</span>
                </p>
              ) : null}
              {phase === "dismissed" ? <Note tone="amber" title="Payment not completed" text={`Your booking ${order?.requestId ?? ""} is saved. No money was taken. Tap Pay to try again.`} /> : null}
              {phase === "pending" ? <Note tone="blue" title="Confirming your payment" text="Razorpay has not confirmed it yet. Check My trips in a minute, your ticket appears there once it is confirmed." /> : null}
              {phase === "demo" && order ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-bold text-amber-900">Booking created · {order.requestId}</p>
                  <p className="mt-1 text-sm text-amber-800">{order.message || "Online payment is not switched on yet. Confirm to complete this booking in demo mode."}</p>
                  <button type="button" onClick={() => void confirmDemo()} disabled={busy} className="btn-primary mt-3">Confirm booking</button>
                </div>
              ) : null}
            </div>
          </Panel>

          {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
        </form>

        <aside className="h-fit lg:sticky lg:top-24">
          <Panel>
            <div className="p-5">
              <h2 className="text-lg font-extrabold">Fare summary</h2>
              <p className="text-xs text-muted">{cityOf(f.fromCode)} to {cityOf(f.toCode)} · {adults} adult{adults > 1 ? "s" : ""}</p>
              {price ? (
                <dl className="mt-4 space-y-2.5 text-sm">
                  <Row k={`Airfare (${adults} × ${inr(f.price)})`} v={inr(price.netFare)} />
                  <Row k="Convenience fee" v={inr(price.markup)} />
                  <Row k="GST" v={inr(price.gst)} />
                  <div className="flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
                    <dt className="font-bold">Total</dt>
                    <dd className="font-display text-2xl font-extrabold">{inr(price.total)}</dd>
                  </div>
                </dl>
              ) : (
                <div className="mt-4 h-28 animate-pulse rounded-xl bg-soft" />
              )}
              {phase !== "demo" ? (
                <button type="submit" form="booking" disabled={busy || !price} className="btn-sun mt-5 hidden w-full py-3.5 text-base lg:flex">{payLabel}</button>
              ) : null}
            </div>
            <ul className="space-y-2 border-t border-line bg-soft/50 px-5 py-4 text-xs text-muted">
              <li className="flex items-center gap-2"><Icon name="shield" size={14} className="shrink-0 text-emerald-600" />Secured by Razorpay, 256-bit encryption</li>
              <li className="flex items-center gap-2"><Icon name="bolt" size={14} className="shrink-0 text-brand" />E-ticket in My trips right after payment</li>
              <li className="flex items-center gap-2"><Icon name="tag" size={14} className="shrink-0 text-sun" />No hidden charges, taxes included</li>
            </ul>
          </Panel>
        </aside>
      </div>

      {phase !== "demo" ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-muted">Total for {adults} adult{adults > 1 ? "s" : ""}</p>
              <p className="font-display text-xl font-extrabold">{price ? inr(price.total) : "…"}</p>
            </div>
            <button type="submit" form="booking" disabled={busy || !price} className="btn-sun px-6 py-3">{busy ? "Opening…" : "Pay now"}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-line bg-white">{children}</section>;
}

function PanelHead({ icon, title, hint }: { icon: IconName; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 px-5 pb-4 pt-5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef4ff] text-brand"><Icon name={icon} size={17} /></span>
      <div>
        <h2 className="text-lg font-extrabold leading-tight">{title}</h2>
        <p className="text-sm text-muted">{hint}</p>
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <span className="flex items-center gap-2"><Icon name={icon} size={15} className="text-subtle" />{label} <b className="text-ink">{value}</b></span>
  );
}

function Note({ tone, title, text }: { tone: "amber" | "blue"; title: string; text: string }) {
  const cls = tone === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-brand-dark";
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${cls}`}>
      <p className="font-bold">{title}</p>
      <p className="mt-0.5 opacity-90">{text}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
