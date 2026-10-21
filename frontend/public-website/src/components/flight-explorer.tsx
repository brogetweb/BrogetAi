"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { buildFlights, formatDuration, inr, parsePlace, referenceFor, type FlightOffer } from "@/lib/catalog";
import { SearchPanel } from "./search-panel";

const airlineTone: Record<string, string> = {
  IndiGo: "bg-sky-600",
  "Air India": "bg-red-700",
  "Akasa Air": "bg-orange-500",
  Emirates: "bg-red-600",
  "Singapore Airlines": "bg-amber-500",
  Vistara: "bg-violet-700",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} ${months[month - 1]}`;
}

export function FlightExplorer({
  from,
  to,
  depart,
  ret,
  adults,
  children,
  cabin,
}: {
  from: string;
  to: string;
  depart: string;
  ret: string;
  adults: number;
  children: number;
  cabin: string;
}) {
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState<"any" | "0" | "1">("any");
  const [sort, setSort] = useState<"price" | "duration">("price");
  const [airline, setAirline] = useState("All");
  const [picked, setPicked] = useState<FlightOffer | null>(null);
  const [fare, setFare] = useState<"Saver" | "Flex">("Saver");
  const [stage, setStage] = useState<"results" | "names" | "held">("results");
  const [guest, setGuest] = useState({ first: "", last: "", email: "" });
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    setStage("results");
    setPicked(null);
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 680);
    return () => window.clearTimeout(timer);
  }, [from, to, depart, ret, cabin]);

  useEffect(() => {
    if (!picked) return;
    rail.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [picked, stage]);

  const flights = useMemo(() => buildFlights(from, to), [from, to]);
  const names = ["All", ...new Set(flights.map((flight) => flight.airline))];
  const visible = flights
    .filter((flight) => (stops === "any" ? true : flight.stops === Number(stops)))
    .filter((flight) => (airline === "All" ? true : flight.airline === airline))
    .sort((a, b) => (sort === "price" ? a.price - b.price : a.durationMin - b.durationMin));

  const cabinLift = cabin === "Business" ? 2.4 : cabin === "Premium economy" ? 1.55 : 1;
  const unit = picked ? Math.round(picked.price * cabinLift + (fare === "Flex" ? 2200 : 0)) : 0;
  const total = unit * adults + Math.round(unit * 0.75) * children;
  const origin = parsePlace(from);
  const destination = parsePlace(to);
  const travellers = adults + children;
  const when = ret ? `${shortDate(depart)} – ${shortDate(ret)}` : shortDate(depart);
  const lowest = visible.length ? Math.min(...visible.map((flight) => Math.round(flight.price * cabinLift))) : 0;

  return (
    <div>
      <section className="relative mt-16 h-[400px] overflow-hidden sm:h-[460px]">
        <Image src="/images/hero-flights-full.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.78)_0%,rgba(8,16,32,0.36)_46%,transparent_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(8,16,32,0.45),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8">
          <p className="inline-flex rounded-full border border-sky-200/40 bg-sky-200/15 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-sky-100 uppercase">Flight booking</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">{origin.city} to {destination.city}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">Compare nonstop and one-stop fares, then hold the price you want. Payment tickets the trip.</p>
          <p className="mt-3 text-sm font-medium text-white/75">{when} · {travellers} traveller{travellers > 1 ? "s" : ""} · {cabin}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {["Nonstop and one-stop", "Hold the fare", "Same desk as the room"].map((point) => (
              <li key={point} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
        <SearchPanel mode="flights" from={from} to={to} depart={depart} ret={ret} adults={String(adults)} children={String(children)} cabin={cabin} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[240px_1fr]">
          <aside ref={rail} className="lg:sticky lg:top-24 lg:border-r lg:border-slate-200 lg:pr-7">
            {picked ? (
              <BookingRail
                stage={stage}
                flight={picked}
                fare={fare}
                cabin={cabin}
                travellers={travellers}
                unit={Math.round(picked.price * cabinLift)}
                total={total}
                guest={guest}
                onFare={setFare}
                onGuest={setGuest}
                onContinue={() => setStage("names")}
                onBack={() => setStage("results")}
                onHold={() => setStage("held")}
                onClear={() => { setStage("results"); setPicked(null); }}
              />
            ) : (
            <>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <p className="text-sm font-semibold tracking-tight text-slate-900">Filters</p>
              {stops !== "any" || airline !== "All" ? (
                <button type="button" onClick={() => { setStops("any"); setAirline("All"); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Clear</button>
              ) : (
                <span className="text-xs text-slate-400">{flights.length} fares</span>
              )}
            </div>

            <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Stops</p>
            <div className="mt-1" role="group" aria-label="Stops">
              {([["any", "Any"], ["0", "Nonstop"], ["1", "1 stop"]] as const).map(([item, label]) => (
                <button key={item} type="button" onClick={() => setStops(item)} aria-pressed={stops === item} className={`flex w-full items-center gap-3 py-2 text-left text-sm ${stops === item ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${stops === item ? "border-indigo-600" : "border-slate-300"}`}>
                    {stops === item ? <span className="h-2 w-2 rounded-full bg-indigo-600" /> : null}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            <p className="mt-4 border-t border-slate-200 pt-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Airline</p>
            <div className="mt-1" role="group" aria-label="Airline">
              {names.map((name) => {
                const active = airline === name;
                const count = flights.filter((flight) => (stops === "any" || flight.stops === Number(stops)) && (name === "All" || flight.airline === name)).length;
                return (
                  <button key={name} type="button" onClick={() => setAirline(name)} aria-pressed={active} className={`flex w-full items-center gap-3 py-2 text-left text-sm ${active ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
                    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${active ? "border-indigo-600" : "border-slate-300"}`}>
                      {active ? <span className="h-2 w-2 rounded-full bg-indigo-600" /> : null}
                    </span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${name === "All" ? "bg-slate-300" : airlineTone[name]}`} />
                    <span className="min-w-0 flex-1 truncate">{name === "All" ? "All airlines" : name}</span>
                    <span className="w-4 text-right text-xs tabular-nums text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
            </>
            )}
          </aside>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm tracking-wide text-slate-500">
                {loading ? "Checking fares…" : `${visible.length} fare${visible.length === 1 ? "" : "s"}${lowest ? ` · from ${inr(lowest)}` : ""}`}
              </p>
              <div className="flex gap-5 text-[11px] font-bold tracking-[0.14em] uppercase">
                <button type="button" onClick={() => setSort("price")} className={sort === "price" ? "border-b border-slate-900 pb-0.5 text-slate-900" : "pb-0.5 text-slate-400 hover:text-slate-700"}>Cheapest</button>
                <button type="button" onClick={() => setSort("duration")} className={sort === "duration" ? "border-b border-slate-900 pb-0.5 text-slate-900" : "pb-0.5 text-slate-400 hover:text-slate-700"}>Fastest</button>
              </div>
            </div>
            <div className="space-y-3">
              {loading
                ? Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)
                : visible.map((flight, index) => {
                  const selected = picked?.id === flight.id;
                  const price = Math.round(flight.price * cabinLift);
                  return (
                    <article key={flight.id} className={`rise rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 sm:px-5 ${selected ? "ring-indigo-500" : "ring-slate-200"}`} style={{ animationDelay: `${index * 40}ms` }}>
                      <div className="grid items-center gap-5 lg:grid-cols-[180px_1fr_150px_auto]">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-bold tracking-wide text-white ${airlineTone[flight.airline]}`}>
                            {flight.airline.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold tracking-tight">{flight.airline}</p>
                            <p className="mt-0.5 text-[11px] tracking-wide text-slate-400">{flight.seats} seats left</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Time code={flight.fromCode} clock={flight.depart} />
                          <div className="min-w-0 flex-1 text-center">
                            <p className="text-[11px] font-medium tracking-wide text-slate-400">{formatDuration(flight.durationMin)}</p>
                            <div className="relative mx-auto mt-2 h-px w-full max-w-40 bg-slate-300">
                              <span className="absolute top-1/2 left-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-slate-400" />
                              <span className="absolute top-1/2 right-0 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#17191e]" />
                            </div>
                            <p className="mt-2 text-[11px] tracking-wide text-slate-500">{flight.stops === 0 ? "Nonstop" : "1 stop"}</p>
                          </div>
                          <Time code={flight.toCode} clock={flight.arrive} extra={flight.nextDay ? "+1" : ""} align="right" />
                        </div>
                        <div className="lg:text-right">
                          <p className="text-2xl font-semibold tracking-[-0.03em]">{inr(price)}</p>
                          <p className="mt-0.5 text-[11px] tracking-wide text-slate-400">per adult</p>
                        </div>
                        <button type="button" onClick={() => {
                          if (selected && stage === "results") { setPicked(null); return; }
                          if (selected) return;
                          setPicked(flight);
                          setFare("Saver");
                          setStage("results");
                        }} className={`rounded-full border px-5 py-2 text-sm font-semibold ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"}`}>
                          {selected ? "Selected" : "Select"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              {!loading && visible.length === 0 ? <p className="rounded-2xl bg-white px-5 py-8 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">No fares match those filters. Clear a filter to see the rest.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Time({ code, clock, extra, align = "left" }: { code: string; clock: string; extra?: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right" : ""}>
      <p className="text-lg font-semibold tracking-[-0.03em]">{clock}{extra ? <span className="ml-1 text-[11px] font-semibold text-indigo-600">{extra}</span> : null}</p>
      <p className="mt-0.5 text-[11px] font-semibold tracking-[0.14em] text-slate-400">{code}</p>
    </div>
  );
}

function BookingRail({
  stage,
  flight,
  fare,
  cabin,
  travellers,
  unit,
  total,
  guest,
  onFare,
  onGuest,
  onContinue,
  onBack,
  onHold,
  onClear,
}: {
  stage: "results" | "names" | "held";
  flight: FlightOffer;
  fare: "Saver" | "Flex";
  cabin: string;
  travellers: number;
  unit: number;
  total: number;
  guest: { first: string; last: string; email: string };
  onFare: (fare: "Saver" | "Flex") => void;
  onGuest: (guest: { first: string; last: string; email: string }) => void;
  onContinue: () => void;
  onBack: () => void;
  onHold: () => void;
  onClear: () => void;
}) {
  const step = stage === "held" ? 2 : stage === "names" ? 1 : 0;
  return (
    <div>
      <ol className="flex gap-3 border-b border-slate-200 pb-3 text-[11px] font-bold tracking-[0.12em] uppercase">
        {["Fare", "Passenger", "Hold"].map((label, index) => (
          <li key={label} className={index === step ? "text-slate-900" : index < step ? "text-indigo-600" : "text-slate-300"}>{index + 1}. {label}</li>
        ))}
      </ol>
      <p className="mt-5 text-sm font-semibold">{flight.airline}</p>
      <p className="mt-1 text-sm text-slate-500">{flight.fromCode} {flight.depart} → {flight.toCode} {flight.arrive}</p>
      <p className="mt-1 text-sm text-slate-500">{formatDuration(flight.durationMin)} · {flight.stops === 0 ? "Nonstop" : "1 stop"} · {cabin}</p>

      {stage === "results" ? (
        <>
          <div className="mt-4 grid gap-2" role="group" aria-label="Fare">
            <FareRow name="Saver" detail="Cabin bag · paid seat" price={inr(unit)} active={fare === "Saver"} onClick={() => onFare("Saver")} />
            <FareRow name="Flex" detail="Free date change · seat pick" price={inr(unit + 2200)} active={fare === "Flex"} onClick={() => onFare("Flex")} />
          </div>
          <p className="mt-5 flex items-baseline justify-between">
            <span className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">Total</span>
            <span className="text-2xl font-semibold tracking-[-0.03em]">{inr(total)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">{travellers} traveller{travellers > 1 ? "s" : ""} · {fare}</p>
          <button type="button" onClick={onContinue} className="mt-5 w-full rounded-full bg-[#17191e] py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Continue</button>
          <button type="button" onClick={onClear} className="mt-2 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Back to filters</button>
        </>
      ) : null}

      {stage === "names" ? (
        <form className="mt-5" onSubmit={(event) => { event.preventDefault(); onHold(); }}>
          <Text label="First name" value={guest.first} onChange={(first) => onGuest({ ...guest, first })} placeholder="Priya" />
          <Text label="Last name" value={guest.last} onChange={(last) => onGuest({ ...guest, last })} placeholder="Sharma" />
          <Text label="Email" type="email" value={guest.email} onChange={(email) => onGuest({ ...guest, email })} placeholder="priya@email.com" />
          <p className="mt-4 text-sm text-slate-500">{inr(total)} · {fare}</p>
          <button type="submit" className="mt-4 w-full rounded-full bg-[#17191e] py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Hold this fare</button>
          <button type="button" onClick={onBack} className="mt-2 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Back</button>
        </form>
      ) : null}

      {stage === "held" ? (
        <>
          <div className="mt-5 rounded-2xl bg-indigo-50 px-4 py-4">
            <p className="text-[11px] font-bold tracking-[0.16em] text-indigo-600 uppercase">Fare held</p>
            <p className="mt-2 font-mono text-xl font-semibold tracking-[0.12em] text-slate-900">{referenceFor(`${flight.id}-${guest.email}`)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{guest.first} {guest.last}. This fare stays with your trip for 15 minutes. Payment tickets it.</p>
          </div>
          <button type="button" onClick={onClear} className="mt-5 w-full rounded-full border border-slate-900 py-2.5 text-sm font-semibold hover:bg-slate-900 hover:text-white">Choose another fare</button>
        </>
      ) : null}
    </div>
  );
}

function FareRow({ name, detail, price, active, onClick }: { name: string; detail: string; price: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
      <span className={`h-3.5 w-3.5 shrink-0 rounded-full border ${active ? "border-indigo-600 bg-indigo-600 shadow-[inset_0_0_0_2px_white]" : "border-slate-300"}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{name}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{detail}</span>
      </span>
      <span className="text-sm font-semibold">{price}</span>
    </button>
  );
}

function Text({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder: string }) {
  return (
    <label className="mt-4 block text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase">
      {label}
      <input required type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold tracking-normal text-slate-900 normal-case outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white" />
    </label>
  );
}

export function HoldCard({ title, code, detail, price, note, onReset }: { title: string; code: string; detail: string; price: string; note: string; onReset: () => void }) {
  return (
    <div className="rise mx-auto mt-8 max-w-xl rounded-3xl bg-[#12141a] p-8 text-white">
      <p className="text-[11px] font-bold tracking-[0.16em] text-indigo-200 uppercase">{title}</p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-[0.18em]">{code}</p>
      <p className="mt-4 text-sm text-white/75">{detail}</p>
      <p className="mt-2 text-2xl font-semibold">{price}</p>
      <p className="mt-3 text-sm leading-6 text-white/60">{note}</p>
      <button type="button" onClick={onReset} className="mt-6 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#12141a]">Change selection</button>
    </div>
  );
}
