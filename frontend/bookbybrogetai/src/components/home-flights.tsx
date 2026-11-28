"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FlightCard, FlightFilter, FlightList, FlightListHead, matchesQuery, useBookFlight } from "@/components/flight-card";
import { Icon } from "@/components/icons";
import { cityOf, searchFlights, type Flight, type SearchInput } from "@/lib/api";

const FIRST = 8;

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Live list of bookable flights on the home page, straight from the same search API. */
export function HomeFlights() {
  const book = useBookFlight();
  const [search] = useState<SearchInput>(() => ({ origin: "DEL", destination: "BOM", travelDate: tomorrow(), adults: 1, cabin: "0" }));
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);

  useEffect(() => {
    let live = true;
    searchFlights(search)
      .then((res) => live && setFlights([...res.flights].sort((a, b) => a.depart.localeCompare(b.depart))))
      .catch((e) => live && (setFlights([]), setError(e instanceof Error ? e.message : "Could not load flights.")));
    return () => {
      live = false;
    };
  }, [search]);

  const matched = useMemo(() => (flights ?? []).filter((f) => matchesQuery(f, query)), [flights, query]);
  const shown = all || query ? matched : matched.slice(0, FIRST);
  const dateLabel = new Date(search.travelDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
  const more = `/flights?from=${search.origin}&to=${search.destination}&date=${search.travelDate}&adults=1&cabin=0`;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.18em] text-brand">FLIGHTS AVAILABLE</p>
          <h2 className="mt-1 text-3xl font-extrabold">{cityOf(search.origin)} to {cityOf(search.destination)}</h2>
          <p className="mt-1 text-sm text-muted">{dateLabel} · {flights ? `${flights.length} flights` : "loading…"} · Need another route or date? Use the search above.</p>
        </div>
        <FlightFilter value={query} onChange={setQuery} />
      </div>

      {error ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {flights === null ? <FlightList>{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-[66px] animate-pulse rounded-xl border border-line bg-soft/60" />)}</FlightList> : null}
        {flights && matched.length === 0 && !error ? (
          <p className="rounded-2xl border border-line bg-white p-8 text-center text-muted">{query ? `No flights match "${query}".` : "No flights found for this date. Try the search above."}</p>
        ) : null}
        {shown.length ? (
          <FlightList>
            <FlightListHead />
            {shown.map((f, i) => <FlightCard key={f.id + i} flight={f} onBook={() => book(f, search)} />)}
          </FlightList>
        ) : null}
      </div>

      {flights && !query && matched.length > FIRST ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => setAll(!all)} className="btn-ghost px-5">{all ? "Show fewer" : `Show all ${matched.length} flights`}</button>
          <Link href={more} className="btn-ghost px-5">Sort & filter <Icon name="arrow" size={16} /></Link>
        </div>
      ) : null}
    </section>
  );
}
