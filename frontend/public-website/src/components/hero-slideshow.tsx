"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero-flights-full.jpg",
    label: "Flight booking",
    title: "Book the flight that fits.",
    line: "Search a route, compare nonstop and one-stop fares, and hold the price you want.",
    note: "The fare and the stay stay in one search.",
    points: ["Nonstop and one-stop", "Hold the fare", "Same desk as the room"],
    alt: "A full passenger airplane flying in a clear blue sky",
    focus: "object-[center_40%]",
    labelClass: "border-sky-200/40 bg-sky-200/15 text-sky-100",
  },
  {
    src: "/images/hero-cibil-score.jpg",
    label: "CIBIL score",
    title: "Check your CIBIL score.",
    line: "See the score clearly, so you know where you stand before the next step.",
    note: "Coming soon. No PAN and no credit report on this page yet.",
    points: ["Coming soon", "Consent first", "Beside the booking"],
    alt: "A phone on a marble desk showing a glowing credit score ring",
    focus: "object-[72%_center]",
    labelClass: "border-emerald-200/40 bg-emerald-200/15 text-emerald-100",
  },
  {
    src: "/images/hero-hotels.jpg",
    label: "Hotel booking",
    title: "Find a stay worth the trip.",
    line: "Choose the city and the dates, then reserve a room that matches the journey.",
    note: "Hold the room while you decide. Payment confirms it.",
    points: ["City and dates", "A room that fits", "Hold before you pay"],
    alt: "A hotel suite opening onto the sea at dusk",
    focus: "object-center",
    labelClass: "border-amber-200/40 bg-amber-200/15 text-amber-100",
  },
];

const loop = [...slides, slides[0]];

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => (current >= slides.length ? current : current + 1));
    }, 3000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index < slides.length) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <section className="relative h-[460px] overflow-hidden sm:h-[560px]" aria-roledescription="carousel" aria-label="Broget AI services">
      <div
        className="hero-track flex h-full"
        style={{ transform: `translateX(-${index * 100}%)`, transition: animate ? undefined : "none" }}
      >
        {loop.map((item, itemIndex) => (
          <article key={`${item.src}-${itemIndex}`} className="relative h-full w-full shrink-0" aria-hidden={itemIndex !== index}>
            <Image src={item.src} alt={itemIndex === index ? item.alt : ""} fill priority={itemIndex === 0} sizes="100vw" className={`object-cover ${item.focus}`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.72)_0%,rgba(8,16,32,0.34)_34%,transparent_62%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_top,rgba(8,16,32,0.35),transparent)]" />
            <div className="absolute inset-x-0 top-0">
              <div className="mx-auto max-w-7xl px-5 pt-7 sm:pt-9 lg:px-8">
                <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold tracking-[0.18em] uppercase ${item.labelClass}`}>{item.label}</p>
                {itemIndex === 0 ? (
                  <h1 className="mt-3 max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">{item.title}</h1>
                ) : (
                  <h2 className="mt-3 max-w-lg text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">{item.title}</h2>
                )}
                <p className="mt-3 max-w-md text-sm leading-6 text-white/90 sm:text-base">{item.line}</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/70">{item.note}</p>
                <ul className="mt-4 flex max-w-lg flex-wrap gap-2">
                  {item.points.map((point) => (
                    <li key={point} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
