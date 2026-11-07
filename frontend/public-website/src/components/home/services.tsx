import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { allServices, menuGroups } from "@/lib/menu";

const sites = Array.from(new Map(allServices.flatMap(({ item }) => (item.site ? [[item.site.name, item.site]] : []))).values());

export function LiveOn() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-8 sm:flex-row sm:justify-between lg:px-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Our services run on</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {sites.map((site) => (
            <li key={site.name}>
              <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold tracking-tight text-slate-400 hover:text-slate-900">
                {site.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ServicesDirectory() {
  return (
    <section id="services" className="scroll-mt-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold text-blue-600">Services</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Everything you need, organised in four desks.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            {allServices.length} services across travel, banking, payments, and more. Each one has its own page with what it does and how it works.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {menuGroups.map((group, index) => {
            const live = group.items.filter((item) => !item.soon).length;
            return (
              <Reveal key={group.id} delay={(index % 2) * 0.06} className="h-full min-w-0">
                <article id={group.id} className="flex h-full scroll-mt-28 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <header className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                        <ServiceIcon name={group.id} />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-slate-950">{group.label}</h3>
                        <p className="mt-0.5 text-sm leading-6 text-slate-600">{group.headline}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {live ? `${live}/${group.items.length} live` : "Launching"}
                    </span>
                  </header>
                  <ul className="mt-6 flex-1 divide-y divide-slate-100 border-t border-slate-100">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <Link href={item.href} className="group -mx-3 flex items-center gap-4 rounded-lg px-3 py-3.5 hover:bg-slate-50">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${item.soon ? "bg-slate-50 text-slate-500 ring-slate-200" : "bg-blue-50 text-blue-600 ring-blue-100"}`}>
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
