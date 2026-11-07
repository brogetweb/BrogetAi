"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { allServices, liveServices, menuGroups } from "@/lib/menu";

const groupImages: Record<string, string> = {
  travel: "/images/home/home-flight.jpg",
  banking: "/images/home/home-cibil.jpg",
  payment: "/images/home/home-gateway.jpg",
  products: "/images/home/home-builder.jpg",
};

type Slide = {
  key: string;
  src: string;
  label: string;
  eyebrow: string;
  title: string;
  line: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
};

const slides: Slide[] = [
  {
    key: "all",
    src: "/images/home/home-hero.jpg",
    label: "All services",
    eyebrow: `${allServices.length} services · ${liveServices.length} live now`,
    title: "Travel, banking, payments, and more. One BrogetAI desk.",
    line: "Book the trip, check the credit score, collect and pay out money, and reach the services beside them from one place.",
    primary: { href: "/#services", label: "Explore services" },
    secondary: { href: "/#live", label: "See what's live" },
  },
  ...menuGroups.map((group): Slide => {
    const live = group.items.filter((item) => !item.soon);
    return {
      key: group.id,
      src: groupImages[group.id] ?? group.items[0].image,
      label: group.label,
      eyebrow: `${group.items.length} services${live.length ? ` · ${live.length} live` : " · opening soon"}`,
      title: group.headline,
      line: group.lede,
      primary: { href: `/#${group.id}`, label: `Explore ${group.label}` },
      secondary: live.length ? { href: live[0].href, label: `Open ${live[0].label}` } : { href: group.items[0].href, label: `See ${group.items[0].label}` },
    };
  }),
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
    }, 4500);
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
      aria-label="BrogetAI services"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="sr-only" aria-live="polite">
        {slides[active].title} {slides[active].line}
      </p>
      <div className="overflow-hidden">
        <div className="hero-track flex" style={{ transform: `translateX(-${index * 100}%)`, transition: animate ? undefined : "none" }}>
          {loop.map((slide, slideIndex) => {
            const current = slideIndex === index;
            const Title = slideIndex === 0 ? "h1" : "p";
            return (
              <article
                key={`${slide.key}-${slideIndex}`}
                className="relative min-h-[30rem] w-full shrink-0 sm:min-h-[34rem]"
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
                <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.94)_0%,rgba(13,47,134,0.8)_48%,rgba(13,47,134,0.3)_100%)]" />
                <div className={`hero-copy relative mx-auto flex min-h-[30rem] max-w-7xl flex-col justify-center px-4 pt-12 pb-20 sm:min-h-[34rem] sm:px-5 lg:px-8 ${current && animate ? "is-live" : ""}`}>
                  <p className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-blue-100 uppercase">{slide.eyebrow}</p>
                  <Title className="mt-4 max-w-3xl text-[2.15rem] leading-[1.05] font-semibold tracking-[-0.045em] sm:text-6xl">{slide.title}</Title>
                  <p className="mt-4 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{slide.line}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href={slide.primary.href} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#12141a] hover:bg-blue-50">
                      {slide.primary.label}
                    </Link>
                    <Link href={slide.secondary.href} className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                      {slide.secondary.label}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="relative mx-auto -mt-14 max-w-7xl px-4 pb-8 sm:-mt-12 sm:px-5 sm:pb-12 lg:px-8">
        <div className="hero-shelf grid grid-cols-2 gap-3 sm:grid-cols-5">
          {slides.map((slide, slideIndex) => {
            const selected = slideIndex === active;
            return (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Show ${slide.label}`}
                aria-pressed={selected}
                className={`hero-thumb overflow-hidden rounded-2xl bg-white text-center shadow-[0_16px_34px_rgba(7,16,31,0.22)] ring-1 ${slideIndex === 0 ? "col-span-2 sm:col-span-1" : ""} ${selected ? "is-selected ring-2 ring-[#1d4ed8]" : "ring-white/70"}`}
              >
                <div className="relative hidden h-20 sm:block">
                  <Image src={slide.src} alt="" fill priority sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" />
                </div>
                <div className="bg-white px-3 py-2.5">
                  <p className="text-base font-semibold text-[#1d4ed8]">{slide.label}</p>
                  <p className="text-[10px] font-bold tracking-[0.12em] text-slate-500 uppercase">{slide.eyebrow}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
