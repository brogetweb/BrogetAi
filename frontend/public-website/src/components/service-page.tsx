import Image from "next/image";
import Link from "next/link";
import { DeskCard, deskGrid } from "@/components/desk-card";
import { HomeBrowse } from "@/components/home-browse";
import { Reveal } from "@/components/reveal";
import { SearchPanel } from "@/components/search-panel";
import { ServiceIcon } from "@/components/service-icon";
import { SiteFooter } from "@/components/site-footer";
import type { MenuGroup, MenuItem } from "@/lib/menu";
import { serviceDetails } from "@/lib/services";

function OpenSite({ site, light = false }: { site: NonNullable<MenuItem["site"]>; light?: boolean }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold ${light ? "bg-white text-slate-950 hover:bg-slate-100" : "bg-slate-950 text-white hover:bg-slate-800"}`}
    >
      Open {site.name}
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function ServicePage({ group, item }: { group: MenuGroup; item: MenuItem }) {
  const detail = serviceDetails[item.slug];
  const others = group.items.filter((entry) => entry.slug !== item.slug);
  const live = !item.soon;
  const travel = group.id === "travel";

  return (
    <>
      <main className="bg-slate-50 pb-20 text-slate-900">
        <section className="relative isolate mt-[4.5rem] overflow-hidden bg-slate-950 text-white">
          <Image src={item.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-30" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.55)_0%,rgba(2,6,23,0.92)_70%)]" aria-hidden="true" />
          <div className="hero-grid-dark pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
          <div className="aurora pointer-events-none absolute -top-40 left-1/2 -z-10 h-[28rem] w-[40rem] -translate-x-1/2 rounded-full bg-blue-600/30 blur-[110px]" aria-hidden="true" />
          <div className="hero-rise relative mx-auto flex min-h-[28rem] max-w-4xl flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[32rem] sm:py-20">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/#${group.id}`} className="hover:text-white">{group.label}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{item.label}</span>
            </nav>
            <span className="mt-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-500/20 text-blue-100 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.8)] ring-1 ring-white/15 backdrop-blur">
              <ServiceIcon name={item.slug} className="h-6 w-6" />
            </span>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {live ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live now
                </span>
              ) : (
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300 ring-1 ring-amber-400/30">Coming soon</span>
              )}
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/15">{group.label}</span>
            </div>
            <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-[-0.045em] sm:text-6xl">{item.label}</h1>
            <p className="mt-4 bg-gradient-to-r from-blue-300 via-cyan-200 to-indigo-200 bg-clip-text text-xl font-semibold tracking-[-0.02em] text-transparent sm:text-2xl">{detail?.headline ?? item.text}</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{detail?.summary ?? item.text}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {item.site ? <OpenSite site={item.site} light /> : null}
              <Link href="/contact" className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
                {live ? "Talk to our team" : "Ask about launch"}
              </Link>
            </div>
          </div>
        </section>

        {travel ? (
          <div id="search" className="relative z-20 mx-auto -mt-8 max-w-7xl scroll-mt-28 px-4 sm:px-5 lg:px-8">
            <SearchPanel mode={item.slug === "hotel-booking" ? "hotels" : "flights"} />
          </div>
        ) : null}

        {detail ? (
          <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-5 lg:px-8 lg:pt-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-bold tracking-[0.2em] text-blue-600 uppercase">What you get</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">Everything {item.label} covers.</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.features.map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.06} className="h-full">
                  <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_16px_40px_rgba(18,24,38,0.06)] ring-1 ring-slate-200">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 ring-1 ring-blue-100">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {detail ? (
          <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-12">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-blue-200 uppercase">How it works</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Three steps.</h2>
                </div>
                {!live ? <p className="max-w-sm text-sm leading-6 text-white/70">{item.label} is opening soon. This is how it will work.</p> : null}
              </div>
              <ol className="mt-8 grid gap-4 md:grid-cols-3">
                {detail.steps.map(([title, text], index) => (
                  <li key={title} className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-white/10">
                    <p className="text-4xl font-semibold tracking-[-0.04em] text-blue-300">{index + 1}</p>
                    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/75">{text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {travel ? <HomeBrowse part={item.slug === "hotel-booking" ? "stays" : "routes"} /> : null}

        <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex flex-col items-start gap-5 rounded-[2rem] bg-white p-8 ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                {live ? `${item.label} is live.` : `${item.label} opens soon.`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {live && item.site
                  ? `Open ${item.site.name} to get started, or talk to the BrogetAI desk first.`
                  : "Leave a message and the BrogetAI desk will reach you when it opens."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {item.site ? <OpenSite site={item.site} /> : null}
              <Link href="/contact" className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                Contact us
              </Link>
            </div>
          </div>
        </section>

        {others.length ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-blue-600 uppercase">{group.label}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">Also in {group.label}</h2>
            </div>
            <div className={`desk-stage mt-6 grid w-full gap-5 ${deskGrid(others.length)}`}>
              {others.map((entry) => (
                <DeskCard key={entry.slug} item={entry} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
