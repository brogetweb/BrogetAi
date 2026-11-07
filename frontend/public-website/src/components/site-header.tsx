"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { menuGroups, pageLabel, plainLinks, type MenuGroup } from "@/lib/menu";
import { Brand } from "./brand";
import { ServiceIcon } from "./service-icon";

function HomeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5 M5 9v11h5v-6h4v6h5V9" />
    </svg>
  );
}

function StatusPill({ soon }: { soon?: boolean }) {
  return soon ? (
    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Soon</span>
  ) : (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      Live
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
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
    setMenu(null);
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setNotice(pageLabel(pathname));
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
    if (!open && !menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, menu]);

  const home = pathname === "/";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled || open ? "border-slate-200/80 bg-white/85 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl" : "border-slate-200/60 bg-white"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden="true">
        {moving ? <div className="route-bar h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" /> : null}
      </div>
      <p className="sr-only" aria-live="polite">{notice ? `Now on ${notice}` : ""}</p>
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-6 xl:gap-8">
          <Brand />

          <nav aria-label="Main navigation" className="hidden flex-1 items-center justify-between gap-0.5 pr-4 text-sm font-medium xl:flex 2xl:pr-8" onMouseLeave={() => setMenu(null)}>
          <Link
            href="/"
            aria-current={home ? "page" : undefined}
            onMouseEnter={() => setMenu(null)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 xl:px-3 ${home ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
          >
            <HomeIcon className="h-4 w-4" />
            Home
          </Link>
          {menuGroups.map((group) => (
            <DesktopGroup
              key={group.id}
              group={group}
              open={menu === group.id}
              pathname={pathname}
              onOpen={() => setMenu(group.id)}
              onToggle={() => setMenu((current) => (current === group.id ? null : group.id))}
              onClose={() => setMenu(null)}
            />
          ))}
          {plainLinks.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                onMouseEnter={() => setMenu(null)}
                className={`rounded-lg px-2.5 py-2 xl:px-3 ${current ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                {link.label}
              </Link>
            );
          })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/contact"
            className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-b from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-blue-500 hover:to-blue-600 sm:inline-flex"
          >
            Get started
            <ServiceIcon name="arrow" className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-900 hover:bg-slate-50 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-slate-200 bg-white xl:hidden">
          <div className="mx-auto flex max-h-[calc(100dvh-4.5rem)] max-w-7xl flex-col gap-2 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                <HomeIcon />
                Home
              </Link>
              <Link href="/contact" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                Get started
                <ServiceIcon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
            {menuGroups.map((group) => {
              const expanded = mobileGroup === group.id;
              return (
                <div key={group.id} className="rounded-xl border border-slate-200">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setMobileGroup(expanded ? null : group.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-base font-semibold text-slate-900"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                      <ServiceIcon name={group.id} className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{group.label}</span>
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {expanded ? (
                    <div className="grid gap-1 border-t border-slate-100 p-2">
                      {group.items.map((item) => (
                        <Link key={item.slug} href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <ServiceIcon name={item.slug} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{item.label}</span>
                          <StatusPill soon={item.soon} />
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {plainLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function DesktopGroup({
  group,
  open,
  pathname,
  onOpen,
  onToggle,
  onClose,
}: {
  group: MenuGroup;
  open: boolean;
  pathname: string;
  onOpen: () => void;
  onToggle: () => void;
  onClose: () => void;
}) {
  const current = group.items.some((item) => pathname === item.href);
  return (
    <div className="relative" onMouseEnter={onOpen}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={onToggle}
        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-2 xl:px-3 ${current || open ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
      >
        {group.label}
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="menu-pop absolute top-full left-1/2 z-50 w-[25rem] -translate-x-1/2 pt-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.3)]">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                <ServiceIcon name={group.id} className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{group.label}</p>
                <p className="truncate text-xs text-slate-500">{group.headline}</p>
              </div>
            </div>
            <div className="p-2">
              {group.items.map((item) => (
                <Link key={item.slug} href={item.href} onClick={onClose} className="group flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white">
                    <ServiceIcon name={item.slug} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.label}</span>
                      <StatusPill soon={item.soon} />
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.text}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href={`/#${group.id}`} onClick={onClose} className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-semibold text-blue-600 hover:bg-slate-50">
              See all {group.label} services
              <ServiceIcon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
