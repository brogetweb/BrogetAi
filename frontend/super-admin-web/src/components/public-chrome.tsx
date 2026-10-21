"use client";

import { useState } from "react";

const site = "http://localhost:3001";

const links = [
  { href: "/flights", label: "Flights" },
  { href: "/hotels", label: "Hotels" },
  { href: "/cibil", label: "Credit score" },
  { href: "/sip", label: "SIP" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

function Brand() {
  return (
    <a href={site} className="inline-flex items-center gap-2.5" aria-label="BerogetAI home">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 shadow-lg shadow-indigo-900/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/90 text-sm font-extrabold text-white">B</span>
      </span>
      <span className="text-[22px] font-extrabold tracking-[-0.06em] text-[#12141a]">
        Beroget<span className="text-indigo-600">AI</span>
        <span className="ml-1 align-top text-[10px] font-bold tracking-normal text-slate-400">®</span>
      </span>
    </a>
  );
}

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
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
    title: "Book",
    links: [
      { href: "/flights", label: "Flights" },
      { href: "/hotels", label: "Hotels" },
      { href: "/cibil", label: "Credit score" },
      { href: "/sip", label: "SIP" },
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
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#1b2230] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href={site} className="inline-flex items-center gap-2.5" aria-label="BerogetAI home">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/90 text-sm font-extrabold text-white">B</span>
              </span>
              <span className="text-[22px] font-extrabold tracking-[-0.06em] text-white">
                Beroget<span className="text-indigo-200">AI</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">Fares and stays in one search. Hold a trip, then finish it when you are ready.</p>
            <a href={`${site}/contact`} className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17191e] hover:bg-indigo-50">
              Write to the trip desk
            </a>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-bold tracking-[0.16em] text-indigo-200 uppercase">{column.title}</h2>
              <div className="mt-4 flex flex-col items-start gap-1 text-sm">
                {column.links.map((link) => (
                  <a key={link.href} href={`${site}${link.href}`} className="rounded-lg px-2 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white">
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
          <span>© 2026 BerogetAI</span>
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
