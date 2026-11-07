import Link from "next/link";
import { ServiceIcon } from "@/components/service-icon";
import { allServices, liveServices } from "@/lib/menu";

const soonCount = allServices.length - liveServices.length;

const points = ["Consent-first credit checks", "UPI, cards and bank payouts", "One team, one support desk"];

const sites = Array.from(new Map(allServices.flatMap(({ item }) => (item.site ? [[item.site.name, item.site]] : []))).values());

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      <div className="hero-grid-dark pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="aurora pointer-events-none absolute -top-48 -left-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-600/30 blur-[110px]" aria-hidden="true" />
      <div className="aurora aurora-slow pointer-events-none absolute top-10 right-[-12rem] -z-10 h-[30rem] w-[30rem] rounded-full bg-indigo-500/25 blur-[110px]" aria-hidden="true" />
      <div className="aurora pointer-events-none absolute bottom-[-14rem] left-1/3 -z-10 h-[26rem] w-[26rem] rounded-full bg-cyan-400/15 blur-[110px]" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pt-16 pb-20 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:px-8 lg:pt-28 lg:pb-28">
        <div className="hero-rise">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {liveServices.length} services live · {soonCount} launching soon
          </p>
          <h1 className="mt-6 max-w-2xl text-[2.6rem] leading-[1.04] font-bold tracking-[-0.045em] sm:text-6xl lg:text-[4.1rem]">
            One platform for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">travel, credit, and payments.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            BrogetAI brings CIBIL checks, payment collection and payouts, travel booking, and builder projects together, so customers and agents get it done in one place.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)] hover:bg-slate-100">
              Get started
              <ServiceIcon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/#services" className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
              Explore services
            </Link>
          </div>
          <ul className="mt-10 flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30">
                  <ServiceIcon name="check" className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-rise hero-rise-late relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="pointer-events-none absolute -inset-px rounded-[1.1rem] bg-gradient-to-br from-blue-500/60 via-white/10 to-indigo-500/50" aria-hidden="true" />
          <div className="relative rounded-2xl bg-slate-900/90 shadow-[0_40px_120px_-30px_rgba(37,99,235,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
              </div>
              <p className="text-xs font-medium text-slate-400">BrogetAI · Live services</p>
              <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">All open</span>
            </div>
            <ul className="divide-y divide-white/5 p-1.5">
              {liveServices.map(({ group, item }, index) => (
                <li key={item.slug} className="console-row" style={{ animationDelay: `${0.35 + index * 0.08}s` }}>
                  <Link href={item.href} className="group flex items-center gap-4 rounded-xl px-3.5 py-3 hover:bg-white/5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-500/20 text-blue-200 ring-1 ring-white/10">
                      <ServiceIcon name={item.slug} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="block truncate text-xs text-slate-400">
                        {group.label} · {item.site?.name}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      Live
                    </span>
                    <ServiceIcon name="arrow" className="hidden h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-b-2xl border-t border-white/10 bg-white/[0.02] px-5 py-3.5">
              <p className="text-xs text-slate-400">+{soonCount} more services launching soon</p>
              <Link href="/#services" className="text-xs font-semibold text-blue-300 hover:text-white">View all →</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-5 py-6 sm:flex-row sm:justify-between lg:px-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Live on</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2">
            {sites.map((site) => (
              <li key={site.name}>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-base font-bold tracking-tight text-slate-400 hover:text-white">
                  {site.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ServiceTicker() {
  const row = allServices.map(({ item }) => item);
  return (
    <section aria-label="All BrogetAI services" className="ticker relative overflow-hidden border-b border-slate-200 bg-white py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
      <div className="ticker-track flex w-max gap-3">
        {[...row, ...row].map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            href={item.href}
            aria-hidden={index >= row.length ? true : undefined}
            tabIndex={index >= row.length ? -1 : undefined}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-600"
          >
            <ServiceIcon name={item.slug} className="h-4 w-4 text-blue-600" />
            {item.label}
            <span className={`h-1.5 w-1.5 rounded-full ${item.soon ? "bg-slate-300" : "bg-emerald-500"}`} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
