import Link from "next/link";
import { ServiceIcon } from "@/components/service-icon";
import { allServices, liveServices } from "@/lib/menu";

const soonCount = allServices.length - liveServices.length;

const points = ["Consent-first credit checks", "UPI, cards and bank payouts", "One team, one support desk"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.16),transparent)]" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {liveServices.length} services live · {soonCount} launching
          </p>
          <h1 className="mt-6 max-w-xl text-4xl leading-[1.05] font-bold tracking-[-0.04em] text-slate-950 sm:text-[3.6rem]">
            One platform for travel, credit, and payments.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            BrogetAI brings CIBIL checks, payment collection and payouts, travel booking, and builder projects together, so customers and agents get it done in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#services" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">
              Explore services
              <ServiceIcon name="arrow" className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50">
              Talk to our team
            </Link>
          </div>
          <ul className="mt-9 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-3 sm:gap-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ServiceIcon name="check" className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              </div>
              <p className="text-xs font-semibold text-slate-500">BrogetAI · Live services</p>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">All systems open</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {liveServices.map(({ group, item }) => (
                <li key={item.slug}>
                  <Link href={item.href} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      <ServiceIcon name={item.slug} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {group.label} · {item.site?.name}
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      Live
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-b-2xl border-t border-slate-100 bg-slate-50 px-5 py-3.5">
              <p className="text-xs font-medium text-slate-500">+{soonCount} more services launching soon</p>
              <Link href="/#services" className="text-xs font-semibold text-blue-600 hover:text-blue-700">View all →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
