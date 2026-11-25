"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { airports } from "@/lib/api";

const tomorrow = () => {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().slice(0, 10);
};

export function SearchForm({ initial, compact = false }: { initial?: { from?: string; to?: string; date?: string; adults?: number; cabin?: string }; compact?: boolean }) {
  const router = useRouter();
  const [from, setFrom] = useState(initial?.from || "DEL");
  const [to, setTo] = useState(initial?.to || "BOM");
  const [date, setDate] = useState(initial?.date || tomorrow());
  const [adults, setAdults] = useState(initial?.adults || 1);
  const [cabin, setCabin] = useState(initial?.cabin || "0");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (from === to) return setError("From and To can't be the same city.");
    setError("");
    router.push(`/flights?from=${from}&to=${to}&date=${date}&adults=${adults}&cabin=${cabin}`);
  }

  const select = "field appearance-none font-semibold";
  return (
    <form onSubmit={submit} className={`card ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      <div className={`grid gap-3 ${compact ? "md:grid-cols-[1fr_auto_1fr_1fr_0.8fr_0.9fr_auto]" : "md:grid-cols-[1fr_auto_1fr] lg:grid-cols-[1fr_auto_1fr_1fr_0.8fr_0.9fr_auto]"} items-end`}>
        <label className="label">From
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={select}>
            {airports.map(([code, city]) => <option key={code} value={code}>{city} ({code})</option>)}
          </select>
        </label>
        <button type="button" aria-label="Swap cities" onClick={() => { setFrom(to); setTo(from); }} className="mb-1 grid h-11 w-11 place-items-center self-end justify-self-center rounded-full border border-line bg-white text-brand transition hover:rotate-180 hover:bg-soft">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M7 7h13l-4-4M17 17H4l4 4" /></svg>
        </button>
        <label className="label">To
          <select value={to} onChange={(e) => setTo(e.target.value)} className={select}>
            {airports.map(([code, city]) => <option key={code} value={code}>{city} ({code})</option>)}
          </select>
        </label>
        <label className="label">Departure
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="field font-semibold" required />
        </label>
        <label className="label">Travellers
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={select}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} adult{n > 1 ? "s" : ""}</option>)}
          </select>
        </label>
        <label className="label">Class
          <select value={cabin} onChange={(e) => setCabin(e.target.value)} className={select}>
            <option value="0">Economy</option>
            <option value="3">Premium economy</option>
            <option value="1">Business</option>
            <option value="2">First</option>
          </select>
        </label>
        <button type="submit" className="btn-sun h-[50px] px-6 text-[15px]">Search flights</button>
      </div>
      {error ? <p className="mt-3 text-sm font-semibold text-red-600">{error}</p> : null}
    </form>
  );
}
