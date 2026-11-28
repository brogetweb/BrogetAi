"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { openAuth } from "@/components/auth-drawer";
import { Icon } from "@/components/icons";
import { inr, picked, session, type Flight, type SearchInput } from "@/lib/api";

/** Sends the picked flight to /book, or opens the login drawer first when logged out. */
export function useBookFlight() {
  const router = useRouter();
  return (flight: Flight, search: SearchInput) => {
    picked.set({ flight, search });
    if (session.token()) router.push("/book");
    else openAuth("login", "/book");
  };
}

/** Stack of flight rows with a small gap between each one. */
export function FlightList({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FlightListHead() {
  return (
    <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_minmax(0,1fr)_auto] gap-6 px-5 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-subtle md:grid">
      <span>Airline</span>
      <span>Departure · Duration · Arrival</span>
      <span className="text-right">Price</span>
      <span className="w-[76px]" />
    </div>
  );
}

/** One compact flight row: airline, times, price and Book on a single line (two short lines on mobile). */
export function FlightCard({ flight: f, onBook }: { flight: Flight; index?: number; onBook: () => void }) {
  const bags = [f.cabinBaggage && `Cabin ${f.cabinBaggage}`, f.checkInBaggage && `Check-in ${f.checkInBaggage}`].filter(Boolean).join(" · ");
  return (
    <article className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-white px-4 py-3 transition hover:border-brand/40 hover:shadow-[0_8px_24px_-18px_rgba(29,91,255,.6)] md:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_minmax(0,1fr)_auto] md:gap-6 md:px-5">
      <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 md:col-start-auto md:row-start-auto">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-soft font-display text-xs font-extrabold text-brand">{f.airlineCode || <Icon name="plane" size={16} />}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{f.airlineName}</p>
          <p className="truncate text-xs text-subtle">{f.airlineCode} {f.flightNumber}{bags ? <span className="hidden lg:inline"> · {bags}</span> : null}</p>
        </div>
      </div>

      <div className="col-start-1 row-start-2 flex items-center gap-3 md:col-start-auto md:row-start-auto">
        <div className="w-14 shrink-0">
          <p className="font-display text-lg font-extrabold leading-tight">{f.depart}</p>
          <p className="text-[11px] font-semibold text-subtle">{f.fromCode}</p>
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[11px] font-semibold text-muted">{f.duration}</p>
          <div className="relative my-0.5 h-px bg-line"><span className="absolute -top-[3px] right-0 h-[7px] w-[7px] rounded-full bg-brand" /></div>
          <p className={`text-[11px] font-semibold ${f.stops ? "text-sun" : "text-emerald-600"}`}>{f.stops ? `${f.stops} stop` : "Non-stop"}</p>
        </div>
        <div className="w-14 shrink-0 text-right">
          <p className="font-display text-lg font-extrabold leading-tight">{f.arrive}</p>
          <p className="text-[11px] font-semibold text-subtle">{f.toCode}</p>
        </div>
      </div>

      <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
        <p className="font-display text-lg font-extrabold leading-tight">{inr(f.price)}</p>
        <p className="text-[11px] text-subtle">{f.refundable ? "Refundable" : "Non-refundable"}</p>
      </div>

      <button type="button" onClick={onBook} className="btn-primary col-start-2 row-start-2 w-full px-0 md:w-[76px] py-2 text-sm md:col-start-auto md:row-start-auto">Book</button>
    </article>
  );
}

/** Text match on airline name, airline code or flight number (e.g. "indigo", "6E", "6E 2031"). */
export function matchesQuery(f: Flight, query: string) {
  const q = query.trim().toLowerCase().replace(/[\s-]/g, "");
  if (!q) return true;
  const hay = `${f.airlineName}|${f.airlineCode}|${f.flightNumber}|${f.airlineCode}${f.flightNumber}`.toLowerCase().replace(/[\s-]/g, "");
  return hay.includes(q);
}

export function FlightFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="relative block w-full sm:w-72">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"><Icon name="plane" size={16} /></span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Find airline or flight no." aria-label="Find airline or flight number" className="field mt-0 pl-9" />
    </label>
  );
}
