"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { placeLabel, places } from "@/lib/catalog";

type Mode = "flights" | "hotels";

export type SearchValues = {
  mode?: Mode;
  from?: string;
  to?: string;
  depart?: string;
  ret?: string;
  adults?: string;
  children?: string;
  cabin?: string;
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  travellers?: string;
};

const cabins = ["Economy", "Premium economy", "Business"];

export function SearchPanel(initial: SearchValues = {}) {
  const router = useRouter();
  const box = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<Mode>(initial.mode ?? "flights");
  const [trip, setTrip] = useState<"round" | "one">(initial.ret === "" ? "one" : "round");
  const [from, setFrom] = useState(initial.from || "Delhi (DEL)");
  const [to, setTo] = useState(initial.to || "Dubai (DXB)");
  const [depart, setDepart] = useState(initial.depart || "2026-11-12");
  const [ret, setRet] = useState(initial.ret || "2026-11-18");
  const [adults, setAdults] = useState(Number(initial.adults || initial.travellers || 1));
  const [children, setChildren] = useState(Number(initial.children || 0));
  const [cabin, setCabin] = useState(initial.cabin || "Economy");
  const [city, setCity] = useState(initial.city || "Dubai");
  const [checkIn, setCheckIn] = useState(initial.checkIn || "2026-11-12");
  const [checkOut, setCheckOut] = useState(initial.checkOut || "2026-11-16");
  const [guests, setGuests] = useState(Number(initial.guests || 2));
  const [open, setOpen] = useState<"from" | "to" | "city" | "party" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!box.current?.contains(event.target as Node)) setOpen(null);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function go(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "flights") {
      if (!from.trim() || !to.trim()) {
        setError("Choose where you leave from and where you land.");
        return;
      }
      if (trip === "round" && ret < depart) {
        setError("Return date has to be on or after departure.");
        return;
      }
      const params = new URLSearchParams({
        from: from.trim(),
        to: to.trim(),
        depart,
        adults: String(adults),
        children: String(children),
        cabin,
      });
      if (trip === "round") params.set("return", ret);
      setBusy(true);
      router.push(`/flights?${params.toString()}`);
      window.setTimeout(() => setBusy(false), 900);
      return;
    }
    if (!city.trim()) {
      setError("Choose a city for the stay.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out has to be after check-in.");
      return;
    }
    const params = new URLSearchParams({
      city: city.trim(),
      checkIn,
      checkOut,
      guests: String(guests),
    });
    setBusy(true);
    router.push(`/hotels?${params.toString()}`);
    window.setTimeout(() => setBusy(false), 900);
  }

  const partyLabel = `${adults} adult${adults > 1 ? "s" : ""}${children ? `, ${children} child${children > 1 ? "ren" : ""}` : ""} · ${cabin}`;

  return (
    <form ref={box} onSubmit={go} className="rounded-[1.6rem] bg-white p-3 shadow-[0_22px_50px_-28px_rgba(15,23,42,0.45)] ring-1 ring-slate-200/90 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
        <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold" role="tablist" aria-label="What are you booking">
          {(["flights", "hotels"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={mode === item}
              onClick={() => { setMode(item); setError(""); setOpen(null); }}
              className={`rounded-full px-4 py-2 capitalize transition ${mode === item ? "bg-[#12141a] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {mode === "flights" ? (
          <div className="flex rounded-full bg-slate-100 p-1 text-sm font-semibold" role="group" aria-label="Trip type">
            <button type="button" className={`rounded-full px-3 py-1.5 ${trip === "round" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`} onClick={() => setTrip("round")}>Round trip</button>
            <button type="button" className={`rounded-full px-3 py-1.5 ${trip === "one" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`} onClick={() => setTrip("one")}>One way</button>
          </div>
        ) : <p className="text-sm font-medium text-slate-500">Nightly rate, before taxes</p>}
      </div>

      {mode === "flights" ? (
        <div className="grid items-stretch gap-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,.85fr)_minmax(0,.85fr)_minmax(0,1.15fr)_auto]">
          <div className="relative">
            <CityField label="From" value={from} active={open === "from"} onFocus={() => setOpen("from")} onChange={setFrom} onPick={(value) => { setFrom(value); setOpen(null); }} />
            <button
              type="button"
              aria-label="Swap cities"
              onClick={() => { setFrom(to); setTo(from); }}
              className="absolute top-1/2 -right-5 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-700 lg:flex"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 7h11M15 4l3 3-3 3M17 17H6M9 14l-3 3 3 3" />
              </svg>
            </button>
          </div>
          <CityField label="To" value={to} active={open === "to"} onFocus={() => setOpen("to")} onChange={setTo} onPick={(value) => { setTo(value); setOpen(null); }} />
          <DateField label="Depart" value={depart} onChange={setDepart} />
          {trip === "round" ? <DateField label="Return" value={ret} onChange={setRet} /> : (
            <div className="field">
              <span className="field-label">Return</span>
              <span className="mt-0.5 text-sm font-semibold text-slate-400">One way</span>
            </div>
          )}
          <div className="relative">
            <button type="button" onClick={() => setOpen(open === "party" ? null : "party")} className="field h-full w-full text-left">
              <span className="field-label">Travellers</span>
              <span className="mt-0.5 block truncate text-sm font-semibold text-slate-900">{partyLabel}</span>
            </button>
            {open === "party" ? (
              <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <Stepper label="Adults" hint="Age 12+" value={adults} min={1} max={8} onChange={setAdults} />
                <Stepper label="Children" hint="Age 2–11" value={children} min={0} max={6} onChange={setChildren} />
                <label className="mt-3 block text-xs font-bold tracking-wide text-slate-400 uppercase" htmlFor="cabin">Cabin</label>
                <select id="cabin" value={cabin} onChange={(event) => setCabin(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                  {cabins.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button type="button" onClick={() => setOpen(null)} className="mt-3 w-full rounded-xl bg-[#12141a] py-2.5 text-sm font-bold text-white">Done</button>
              </div>
            ) : null}
          </div>
          <button type="submit" className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-indigo-600 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-70" disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      ) : (
        <div className="grid items-stretch gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,.9fr)_minmax(0,.9fr)_minmax(0,.8fr)_auto]">
          <CityField label="City" value={city} active={open === "city"} onFocus={() => setOpen("city")} onChange={setCity} onPick={(value) => { setCity(value.replace(/\s*\([^)]+\)/, "")); setOpen(null); }} plain />
          <DateField label="Check-in" value={checkIn} onChange={setCheckIn} />
          <DateField label="Check-out" value={checkOut} onChange={setCheckOut} />
          <div className="relative">
            <button type="button" onClick={() => setOpen(open === "party" ? null : "party")} className="field h-full w-full text-left">
              <span className="field-label">Guests</span>
              <span className="mt-0.5 block text-sm font-semibold text-slate-900">{guests} guest{guests > 1 ? "s" : ""}</span>
            </button>
            {open === "party" ? (
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                <Stepper label="Guests" hint="In one room" value={guests} min={1} max={8} onChange={setGuests} />
                <button type="button" onClick={() => setOpen(null)} className="mt-3 w-full rounded-xl bg-[#12141a] py-2.5 text-sm font-bold text-white">Done</button>
              </div>
            ) : null}
          </div>
          <button type="submit" className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-indigo-600 px-7 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-70" disabled={busy}>
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      )}

      {mode === "flights" ? (
        <div className="mt-2 flex justify-end px-1 lg:hidden">
          <button type="button" onClick={() => { setFrom(to); setTo(from); }} className="text-xs font-bold text-indigo-700">Swap cities</button>
        </div>
      ) : null}
      {error ? <p role="alert" className="px-1 pt-2 text-sm font-semibold text-rose-600">{error}</p> : null}
    </form>
  );
}

function CityField({
  label,
  value,
  onChange,
  onPick,
  onFocus,
  active,
  plain = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (value: string) => void;
  onFocus: () => void;
  active: boolean;
  plain?: boolean;
}) {
  const id = useId();
  const query = value.toLowerCase();
  const matches = places.filter((place) => `${place.city} ${place.code} ${place.airport}`.toLowerCase().includes(query)).slice(0, 6);

  return (
    <div className="relative">
      <label className="field" htmlFor={id}>
        <span className="field-label">{label}</span>
        <input id={id} value={value} onFocus={onFocus} onChange={(event) => { onChange(event.target.value); onFocus(); }} className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none" autoComplete="off" />
      </label>
      {active && matches.length > 0 ? (
        <ul className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-2xl" role="listbox">
          {matches.map((place) => (
            <li key={place.code}>
              <button type="button" className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-indigo-50" onClick={() => onPick(plain ? place.city : placeLabel(place.city, place.code))}>
                <span>
                  <span className="block text-sm font-bold">{place.city}</span>
                  <span className="block text-xs text-slate-500">{place.airport}</span>
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">{place.code}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-0.5 w-full bg-transparent text-sm font-semibold outline-none" />
    </label>
  );
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span>
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-xs text-slate-400">{hint}</span>
      </span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-8 w-8 rounded-full border border-slate-200 font-bold disabled:opacity-30">–</button>
        <span className="w-4 text-center text-sm font-bold">{value}</span>
        <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-full border border-slate-200 font-bold disabled:opacity-30">+</button>
      </span>
    </div>
  );
}
