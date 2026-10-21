"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Brand } from "./brand";
import { useAuth } from "./auth-drawer";

const links = [
  { href: "/flights", label: "Flights" },
  { href: "/hotels", label: "Hotels" },
  { href: "/cibil", label: "Credit score" },
  { href: "/sip", label: "SIP" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

const pageName: Record<string, string> = {
  "/": "Home",
  "/flights": "Flights",
  "/hotels": "Hotels",
  "/cibil": "Credit score",
  "/sip": "SIP",
  "/about": "About us",
  "/contact": "Contact us",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const { openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [moving, setMoving] = useState(false);
  const [notice, setNotice] = useState("");
  const lastPath = useRef(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setNotice(pageName[pathname] ?? "Page");
    setMoving(true);
    const hide = window.setTimeout(() => setMoving(false), 560);
    return () => window.clearTimeout(hide);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.getAttribute("target") === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setMoving(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = !overlay || scrolled || open;
  const tone = solid ? "dark" : "light";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${solid ? "border-b border-slate-200 bg-white/95 backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden" aria-hidden="true">
        {moving ? <div className="route-bar h-full bg-indigo-500" /> : null}
      </div>
      <p className="sr-only" aria-live="polite">{notice ? `Now on ${notice}` : ""}</p>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Brand tone={tone} />
        <nav aria-label="Main navigation" className="hidden items-center gap-1 text-sm font-semibold lg:flex">
          {links.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={`rounded-full px-3 py-2 transition ${
                  current
                    ? solid
                      ? "bg-slate-100 text-slate-900"
                      : "bg-white/15 text-white"
                    : solid
                      ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setOpen(false); openAuth("login"); }} className={`hidden rounded-full px-3.5 py-2 text-sm font-semibold sm:inline-flex ${solid ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}>
            Log in
          </button>
          <Link href="/flights" className="hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 sm:inline-flex">
            Search flights
          </Link>
          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${solid ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-slate-200 bg-white px-5 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => {
              const current = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-3 text-base font-semibold ${current ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setOpen(false); openAuth("login"); }} className="rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-semibold text-slate-800">
                Log in
              </button>
              <Link href="/flights" onClick={() => setOpen(false)} className="rounded-xl bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white">
                Search flights
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
