"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { menuGroups } from "@/lib/menu";

const shots = menuGroups.flatMap((group) =>
  group.items.map((item) => ({ label: item.label, image: item.image, desk: group.label })),
);

const parts = [
  ["Travel", "Book flights, trains, buses, and hotels in real time."],
  ["Banking", "CIBIL, a monthly SIP, and fixed or recurring deposits."],
  ["Payment", "Collect with a gateway or a payment link. Pay out to banks, wallets, UPI, and cards."],
  ["Our Services", "Education, health care, agriculture, and builder ships."],
];

export function HomeAbout() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const shot = shots[index];

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % shots.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8" aria-label="About us">
      <div className="grid items-stretch gap-8 border-t border-slate-300 pt-10 lg:grid-cols-2 lg:gap-14">
        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="relative min-h-[20rem] overflow-hidden lg:min-h-[32rem]">
            <Image key={shot.image} src={shot.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="about-photo object-cover object-center" />
          </div>
          <p className="mt-3 text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase" aria-live="polite">
            {String(index + 1).padStart(2, "0")} · {shot.desk} · {shot.label}
          </p>
        </div>
        <div className="flex min-w-0 flex-col justify-center py-1">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">About us</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">One desk for the trip, the money, and the work beside them.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#1d4ed8]">Book a flight, train, bus, or hotel in real time. Check a CIBIL report, start a SIP, or open a deposit. Collect a payment, then pay it out.</p>
          <ul className="mt-6 border-t border-slate-300">
            {parts.map(([title, text], index) => (
              <li key={title} className={`grid gap-1 border-b border-slate-200 py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 ${title === shot.desk ? "border-l-2 border-l-[#1d4ed8] pl-3" : ""}`}>
                <p className="text-sm font-semibold text-[#163a9a]">{String(index + 1).padStart(2, "0")} · {title}</p>
                <p className="text-sm leading-6 text-[#1d4ed8]">{text}</p>
              </li>
            ))}
          </ul>
          {open ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-[#1d4ed8]">Most desks on this site are still coming soon. Payment Gateway and Builder Ships are open now.</p>
              <Link href="/about" className="mt-3 inline-block text-sm font-semibold text-[#1d4ed8] underline decoration-[#1d4ed8]/40 underline-offset-4 hover:decoration-[#1d4ed8]">
                Full about page
              </Link>
            </div>
          ) : null}
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="mt-4 text-sm font-semibold text-[#163a9a] underline decoration-[#163a9a]/30 underline-offset-4 hover:decoration-[#163a9a]"
          >
            {open ? "Show less" : "Learn more"}
          </button>
        </div>
      </div>
    </section>
  );
}
