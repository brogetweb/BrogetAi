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

export function HomeBrowse({ part = "all" }: { part?: "routes" | "stays" | "all" }) {
  const [tag, setTag] = useState<(typeof tags)[number]>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const places = collection.filter((place) => tag === "All" || place.tag === tag);
  const [featured, ...routes] = fareDeals;

  function toggle(city: string) {
    setSaved((current) => (current.includes(city) ? current.filter((item) => item !== city) : [...current, city]));
  }

  return (
    <>
      {part === "stays" ? null : <section id="routes" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#1d4ed8] uppercase">Fares</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">Popular routes</h2>
          <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">Round trip, economy, departing 12 Nov.</p>
          <Link href="/flights" className="mt-4 inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#1d4ed8] hover:border-[#1d4ed8]">
            All flights
          </Link>
        </div>

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-[1.35fr_.85fr]">
          <Link href={fareHref(featured.from, featured.fromCode, featured.to, featured.toCode)} className="group relative min-h-[420px] overflow-hidden rounded-3xl">
            <Image src={featured.image} alt={`${featured.to} skyline`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            <div className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold tracking-wide text-[#1d4ed8]">Most booked</div>
            <div className="absolute inset-x-0 bottom-0 bg-white p-6 text-center sm:p-8">
              <p className="text-sm text-[#1d4ed8]">{featured.fromCode} → {featured.toCode}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight text-[#1d4ed8] sm:text-4xl">{featured.from} to {featured.to}</p>
              <p className="mx-auto mt-3 w-fit rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-semibold text-[#1d4ed8]">From {inr(featured.price)}</p>
            </div>
          </Link>

          <div className="flex flex-col gap-3">
            {routes.map((deal) => (
              <Link key={`${deal.fromCode}${deal.toCode}`} href={fareHref(deal.from, deal.fromCode, deal.to, deal.toCode)} className="group flex flex-1 flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center shadow-[0_12px_28px_rgba(18,24,38,0.08)] ring-1 ring-slate-200 transition hover:-translate-y-0.5">
                <div className="relative h-24 w-full overflow-hidden rounded-xl">
                  <Image src={deal.image} alt="" fill sizes="240px" className="object-cover" />
                </div>
                <p className="font-semibold tracking-tight text-[#1d4ed8]">{deal.from} to {deal.to}</p>
                <p className="text-sm text-[#1d4ed8]">{deal.fromCode} → {deal.toCode} · From {inr(deal.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>}

      {part === "routes" ? null : <section id="destinations" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-bold tracking-[0.18em] text-[#1d4ed8] uppercase">Stays</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">Places to stay</h2>
          <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">Nightly rates for 12–16 Nov, two guests.</p>
          <div className="mx-auto mt-4 flex w-fit gap-1 rounded-full bg-white p-1 ring-1 ring-slate-200" role="tablist" aria-label="Place type">
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
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/95 to-transparent" />
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
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-center">
                  <p className="text-xs text-[#1d4ed8]">{place.country}</p>
                  <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#1d4ed8]">{place.city}</h3>
                  <p className="mt-1 text-sm text-[#1d4ed8]">{place.note}</p>
                  <p className="mx-auto mt-2 w-fit rounded-full bg-[#f4f7fb] px-3 py-1 text-sm font-semibold text-[#1d4ed8]">From {inr(place.price)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>}
    </>
  );
}
