"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowRight, IconChevronDown, IconDevices, IconLock, IconMenu, IconShield, IconX } from "@/components/icons";
import { Logo, LogoMark } from "@/components/ui";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6">
      <div
        className={`mx-auto max-w-6xl rounded-2xl border transition-all duration-300 ${
          scrolled || open
            ? "border-line bg-white/80 shadow-[0_8px_30px_-12px_rgba(10,16,32,0.18)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="flex h-14 items-center justify-between pl-4 pr-2 md:pl-5">
          <Logo />

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-ink/[0.04] hover:text-ink">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/login" className="btn btn-ghost hidden sm:inline-flex">
              Sign in
            </Link>
            <Link href="/login" className="btn btn-dark hidden sm:inline-flex">
              Open panel <IconArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-ink/5 md:hidden"
            >
              {open ? <IconX size={20} /> : <IconMenu size={20} />}
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-line px-3 pb-3 pt-2 md:hidden">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-soft">
                {link.label}
              </a>
            ))}
            <Link href="/login" className="btn btn-primary mt-2 w-full">
              Sign in to panel
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 bg-navy-900 text-white/60">
      {/* CTA card overlapping the top edge */}
      <div className="relative mx-auto max-w-6xl -translate-y-1/2 px-4 md:px-6">
        <div className="noise relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0047c2_0%,#0066ff_50%,#22a6f2_100%)] px-6 py-9 text-white shadow-[0_40px_80px_-30px_rgba(0,102,255,0.7)] md:px-10">
          <div className="bg-grid-dark mask-radial absolute inset-0 opacity-80" />
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="hidden rounded-2xl bg-white/15 p-2 ring-1 ring-white/25 sm:block">
                <LogoMark size={40} />
              </span>
              <div>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">Ready to open your desk?</h2>
                <p className="mt-1.5 text-sm text-white/80 md:text-base">Sign in with the same email and password as the agent mobile app.</p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link href="/login" className="btn btn-lg bg-white text-ink shadow-xl hover:bg-white/90">
                <IconLock size={16} /> Sign in to panel
              </Link>
              <Link href="/#faq" className="btn btn-lg bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/15">
                Read FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-8 overflow-hidden">
        <div className="bg-grid-dark mask-fade-b pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 pb-8 md:px-6">
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
              <Logo tone="light" />
              <p className="mt-5 max-w-sm text-sm leading-6">
                The professional workspace for Broget AI field agents. Customers, Broget Pay wallet and CIBIL reports in one place.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  [<IconShield key="s" size={13} />, "Consent-first"],
                  [<IconLock key="l" size={13} />, "Encrypted sessions"],
                  [<IconDevices key="d" size={13} />, "Web + mobile"],
                ].map(([icon, label]) => (
                  <span key={String(label)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                    {icon} {label}
                  </span>
                ))}
              </div>
            </div>
            <FooterCol title="Product" items={[["Features", "/#features"], ["How it works", "/#how"], ["Pricing", "/#pricing"]]} />
            <FooterCol title="Agents" items={[["Sign in", "/login"], ["Agent panel", "/app"], ["FAQ", "/#faq"]]} />
            <FooterCol title="Company" items={[["Home", "/"], ["Support", "/#faq"]]} />
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Broget AI. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <IconShield size={13} className="text-emerald-400" /> Credit reports are fetched only with the customer&apos;s explicit consent.
            </p>
            <a href="#top" className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-medium text-white/80 transition hover:bg-white/10 hover:text-white sm:self-auto">
              Back to top <IconChevronDown size={13} className="rotate-180" />
            </a>
          </div>

          {/* Oversized wordmark */}
          <p
            aria-hidden
            className="font-display pointer-events-none mt-10 select-none bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0))] bg-clip-text text-center text-[18vw] font-extrabold leading-[0.8] tracking-[-0.05em] text-transparent md:text-[11rem]"
          >
            Broget AI
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {items.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="group inline-flex items-center transition hover:text-white">
              <span className="mr-0 h-px w-0 bg-[#7cb2ff] transition-all duration-200 group-hover:mr-1.5 group-hover:w-3" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
