import Link from "next/link";
import { supportEmail, supportHours } from "@/lib/contact";
import { allServices, liveServices, menuGroups } from "@/lib/menu";
import { Brand } from "./brand";
import { ServiceIcon } from "./service-icon";

const company = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const sites = Array.from(new Map(allServices.flatMap(({ item }) => (item.site ? [[item.site.name, item.site]] : []))).values());

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-slate-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 py-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">Start with BrogetAI today.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {liveServices.length} services are live now. Tell us what you need and our team will set you up.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.8)] hover:bg-blue-500">
              Get started
              <ServiceIcon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/#services" className="inline-flex items-center rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5">
              Browse services
            </Link>
          </div>
        </div>

        <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_3fr]">
          <div>
            <Brand tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Travel, banking, payments, and the services beside them. One platform, one team.
            </p>
            <a href={`mailto:${supportEmail}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white hover:text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400" aria-hidden="true">
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6" />
              </svg>
              {supportEmail}
            </a>
            <p className="mt-1.5 text-xs text-slate-500">Support: {supportHours}</p>
            <p className="mt-6 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Live on</p>
            <ul className="mt-3 space-y-2">
              {sites.map((site) => (
                <li key={site.name}>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    {site.name}
                    <ServiceIcon name="external" className="h-3.5 w-3.5 text-slate-500 group-hover:text-white" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
            {menuGroups.map((group) => (
              <div key={group.id} className="min-w-0">
                <h3 className="text-sm font-semibold text-white">{group.label}</h3>
                <ul className="mt-4 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link href={item.href} className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400 hover:text-white">
                        <span className="whitespace-nowrap">{item.label}</span>
                        {!item.soon ? <span className="rounded bg-emerald-500/15 px-1.5 py-px text-[10px] font-semibold text-emerald-400">Live</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2.5">
                {company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-white/10 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} BrogetAI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
