"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/home/home-flight.jpg",
    label: "Flights",
    eyebrow: "Live fares",
    title: "Book the flight while the fare is still live.",
    line: "Search live fares and book the flight in real time.",
  },
  {
    src: "/images/home/home-train.jpg",
    label: "Trains",
    eyebrow: "Live seats",
    title: "Book the train while the seat is still open.",
    line: "See live seats and book the train in real time.",
  },
  {
    src: "/images/home/home-bus.jpg",
    label: "Buses",
    eyebrow: "Live coaches",
    title: "Book the bus while the coach is still open.",
    line: "Check live coaches and book the bus in real time.",
  },
  {
    src: "/images/home/home-hotel.jpg",
    label: "Hotels",
    eyebrow: "Live rooms",
    title: "Book the stay while the room is still open.",
    line: "See live rooms and book the stay in real time.",
  },
];

const loop = [...slides, slides[0]];

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const active = index % slides.length;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => (current >= slides.length ? current : current + 1));
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, index]);

  useEffect(() => {
    if (index < slides.length) return;
    const timer = window.setTimeout(() => {
      setAnimate(false);
      setIndex(0);
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [index]);

  function goTo(next: number) {
    setAnimate(true);
    setIndex(next);
  }

  return (
    <section
      className="relative overflow-hidden bg-[#07101f] text-white"
      aria-roledescription="carousel"
      aria-label="Real-time booking"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only" aria-live="polite">
        {slides[active].title} {slides[active].line}
      </p>
      <div className="overflow-hidden">
        <div
          className="hero-track flex"
          style={{ transform: `translateX(-${index * 100}%)`, transition: animate ? undefined : "none" }}
        >
          {loop.map((slide, slideIndex) => {
            const current = slideIndex === index;
            const Title = slideIndex === 0 ? "h1" : "p";
            return (
              <article
                key={`${slide.label}-${slideIndex}`}
                className="relative min-h-[26rem] w-full shrink-0 sm:min-h-[30rem]"
                aria-hidden={current ? undefined : true}
                {...(current ? {} : { inert: true })}
              >
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  priority={slideIndex === 0}
                  loading={slideIndex === 0 ? undefined : "eager"}
                  sizes="100vw"
                  className={`hero-photo object-cover ${current ? "is-live" : ""}`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.92)_0%,rgba(13,47,134,0.78)_46%,rgba(13,47,134,0.28)_100%)]" />
                <div className={`hero-copy relative mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-center px-4 py-12 sm:min-h-[30rem] sm:px-5 lg:px-8 ${current && animate ? "is-live" : ""}`}>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-blue-100 uppercase">{slide.eyebrow}</p>
                  <Title className="mt-3 max-w-3xl text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.045em] sm:text-6xl">
                    {slide.title}
                  </Title>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{slide.line}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link href="/#travel" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#12141a]">
                      See travel
                    </Link>
                    <Link href="/#banking" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white">
                      Banking
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="relative mx-auto -mt-8 max-w-7xl px-4 pb-10 sm:-mt-10 sm:px-5 sm:pb-12 lg:px-8">
        <div className="hero-shelf grid grid-cols-2 gap-3 sm:grid-cols-4">
          {slides.map((slide, slideIndex) => {
            const selected = slideIndex === active;
            return (
              <button
                key={slide.label}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Show ${slide.label}`}
                aria-pressed={selected}
                className={`hero-thumb overflow-hidden rounded-2xl bg-white text-center shadow-[0_16px_34px_rgba(7,16,31,0.22)] ring-1 ${selected ? "is-selected ring-2 ring-[#1d4ed8]" : "ring-white/70"}`}
              >
                <div className="relative h-20 sm:h-24">
                  <Image src={slide.src} alt="" fill priority sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
                </div>
                <div className="bg-white px-3 py-2.5">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-[#1d4ed8] uppercase">{slide.eyebrow}</p>
                  <p className="text-base font-semibold text-[#1d4ed8]">{slide.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
