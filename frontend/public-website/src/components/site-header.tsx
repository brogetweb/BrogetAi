"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { menuGroups, pageLabel, plainLinks, type MenuGroup } from "@/lib/menu";
import { Brand } from "./brand";
import { useAuth } from "./auth-drawer";

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const pathname = usePathname();
  const { openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>("travel");
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
      <div className="mx-auto flex h-[5.25rem] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <Brand tone={tone} />
        <nav aria-label="Main navigation" className="hidden items-center gap-0.5 text-sm font-semibold lg:flex" onMouseLeave={() => setMenu(null)}>
          {menuGroups.map((group) => (
            <DesktopGroup key={group.id} group={group} open={menu === group.id} solid={solid} pathname={pathname} onOpen={() => setMenu(group.id)} onToggle={() => setMenu((current) => (current === group.id ? null : group.id))} onClose={() => setMenu(null)} />
          ))}
          {plainLinks.map((link) => {
            const current = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                onMouseEnter={() => setMenu(null)}
                className={`rounded-full px-2.5 py-2 transition xl:px-3 ${
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
          <button type="button" onClick={() => { setOpen(false); openAuth("login"); }} className={`hidden rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 sm:inline-flex`}>
            Log in
          </button>
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
          <div className="mx-auto flex max-h-[calc(100dvh-5.5rem)] max-w-7xl flex-col gap-1 overflow-y-auto">
            {menuGroups.map((group) => {
              const expanded = mobileGroup === group.id;
              return (
                <div key={group.id} className="rounded-2xl bg-slate-50">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setMobileGroup(expanded ? null : group.id)}
                    className="flex w-full items-center justify-between px-3 py-3 text-left text-base font-semibold text-slate-900"
                  >
                    {group.label}
                    <svg viewBox="0 0 24 24" className={`h-4 w-4 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {expanded ? (
                    <div className="grid gap-1 px-2 pb-2">
                      {group.items.map((item) => (
                        <Link key={item.href} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} onClick={() => setOpen(false)} className="rounded-xl bg-white px-3 py-3 ring-1 ring-slate-200">
                          <span className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-900">{item.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase ${item.soon ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.soon ? "Soon" : "Active"}</span>
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-slate-500">{item.text}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {plainLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50">
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={() => { setOpen(false); openAuth("login"); }} className="mt-3 rounded-xl bg-indigo-600 px-3 py-3 text-center text-sm font-semibold text-white">
              Log in
            </button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

function DesktopGroup({
  group,
  open,
  solid,
  pathname,
  onOpen,
  onToggle,
  onClose,
}: {
  group: MenuGroup;
  open: boolean;
  solid: boolean;
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
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-2 xl:px-3 ${
          current || open
            ? solid
              ? "bg-slate-100 text-slate-900"
              : "bg-white/15 text-white"
            : solid
              ? "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              : "text-white/85 hover:bg-white/10 hover:text-white"
        }`}
      >
        {group.label}
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 w-[22rem] pt-3">
          <div className="rounded-2xl bg-white p-2 text-slate-900 shadow-[0_18px_50px_rgba(18,24,43,0.16)] ring-1 ring-slate-200">
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} onClick={onClose} className="flex items-start justify-between gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                <span>
                  <span className="block font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 font-medium text-slate-500">{item.text}</span>
                </span>
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${item.soon ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.soon ? "Soon" : "Active"}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
