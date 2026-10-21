"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { collection, fareDeals, inr, placeLabel } from "@/lib/catalog";

const tags = ["All", "Beach", "City", "Island"] as const;

function fareHref(from: string, fromCode: string, to: string, toCode: string) {
  const params = new URLSearchParams({
    from: placeLabel(from, fromCode),
    to: placeLabel(to, toCode),
    depart: "2026-11-12",
    return: "2026-11-18",
    adults: "1",
    children: "0",
    cabin: "Economy",
  });
  return `/flights?${params.toString()}`;
}

export function HomeBrowse() {
  const [tag, setTag] = useState<(typeof tags)[number]>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const places = collection.filter((place) => tag === "All" || place.tag === tag);
  const [featured, ...routes] = fareDeals;

  function toggle(city: string) {
    setSaved((current) => (current.includes(city) ? current.filter((item) => item !== city) : [...current, city]));
  }

  return (
    <>
      <section id="routes" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-600 uppercase">Fares</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Popular routes</h2>
            <p className="mt-2 text-sm text-slate-500">Round trip, economy, departing 12 Nov.</p>
          </div>
          <Link href="/flights" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#17191e] hover:border-slate-400 sm:inline">
            All flights
          </Link>
        </div>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1.35fr_.85fr]">
          <Link href={fareHref(featured.from, featured.fromCode, featured.to, featured.toCode)} className="group relative min-h-[420px] overflow-hidden rounded-3xl">
            <Image src={featured.image} alt={`${featured.to} skyline`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
            <div className="absolute top-5 left-5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-md">Most booked</div>
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-6 text-white sm:p-8">
              <div>
                <p className="text-sm text-white/70">{featured.fromCode} → {featured.toCode}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{featured.from} to {featured.to}</p>
              </div>
              <p className="rounded-2xl bg-white px-4 py-3 text-right text-[#17191e]">
                <span className="block text-[10px] font-bold tracking-[0.14em] text-slate-500 uppercase">From</span>
                <span className="text-lg font-semibold">{inr(featured.price)}</span>
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-3">
            {routes.map((deal) => (
              <Link key={`${deal.fromCode}${deal.toCode}`} href={fareHref(deal.from, deal.fromCode, deal.to, deal.toCode)} className="group flex flex-1 items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative h-[4.5rem] w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={deal.image} alt="" fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight">{deal.from} to {deal.to}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{deal.fromCode} → {deal.toCode} · Economy</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">From</p>
                  <p className="text-sm font-semibold">{inr(deal.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="destinations" className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-600 uppercase">Stays</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Places to stay</h2>
            <p className="mt-2 text-sm text-slate-500">Nightly rates for 12–16 Nov, two guests.</p>
          </div>
          <div className="flex gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200" role="tablist" aria-label="Place type">
            {tags.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tag === item}
                onClick={() => setTag(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${tag === item ? "bg-[#17191e] text-white" : "text-slate-500 hover:text-slate-800"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place, index) => {
            const active = saved.includes(place.city);
            const lead = tag === "All" && index === 0;
            return (
              <article key={place.city} className={`group relative overflow-hidden rounded-3xl ${lead ? "min-h-[460px] sm:col-span-2 lg:row-span-2 lg:min-h-[560px]" : "min-h-[280px]"}`}>
                <Image src={place.image} alt={`${place.city}, ${place.country}`} fill sizes={lead ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"} className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />
                <Link href={`/hotels?city=${encodeURIComponent(place.city)}&checkIn=2026-11-12&checkOut=2026-11-16&guests=2`} className="absolute inset-0 z-10" aria-label={`Stays in ${place.city} from ${inr(place.price)}`}>
                  <span className="sr-only">{place.city}</span>
                </Link>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={active ? `Remove ${place.city}` : `Save ${place.city}`}
                  onClick={() => toggle(place.city)}
                  className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur ${active ? "bg-white text-rose-600" : "bg-black/30 text-white"}`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
                  </svg>
                </button>
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-5 text-white">
                  <p className="text-xs text-white/70">{place.country}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight">{place.city}</h3>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-white/80">{place.note}</p>
                    <p className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur-md">From {inr(place.price)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
