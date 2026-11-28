"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { FlightCard, FlightFilter, FlightList, FlightListHead, matchesQuery, useBookFlight } from "@/components/flight-card";
import { SearchForm } from "@/components/search-form";
import { cityOf, searchFlights, session, type Flight, type SearchInput } from "@/lib/api";

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
  const book = useBookFlight();
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
  const [query, setQuery] = useState("");

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
    const rows = (flights ?? []).filter((f) => (!nonstop || f.stops === 0) && matchesQuery(f, query));
    return [...rows].sort((a, b) => (sort === "cheap" ? a.price - b.price : sort === "early" ? a.depart.localeCompare(b.depart) : mins(a.duration) - mins(b.duration)));
  }, [flights, sort, nonstop, query]);

  const dateLabel = new Date(search.travelDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <SearchForm compact initial={{ from: search.origin, to: search.destination, date: search.travelDate, adults: search.adults, cabin: search.cabin }} />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{cityOf(search.origin)} → {cityOf(search.destination)}</h1>
          <p className="text-sm text-muted">{dateLabel} · {search.adults} adult{search.adults > 1 ? "s" : ""} · {flights ? `${shown.length} of ${flights.length} flights` : "searching…"}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
          <FlightFilter value={query} onChange={setQuery} />
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
        {flights === null ? <FlightList>{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-[66px] animate-pulse rounded-xl border border-line bg-soft/60" />)}</FlightList> : null}
        {flights && shown.length === 0 && !error ? (
          <p className="rounded-2xl border border-line bg-white p-10 text-center text-muted">{query ? `No flights match "${query}". Clear the search box to see all flights.` : "No flights for this search. Try another date."}</p>
        ) : null}
        {shown.length ? (
          <FlightList>
            <FlightListHead />
            {shown.map((f, i) => <FlightCard key={f.id + i} flight={f} onBook={() => book(f, search)} />)}
          </FlightList>
        ) : null}
      </div>
    </div>
  );
}
