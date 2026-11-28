"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthDrawer, openAuth } from "@/components/auth-drawer";
import { session, type Traveller } from "@/lib/api";
import { Icon, type IconName } from "@/components/icons";

export function useTraveller() {
  const [user, setUser] = useState<Traveller | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      setUser(session.token() ? session.user() : null);
      setReady(true);
    };
    sync();
    window.addEventListener("bbb-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("bbb-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return { user, ready };
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] text-white shadow-[0_8px_18px_-8px_rgba(29,91,255,.8)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>
      </span>
      <span className={`font-display text-base font-extrabold leading-none sm:text-lg ${light ? "text-white" : "text-ink"}`}>
        Book<span className="text-brand">by</span>Broget<span className={light ? "text-white/60" : "text-subtle"}> AI</span>
      </span>
    </Link>
  );
}

export function Header() {
  const { user } = useTraveller();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links: [string, string, IconName, boolean][] = [
    ["/", "Flights", "plane", false],
    ["/hotels", "Hotels", "hotel", true],
    ["/bus", "Bus", "bus", true],
    ["/trips", "My trips", "suitcase", false],
  ];
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/flights") || path.startsWith("/book") : path.startsWith(href));
  const navItems = links.map(([href, label, icon, soon]) => (
    <Link
      key={href}
      href={href}
      aria-current={active(href) ? "page" : undefined}
      className={`relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${active(href) ? "text-brand" : "text-muted hover:bg-soft hover:text-ink"}`}
    >
      <Icon name={icon} size={17} />
      {label}
      {soon ? <span className="rounded-full bg-sun/12 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-sun">Soon</span> : null}
      {active(href) ? <span aria-hidden className="absolute -bottom-[15px] left-3 right-3 h-[3px] rounded-full bg-brand" /> : null}
    </Link>
  ));
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[64px] max-w-6xl items-center gap-3 px-4 sm:h-[68px] sm:gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">{navItems}</nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-line bg-white py-1 pl-1 pr-3 text-sm font-semibold hover:bg-soft">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] text-xs font-bold text-white">{(user.name || user.email || "U").slice(0, 1).toUpperCase()}</span>
                <span className="hidden max-w-[120px] truncate sm:block">{(user.name || user.email || "").split(" ")[0]}</span>
              </button>
              {open ? (
                <>
                  <button type="button" aria-label="Close menu" className="fixed inset-0 cursor-default" onClick={() => setOpen(false)} />
                  <div className="card absolute right-0 z-10 mt-2 w-56 p-2">
                    <p className="truncate px-3 pb-2 pt-1 text-xs text-subtle">{user.email}</p>
                    <Link href="/profile" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-soft">My profile</Link>
                    <Link href="/trips" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-soft">My trips</Link>
                    <button type="button" onClick={() => { session.clear(); setOpen(false); router.push("/"); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50">Log out</button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <>
              <button type="button" onClick={() => openAuth("login")} className="btn-ghost hidden sm:inline-flex">Log in</button>
              <button type="button" onClick={() => openAuth("register")} className="btn-primary px-3 text-xs sm:px-4 sm:text-sm">Create profile</button>
            </>
          )}
        </div>
      </div>
      <AuthDrawer />
      <nav aria-label="Main mobile" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line/70 px-3 pb-2 pt-1 md:hidden [&>a>span:last-child]:hidden">{navItems}</nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-6">Search flights for free. Create your profile once, then book in a few taps and keep every trip in one place.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Book</p>
          <Link href="/" className="block hover:text-white">Search flights</Link>
          <Link href="/hotels" className="block hover:text-white">Hotels (soon)</Link>
          <Link href="/bus" className="block hover:text-white">Bus (soon)</Link>
          <Link href="/trips" className="block hover:text-white">My trips</Link>
          <Link href="/profile" className="block hover:text-white">My profile</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-white">Company</p>
          <a href="https://www.brogetai.com" className="block hover:text-white">Broget AI</a>
          <a href="https://www.brogetai.com/terms" className="block hover:text-white">Terms</a>
          <a href="https://www.brogetai.com/privacy" className="block hover:text-white">Privacy</a>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Broget AI Private Limited</p>
    </footer>
  );
}

/** Sends signed-out users to log in, then back here. */
export function useRequireAuth() {
  const { user, ready } = useTraveller();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [ready, user, router, path]);
  return { user, ready };
}
