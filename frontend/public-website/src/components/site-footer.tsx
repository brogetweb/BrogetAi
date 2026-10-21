import Link from "next/link";
import { OpenAccount } from "./auth-drawer";
import { Brand } from "./brand";

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
      { href: "/login", label: "Log in", mode: "login" as const },
      { href: "/register", label: "Create account", mode: "register" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#1b2230] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent" />
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-40 w-40 rounded-full bg-amber-200/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Brand tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
              Fares and stays in one search. Hold a trip, then finish it when you are ready.
            </p>
            <Link href="/contact" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17191e] shadow-lg shadow-black/10 hover:bg-indigo-50">
              Write to the trip desk
            </Link>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-bold tracking-[0.16em] text-indigo-200 uppercase">{column.title}</h2>
              <div className="mt-4 flex flex-col items-start gap-1 text-sm">
                {column.links.map((link) =>
                  "mode" in link ? (
                    <OpenAccount key={link.label} mode={link.mode} className="rounded-lg px-2 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white">
                      {link.label}
                    </OpenAccount>
                  ) : (
                    <Link key={link.href} href={link.href} className="rounded-lg px-2 py-1.5 text-slate-200 hover:bg-white/10 hover:text-white">
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© {new Date().getFullYear()} BerogetAI</span>
          <span>Questions about a hold go to the trip desk.</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
