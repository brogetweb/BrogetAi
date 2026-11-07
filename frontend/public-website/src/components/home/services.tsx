import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { allServices, liveServices, menuGroups } from "@/lib/menu";

const banners: Record<string, string> = {
  travel: "/images/home/home-flight.jpg",
  banking: "/images/home/home-cibil.jpg",
  payment: "/images/home/home-gateway.jpg",
  products: "/images/home/home-builder.jpg",
};

export function ServicesDirectory() {
  return (
    <section id="services" className="relative scroll-mt-24 overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute top-0 left-1/2 h-72 w-[70rem] -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">Services</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl">Everything you need, organised in four desks.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {allServices.length} services across travel, banking, payments, and more. {liveServices.length} are live today, and each one has its own page.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {menuGroups.map((group, index) => {
            const live = group.items.filter((item) => !item.soon).length;
            return (
              <Reveal key={group.id} delay={(index % 2) * 0.08} className="h-full min-w-0">
                <article id={group.id} className="panel-glow flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] transition-shadow duration-300 hover:shadow-[0_30px_60px_-20px_rgba(37,99,235,0.25)]">
                  <div className="relative h-36 overflow-hidden sm:h-40">
                    <Image src={banners[group.id] ?? group.items[0].image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition duration-700 hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/10" />
                    <div className="absolute inset-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                      <div className="flex items-center gap-3.5">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/25 backdrop-blur">
                          <ServiceIcon name={group.id} />
                        </span>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-200 uppercase">{String(index + 1).padStart(2, "0")} · Desk</p>
                          <h3 className="text-xl font-bold tracking-tight text-white">{group.label}</h3>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${live ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30" : "bg-white/10 text-white/80 ring-1 ring-white/20"}`}>
                        {live ? `${live}/${group.items.length} live` : "Launching"}
                      </span>
                    </div>
                  </div>
                  <p className="px-6 pt-5 text-sm leading-6 text-slate-600 sm:px-7">{group.headline} {group.lede}</p>
                  <ul className="mt-3 flex-1 px-3 pb-3 sm:px-4 sm:pb-4">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <Link href={item.href} className="group flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition ${item.soon ? "bg-slate-50 text-slate-500 ring-slate-200 group-hover:text-slate-700" : "bg-blue-50 text-blue-600 ring-blue-100 group-hover:bg-blue-600 group-hover:text-white"}`}>
                            <ServiceIcon name={item.slug} className="h-[18px] w-[18px]" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-slate-900 group-hover:text-blue-600">{item.label}</span>
                            <span className="block truncate text-sm text-slate-500">{item.text}</span>
                          </span>
                          {item.soon ? (
                            <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 sm:inline">Soon</span>
                          ) : (
                            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                              Live
                            </span>
                          )}
                          <ServiceIcon name="arrow" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
