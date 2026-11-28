"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";

type Product = "flights" | "hotels" | "bus";

const tabs: { id: Product; label: string; soon?: boolean; icon: React.ReactNode }[] = [
  { id: "flights", label: "Flights", icon: <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /> },
  { id: "hotels", label: "Hotels", soon: true, icon: <path d="M3 21V7l9-4 9 4v14M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01M8 13h.01M16 13h.01" /> },
  { id: "bus", label: "Bus", soon: true, icon: <path d="M6 17h12M5 17V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v11M5 11h14M7 20v-3M17 20v-3M8 14h.01M16 14h.01" /> },
];

const soonCopy: Record<Exclude<Product, "flights">, { title: string; copy: string }> = {
  hotels: { title: "Hotels are coming soon", copy: "Book stays across India with the same profile you use for flights. We're adding hotel partners now." },
  bus: { title: "Bus tickets are coming soon", copy: "Intercity buses with live seat maps are on the way. Your traveller profile will work here too." },
};

/** Product switcher on the home hero: Flights live, Hotels and Bus coming soon. */
export function HomeSearch() {
  const [tab, setTab] = useState<Product>("flights");
  return (
    <div>
      <div role="tablist" aria-label="What do you want to book?" className="no-scrollbar flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-t-2xl px-3.5 py-3 text-sm font-bold transition sm:px-5 ${active ? "bg-white text-ink" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={t.id === "flights" ? "currentColor" : "none"} stroke={t.id === "flights" ? "none" : "currentColor"} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{t.icon}</svg>
              {t.label}
              {t.soon ? <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide sm:inline ${active ? "bg-sun/15 text-sun" : "bg-white/15 text-white"}`}>Soon</span> : null}
            </button>
          );
        })}
      </div>
      {tab === "flights" ? (
        <div className="[&>form]:rounded-tl-none">
          <SearchForm />
        </div>
      ) : (
        <div className="rounded-2xl rounded-tl-none bg-white px-6 py-10 text-center shadow-[0_14px_34px_-22px_rgba(11,22,48,.35)] sm:py-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sun/10 text-sun">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{tabs.find((t) => t.id === tab)?.icon}</svg>
          </span>
          <p className="mt-4 font-display text-2xl font-extrabold text-ink">{soonCopy[tab].title}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{soonCopy[tab].copy}</p>
          <button type="button" onClick={() => setTab("flights")} className="btn-primary mt-6 px-6">Search flights meanwhile</button>
        </div>
      )}
    </div>
  );
}
