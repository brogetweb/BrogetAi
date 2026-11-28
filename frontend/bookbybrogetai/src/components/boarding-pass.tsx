"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cityOf, inr, type Order } from "@/lib/api";

const cabins: Record<string, string> = { "0": "Economy", "1": "Business", "2": "First", "3": "Premium economy" };
/** Page background, used to "cut" the round notches out of the ticket edge. */
const PAGE_BG = "bg-[#f6f8fc]";

const status: Record<string, { label: string; tone: string }> = {
  ticketed: { label: "Confirmed", tone: "bg-emerald-400/15 text-emerald-300 ring-emerald-300/40" },
  paid: { label: "Paid, ticketing", tone: "bg-sky-400/15 text-sky-200 ring-sky-300/40" },
  pending: { label: "Payment pending", tone: "bg-amber-400/15 text-amber-200 ring-amber-300/40" },
  failed: { label: "Not booked", tone: "bg-red-400/15 text-red-200 ring-red-300/40" },
};

/** Deterministic barcode bars from the PNR / booking id (decorative, like a printed pass). */
function bars(seed: string) {
  let h = 2166136261;
  const out: number[] = [];
  for (let i = 0; i < 46; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i;
    h = Math.imul(h, 16777619) >>> 0;
    out.push(1 + (h % 3));
  }
  return out;
}

function Barcode({ seed, vertical = false }: { seed: string; vertical?: boolean }) {
  return (
    <div aria-hidden className={`flex ${vertical ? "h-full w-12 flex-col" : "h-12 w-full"} items-stretch gap-[2px] overflow-hidden`}>
      {bars(seed || "BROGET").map((w, i) => (
        <span key={i} className={`shrink-0 rounded-[1px] ${i % 2 ? "bg-transparent" : "bg-ink"}`} style={vertical ? { height: w } : { width: w }} />
      ))}
    </div>
  );
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2 min-w-0" : "min-w-0"}>
      <p className="text-[10px] font-bold uppercase tracking-[.14em] text-subtle">{label}</p>
      <p className="mt-0.5 truncate font-display text-sm font-extrabold text-ink sm:text-[15px]">{children}</p>
    </div>
  );
}

/** Full boarding pass for an upcoming trip: main ticket, perforation with notches, tear-off stub with barcode. */
export function BoardingPass({
  order: o,
  when,
  highlight,
  action,
}: {
  order: Order;
  when: string;
  highlight?: boolean;
  action: ReactNode;
}) {
  const f = (o.flight || {}) as Record<string, string>;
  const pax = o.passengers?.length ? o.passengers : [{ fullName: o.travellerName, title: "" }];
  const lead = [pax[0]?.title, pax[0]?.fullName].filter(Boolean).join(" ") || o.travellerName || "Traveller";
  const s = status[o.status] || { label: o.status, tone: "bg-white/10 text-white ring-white/20" };
  const date = f.date ? new Date(`${f.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  const code = o.pnr || o.requestId;

  return (
    <article className={`rise relative flex flex-col drop-shadow-[0_14px_22px_rgba(11,22,48,.12)] md:flex-row ${highlight ? "rounded-[22px] ring-4 ring-emerald-200" : ""}`}>
      {/* Main ticket */}
      <div className="min-w-0 flex-1 overflow-hidden rounded-t-2xl bg-white md:rounded-l-2xl md:rounded-tr-none">
        <div className="flex items-center justify-between gap-3 bg-[linear-gradient(120deg,#0b1630,#123a8f_60%,#1d5bff)] px-5 py-3 text-white">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15 font-display text-xs font-extrabold">{f.airlineCode || (f.flightCode || "").split(" ")[0] || <Icon name="plane" size={14} />}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{f.airline || "Flight"}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-white/60">E-ticket · Boarding pass</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {when ? <span className="hidden rounded-full bg-sun px-2.5 py-0.5 text-[11px] font-extrabold text-white sm:inline">{when}</span> : null}
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${s.tone}`}>{s.label}</span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-subtle">From</p>
              <p className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">{f.fromCode}</p>
              <p className="mt-1 truncate text-xs font-semibold text-muted">{cityOf(f.fromCode)}</p>
            </div>
            <div className="flex flex-col items-center pb-5 text-brand">
              <p className="text-[11px] font-semibold text-muted">{f.duration}</p>
              <div className="flex w-20 items-center gap-1 sm:w-32">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="h-px flex-1 border-t-2 border-dotted border-brand/40" />
                <Icon name="plane" size={18} className="rotate-45" />
                <span className="h-px flex-1 border-t-2 border-dotted border-brand/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              </div>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-subtle">To</p>
              <p className="font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">{f.toCode}</p>
              <p className="mt-1 truncate text-xs font-semibold text-muted">{cityOf(f.toCode)}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-4">
            <Field label="Passenger" wide>{lead}{pax.length > 1 ? ` +${pax.length - 1}` : ""}</Field>
            <Field label="Date">{date}</Field>
            <Field label="Flight">{f.flightCode}</Field>
            <Field label="Departs">{f.depart}</Field>
            <Field label="Arrives">{f.arrive}</Field>
            <Field label="Class">{cabins[f.cabin] ?? (f.cabin || "Economy")}</Field>
            <Field label="Paid">{inr(o.total)}</Field>
          </div>
        </div>
      </div>

      {/* Perforation: dashed tear line with round notches cut out of the edges */}
      <div className="relative h-0 md:h-auto md:w-0">
        <span aria-hidden className={`absolute -left-3 -top-3 h-6 w-6 rounded-full ${PAGE_BG} md:-left-3 md:-top-3`} />
        <span aria-hidden className={`absolute -right-3 -top-3 h-6 w-6 rounded-full ${PAGE_BG} md:-bottom-3 md:left-[-12px] md:right-auto md:top-auto`} />
        <span aria-hidden className="absolute inset-x-4 top-0 border-t-2 border-dashed border-line md:inset-x-auto md:inset-y-4 md:left-0 md:top-4 md:border-l-2 md:border-t-0" />
      </div>

      {/* Tear-off stub */}
      <div className="flex flex-col gap-4 rounded-b-2xl bg-white px-5 pb-5 pt-5 md:w-64 md:rounded-r-2xl md:rounded-bl-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-subtle">{o.pnr ? "PNR" : "Booking ID"}</p>
            <p className="break-all font-mono text-xl font-extrabold tracking-wider text-ink">{code}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-subtle">Seat</p>
            <p className="font-display text-sm font-extrabold text-muted">At check-in</p>
          </div>
        </div>
        <Barcode seed={code} />
        <p className="-mt-2 text-center font-mono text-[10px] tracking-[.3em] text-subtle">{code}</p>
        {action}
      </div>
    </article>
  );
}

/** Slim ticket strip for past trips: same ticket language, smaller. */
export function PastTicket({ order: o, actions }: { order: Order; actions: ReactNode }) {
  const f = (o.flight || {}) as Record<string, string>;
  const done = o.status === "ticketed" || o.status === "paid";
  const date = f.date ? new Date(`${f.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  return (
    <article className="relative flex flex-col drop-shadow-[0_8px_14px_rgba(11,22,48,.06)] sm:flex-row">
      <div className="flex min-w-0 flex-1 items-center gap-4 rounded-t-xl bg-white px-4 py-3 sm:rounded-l-xl sm:rounded-tr-none">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="font-display text-xl font-extrabold text-muted">{f.fromCode}</p>
            <Icon name="plane" size={15} className="shrink-0 rotate-45 text-subtle" />
            <p className="font-display text-xl font-extrabold text-muted">{f.toCode}</p>
            <span className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${done ? "bg-soft text-muted ring-line" : "bg-red-50 text-red-700 ring-red-200"}`}>{done ? "Completed" : o.status === "pending" ? "Not paid" : "Not booked"}</span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">{date} · {f.airline} {f.flightCode} · {f.depart} to {f.arrive}</p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-xs font-bold text-ink">{o.pnr || o.requestId}</p>
          <p className="text-xs font-semibold text-muted">{inr(o.total)}</p>
        </div>
      </div>
      <div className="relative h-0 sm:h-auto sm:w-0">
        <span aria-hidden className="absolute inset-x-3 top-0 border-t-2 border-dashed border-line sm:inset-x-auto sm:inset-y-2 sm:left-0 sm:top-2 sm:border-l-2 sm:border-t-0" />
      </div>
      <div className="flex items-center gap-2 rounded-b-xl bg-white px-4 py-3 sm:rounded-r-xl sm:rounded-bl-none">{actions}</div>
    </article>
  );
}
