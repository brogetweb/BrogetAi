"use client";

import Image from "next/image";
import { useState } from "react";

const configuredSite = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "");
export const publicWebsiteUrl =
  configuredSite && !/localhost|127\.0\.0\.1/.test(configuredSite) ? configuredSite : "https://www.brogetai.com";
const site = publicWebsiteUrl;

const links = [
  { href: "/#travel", label: "Travel" },
  { href: "/#banking", label: "Banking" },
  { href: "/#payment", label: "Payment" },
  { href: "/#products", label: "Our Services" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

function Brand({ plate = false }: { plate?: boolean }) {
  return (
    <a href={site} className={`inline-flex shrink-0 items-center ${plate ? "rounded-2xl bg-white px-2.5 py-1.5" : ""}`} aria-label="BrogetAI home">
      <Image src="/brand/broget-logo.jpg" alt="BrogetAI" width={929} height={242} priority className="h-12 w-auto max-w-[min(16rem,52vw)] object-contain object-left" />
    </a>
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-[5.25rem] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="hidden items-center gap-1 text-sm font-semibold lg:flex">
          {links.map((link) => (
            <a key={link.href} href={`${site}${link.href}`} className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={`${site}/login`} className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex">
            Log in
          </a>
          <a href={`${site}/flights`} className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 sm:inline-flex">
            Search flights
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open ? (
        <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a key={link.href} href={`${site}${link.href}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

const columns = [
  {
    title: "Travel",
    links: [
      { href: "/services/flight-booking", label: "Flight Booking" },
      { href: "/services/train-booking", label: "Train Booking" },
      { href: "/services/bus-booking", label: "Bus Booking" },
      { href: "/services/hotel-booking", label: "Hotel Booking" },
    ],
  },
  {
    title: "Banking",
    links: [
      { href: "/cibil", label: "CIBIL" },
      { href: "/sip", label: "SIP" },
      { href: "/services/fd-rd", label: "FD & RD" },
    ],
  },
  {
    title: "Payment",
    links: [
      { href: "https://gateway.brogetpay.com/", label: "Payment Gateway" },
      { href: "/services/payment-link", label: "Payment Link" },
      { href: "/services/payout", label: "PayOut" },
    ],
  },
  {
    title: "Our Services",
    links: [
      { href: "/services/education", label: "Education Ecosystem" },
      { href: "/services/health-care", label: "Health Care" },
      { href: "/services/agriculture", label: "Agriculture" },
      { href: "https://www.builderbroget.com/", label: "Builder Ships" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative shrink-0 bg-[#1b2230] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="flex flex-col items-start gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Brand plate />
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Travel, banking, payments, and the services beside them. One BrogetAI desk.</p>
          </div>
          <a href={`${site}/contact`} className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17191e] hover:bg-indigo-50">
            Contact the desk
          </a>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h2 className="text-xs font-bold tracking-[0.16em] text-indigo-200 uppercase">{column.title}</h2>
              <div className="mt-3 flex flex-col items-start gap-1 text-sm">
                {column.links.map((link) => (
                  <a key={link.href} href={link.href.startsWith("http") ? link.href : `${site}${link.href}`} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="rounded-lg py-1.5 text-slate-200 hover:text-white">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Broget AI</span>
          <span>Questions about a hold go to the trip desk.</span>
          <span className="flex gap-4">
            <a href={`${site}/privacy`} className="hover:text-white">Privacy</a>
            <a href={`${site}/terms`} className="hover:text-white">Terms</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
