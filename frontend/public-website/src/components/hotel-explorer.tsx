"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildStays, inr, referenceFor, type StayOffer } from "@/lib/catalog";
import { SearchPanel } from "./search-panel";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function shortDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} ${months[month - 1]}`;
}

function scoreLabel(rating: number) {
  if (rating >= 9) return "Excellent";
  if (rating >= 8) return "Very good";
  return "Good";
}

export function HotelExplorer({
  city,
  checkIn,
  checkOut,
  guests,
}: {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"price" | "rating">("rating");
  const [minRating, setMinRating] = useState(0);
  const [picked, setPicked] = useState<StayOffer | null>(null);
  const [stage, setStage] = useState<"results" | "guest" | "held">("results");
  const [guest, setGuest] = useState({ name: "", email: "" });
  const rail = useRef<HTMLElement>(null);
  const nights = Math.max(1, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000) || 1);

  useEffect(() => {
    setStage("results");
    setPicked(null);
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 680);
    return () => window.clearTimeout(timer);
  }, [city, checkIn, checkOut, guests]);

  useEffect(() => {
    if (!picked) return;
    rail.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [picked, stage]);

  const stays = useMemo(() => buildStays(city), [city]);
  const visible = stays
    .filter((stay) => stay.rating >= minRating)
    .sort((a, b) => (sort === "price" ? a.price - b.price : b.rating - a.rating));
  const total = picked ? picked.price * nights : 0;
  const place = city || "Dubai";
  const heroImage = (
    {
      Dubai: "/images/dubai.jpg",
      Bali: "/images/bali.jpg",
      Singapore: "/images/singapore.jpg",
      "Malé": "/images/maldives.jpg",
      Goa: "/images/goa.jpg",
    } as Record<string, string>
  )[place] ?? "/images/hero-hotels.jpg";

  return (
    <div>
      <section className="relative mt-16 h-[400px] overflow-hidden sm:h-[460px]">
        <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover object-[center_40%]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.78)_0%,rgba(8,16,32,0.36)_46%,transparent_72%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgba(8,16,32,0.45),transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8">
          <p className="inline-flex rounded-full border border-amber-200/40 bg-amber-200/15 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-amber-100 uppercase">Hotel booking</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Stays in {place}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-white/85 sm:text-base">Choose the dates, compare the rooms, and hold the one that fits. Payment confirms the stay.</p>
          <p className="mt-3 text-sm font-medium text-white/75">{shortDate(checkIn)} – {shortDate(checkOut)} · {nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {["City and dates", "Hold the room", "Nightly rate, before taxes"].map((point) => (
              <li key={point} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
        <SearchPanel mode="hotels" city={city} checkIn={checkIn} checkOut={checkOut} guests={String(guests)} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[240px_1fr]">
          <aside ref={rail} className="lg:sticky lg:top-24 lg:border-r lg:border-slate-200 lg:pr-7">
            {picked ? (
              <StayRail
                stage={stage}
                stay={picked}
                nights={nights}
                guests={guests}
                total={total}
                guest={guest}
                onGuest={setGuest}
                onContinue={() => setStage("guest")}
                onBack={() => setStage("results")}
                onHold={() => setStage("held")}
                onClear={() => { setStage("results"); setPicked(null); }}
              />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <p className="text-sm font-semibold tracking-tight text-slate-900">Filters</p>
                  {sort !== "rating" || minRating > 0 ? (
                    <button type="button" onClick={() => { setSort("rating"); setMinRating(0); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">Clear</button>
                  ) : (
                    <span className="text-xs text-slate-400">{stays.length} stays</span>
                  )}
                </div>

                <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Sort</p>
                <div className="mt-1" role="group" aria-label="Sort">
                  {([["rating", "Top rated"], ["price", "Lowest price"]] as const).map(([item, label]) => (
                    <button key={item} type="button" onClick={() => setSort(item)} aria-pressed={sort === item} className={`flex w-full items-center gap-3 py-2 text-left text-sm ${sort === item ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
                      <Dot on={sort === item} />
                      {label}
                    </button>
                  ))}
                </div>

                <p className="mt-4 border-t border-slate-200 pt-4 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Rating</p>
                <div className="mt-1" role="group" aria-label="Rating">
                  {([[0, "Any"], [9, "9 and above"]] as const).map(([item, label]) => (
                    <button key={item} type="button" onClick={() => setMinRating(item)} aria-pressed={minRating === item} className={`flex w-full items-center gap-3 py-2 text-left text-sm ${minRating === item ? "font-semibold text-slate-900" : "text-slate-500 hover:text-slate-800"}`}>
                      <Dot on={minRating === item} />
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </aside>

          <div>
            <p className="border-b border-slate-200 pb-3 text-sm text-slate-500">
              {loading ? "Finding stays…" : `${visible.length} stay${visible.length === 1 ? "" : "s"} in ${place}`}
            </p>
            <div className="mt-3 space-y-3">
              {loading
                ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200" />)
                : visible.map((stay) => {
                  const selected = picked?.id === stay.id;
                  return (
                    <article key={stay.id} className={`rise grid overflow-hidden rounded-2xl bg-white ring-1 md:grid-cols-[220px_1fr_180px] ${selected ? "ring-indigo-500" : "ring-slate-200"}`}>
                      <div className="relative min-h-44">
                        <Image src={stay.image} alt={stay.name} fill sizes="220px" className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center p-5">
                        <h2 className="text-lg font-semibold tracking-tight">{stay.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{stay.area} · {stay.rating.toFixed(1)} {scoreLabel(stay.rating)}</p>
                        <p className="mt-1 text-xs text-slate-400">{stay.reviews.toLocaleString("en-IN")} reviews</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {stay.perks.map((perk) => <span key={perk} className="text-xs text-slate-500">{perk}</span>)}
                        </div>
                      </div>
                      <div className="flex flex-col justify-center border-t border-slate-100 p-5 md:border-t-0 md:border-l">
                        <p className="text-2xl font-semibold tracking-[-0.03em]">{inr(stay.price)}</p>
                        <p className="text-[11px] tracking-wide text-slate-400">a night</p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">{inr(stay.price * nights)} total</p>
                        <p className="text-xs text-slate-400">{nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (selected && stage === "results") { setPicked(null); return; }
                            if (selected) return;
                            setPicked(stay);
                            setStage("results");
                          }}
                          className={`mt-4 rounded-full border px-4 py-2 text-sm font-semibold ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"}`}
                        >
                          {selected ? "Selected" : "Reserve"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              {!loading && visible.length === 0 ? <p className="py-8 text-sm text-slate-500">Nothing at that rating. Choose Any to see the rest.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ on }: { on: boolean }) {
  return (
    <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? "border-indigo-600" : "border-slate-300"}`}>
      {on ? <span className="h-2 w-2 rounded-full bg-indigo-600" /> : null}
    </span>
  );
}

function StayRail({
  stage,
  stay,
  nights,
  guests,
  total,
  guest,
  onGuest,
  onContinue,
  onBack,
  onHold,
  onClear,
}: {
  stage: "results" | "guest" | "held";
  stay: StayOffer;
  nights: number;
  guests: number;
  total: number;
  guest: { name: string; email: string };
  onGuest: (guest: { name: string; email: string }) => void;
  onContinue: () => void;
  onBack: () => void;
  onHold: () => void;
  onClear: () => void;
}) {
  const step = stage === "held" ? 2 : stage === "guest" ? 1 : 0;
  return (
    <div>
      <ol className="flex gap-3 border-b border-slate-200 pb-3 text-[11px] font-semibold tracking-[0.12em] uppercase">
        {["Room", "Guest", "Hold"].map((label, index) => (
          <li key={label} className={index === step ? "text-slate-900" : index < step ? "text-indigo-600" : "text-slate-300"}>{index + 1}. {label}</li>
        ))}
      </ol>
      <p className="mt-5 text-sm font-semibold">{stay.name}</p>
      <p className="mt-1 text-sm text-slate-500">{stay.area} · {stay.rating.toFixed(1)} {scoreLabel(stay.rating)}</p>
      <p className="mt-1 text-sm text-slate-500">{nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}</p>

      {stage === "results" ? (
        <>
          <p className="mt-5 flex items-baseline justify-between border-t border-slate-200 pt-4">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">Total</span>
            <span className="text-2xl font-semibold tracking-[-0.03em]">{inr(total)}</span>
          </p>
          <p className="mt-1 text-xs text-slate-400">{inr(stay.price)} a night</p>
          <button type="button" onClick={onContinue} className="mt-5 w-full rounded-full bg-[#17191e] py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Continue</button>
          <button type="button" onClick={onClear} className="mt-2 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Back to filters</button>
        </>
      ) : null}

      {stage === "guest" ? (
        <form className="mt-5" onSubmit={(event) => { event.preventDefault(); onHold(); }}>
          <Field label="Name" value={guest.name} placeholder="Priya Sharma" onChange={(name) => onGuest({ ...guest, name })} />
          <Field label="Email" type="email" value={guest.email} placeholder="priya@email.com" onChange={(email) => onGuest({ ...guest, email })} />
          <p className="mt-4 text-sm text-slate-500">{inr(total)} for {nights} night{nights > 1 ? "s" : ""}</p>
          <button type="submit" className="mt-4 w-full rounded-full bg-[#17191e] py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Hold this room</button>
          <button type="button" onClick={onBack} className="mt-2 w-full py-2 text-sm font-semibold text-slate-500 hover:text-slate-800">Back</button>
        </form>
      ) : null}

      {stage === "held" ? (
        <>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-600 uppercase">Room held</p>
            <p className="mt-2 font-mono text-xl font-semibold tracking-[0.12em]">{referenceFor(`${stay.id}-${guest.email}`)}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{guest.name}. The room stays with your trip for 15 minutes. Payment confirms it.</p>
          </div>
          <button type="button" onClick={onClear} className="mt-5 w-full rounded-full border border-slate-900 py-2.5 text-sm font-semibold hover:bg-slate-900 hover:text-white">Choose another stay</button>
        </>
      ) : null}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return (
    <label className="mt-4 block text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
      {label}
      <input required type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full border-b border-slate-300 bg-transparent py-2 text-sm font-semibold tracking-normal text-slate-900 normal-case outline-none placeholder:font-medium placeholder:text-slate-400 focus:border-slate-900" />
    </label>
  );
}
