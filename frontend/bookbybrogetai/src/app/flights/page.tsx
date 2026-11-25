"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { SearchForm } from "@/components/search-form";
import { cityOf, inr, picked, searchFlights, session, type Flight, type SearchInput } from "@/lib/api";

export default function FlightsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">Loading…</p>}>
      <Results />
    </Suspense>
  );
}

type Sort = "cheap" | "early" | "fast";

function inDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const search: SearchInput = useMemo(
    () => ({
      origin: params.get("from") || "DEL",
      destination: params.get("to") || "BOM",
      travelDate: params.get("date") || inDays(1),
      adults: Number(params.get("adults") || 1),
      cabin: params.get("cabin") || "0",
    }),
    [params],
  );
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<Sort>("cheap");
  const [nonstop, setNonstop] = useState(false);

  useEffect(() => {
    let live = true;
    searchFlights(search)
      .then((res) => live && (setFlights(res.flights), setError("")))
      .catch((e) => live && (setFlights([]), setError(e instanceof Error ? e.message : "Search failed.")));
    return () => {
      live = false;
    };
  }, [search]);

  const shown = useMemo(() => {
    const mins = (d: string) => {
      const hm = /^(\d{1,2}):(\d{2})$/.exec(d.trim());
      if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
      return Number(/(\d+)h/.exec(d)?.[1] ?? 0) * 60 + Number(/(\d+)m/.exec(d)?.[1] ?? 0);
    };
    const rows = (flights ?? []).filter((f) => !nonstop || f.stops === 0);
    return [...rows].sort((a, b) => (sort === "cheap" ? a.price - b.price : sort === "early" ? a.depart.localeCompare(b.depart) : mins(a.duration) - mins(b.duration)));
  }, [flights, sort, nonstop]);

  function book(flight: Flight) {
    picked.set({ flight, search });
    router.push(session.token() ? "/book" : "/login?next=/book&reason=book");
  }

  const dateLabel = new Date(search.travelDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SearchForm compact initial={{ from: search.origin, to: search.destination, date: search.travelDate, adults: search.adults, cabin: search.cabin }} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{cityOf(search.origin)} → {cityOf(search.destination)}</h1>
          <p className="text-sm text-muted">{dateLabel} · {search.adults} adult{search.adults > 1 ? "s" : ""} · {flights ? `${shown.length} flights` : "searching…"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="chip cursor-pointer select-none">
            <input type="checkbox" checked={nonstop} onChange={(e) => setNonstop(e.target.checked)} className="accent-brand" /> Non-stop only
          </label>
          <div className="inline-flex rounded-xl border border-line bg-white p-1">
            {([["cheap", "Cheapest"], ["early", "Earliest"], ["fast", "Fastest"]] as [Sort, string][]).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setSort(k)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${sort === k ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {!session.token() ? (
        <p className="mt-4 rounded-xl border border-brand/20 bg-[#eef4ff] px-4 py-3 text-sm text-brand-dark">
          You can browse all fares. <b>To book, you&apos;ll create a free profile</b> (takes 30 seconds).
        </p>
      ) : null}
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-5 space-y-3">
        {flights === null ? Array.from({ length: 4 }, (_, i) => <div key={i} className="card h-28 animate-pulse bg-soft" />) : null}
        {flights && shown.length === 0 && !error ? <p className="card p-10 text-center text-muted">No flights for this search. Try another date.</p> : null}
        {shown.map((f, i) => (
          <article key={f.id + i} className="card rise grid items-center gap-4 p-4 sm:p-5 md:grid-cols-[1.2fr_2fr_1fr]" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-soft font-display text-sm font-extrabold text-brand">{f.airlineCode || "✈"}</span>
              <div className="min-w-0">
                <p className="truncate font-bold">{f.airlineName}</p>
                <p className="text-xs text-subtle">{f.airlineCode}-{f.flightNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-display text-xl font-extrabold">{f.depart}</p>
                <p className="text-xs font-semibold text-subtle">{f.fromCode}</p>
              </div>
              <div className="flex-1 text-center">
                <p className="text-xs font-semibold text-muted">{f.duration}</p>
                <div className="relative my-1 h-px bg-line"><span className="absolute -top-1 right-0 h-2 w-2 rounded-full bg-brand" /></div>
                <p className={`text-xs font-semibold ${f.stops ? "text-sun" : "text-emerald-600"}`}>{f.stops ? `${f.stops} stop` : "Non-stop"}</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl font-extrabold">{f.arrive}</p>
                <p className="text-xs font-semibold text-subtle">{f.toCode}</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
              <div className="md:text-right">
                <p className="font-display text-2xl font-extrabold">{inr(f.price)}</p>
                <p className="text-[11px] text-subtle">per adult · {f.refundable ? "Refundable" : "Non-refundable"}</p>
              </div>
              <button type="button" onClick={() => book(f)} className="btn-primary px-5">Book</button>
            </div>
            {f.checkInBaggage || f.cabinBaggage ? (
              <p className="flex flex-wrap gap-2 md:col-span-3">
                {f.cabinBaggage ? <span className="chip">Cabin {f.cabinBaggage}</span> : null}
                {f.checkInBaggage ? <span className="chip">Check-in {f.checkInBaggage}</span> : null}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
