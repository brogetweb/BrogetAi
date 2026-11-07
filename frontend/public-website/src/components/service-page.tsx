import Image from "next/image";
import Link from "next/link";
import { DeskCard, deskGrid } from "@/components/desk-card";
import { HomeBrowse } from "@/components/home-browse";
import { Reveal } from "@/components/reveal";
import { SearchPanel } from "@/components/search-panel";
import { SiteFooter } from "@/components/site-footer";
import type { MenuGroup, MenuItem } from "@/lib/menu";
import { serviceDetails } from "@/lib/services";

function OpenSite({ site, light = false }: { site: NonNullable<MenuItem["site"]>; light?: boolean }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${light ? "bg-white text-[#12141a] hover:bg-blue-50" : "bg-[#1d4ed8] text-white hover:bg-[#163a9a]"}`}
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
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-[5.25rem] overflow-hidden bg-[#07101f] text-white">
          <Image src={item.image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.94)_0%,rgba(13,47,134,0.8)_50%,rgba(13,47,134,0.35)_100%)]" />
          <div className="relative mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-center px-4 py-14 sm:min-h-[30rem] sm:px-5 lg:px-8">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/#${group.id}`} className="hover:text-white">{group.label}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{item.label}</span>
            </nav>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.16em] uppercase ${live ? "bg-emerald-400 text-emerald-950" : "bg-white text-[#1d4ed8]"}`}>
                {live ? "● Live now" : "Coming soon"}
              </span>
              <span className="rounded-full border border-white/25 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-blue-100 uppercase">{group.label}</span>
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.045em] sm:text-6xl">{item.label}</h1>
            <p className="mt-3 max-w-2xl text-xl font-semibold tracking-[-0.02em] text-blue-100 sm:text-2xl">{detail?.headline ?? item.text}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{detail?.summary ?? item.text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {item.site ? <OpenSite site={item.site} light /> : null}
              <Link href="/contact" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                {live ? "Talk to the desk" : "Ask about launch"}
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
              <p className="text-[11px] font-bold tracking-[0.2em] text-[#2f6bff] uppercase">What you get</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">Everything {item.label} covers.</h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {detail.features.map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.06} className="h-full">
                  <article className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_16px_40px_rgba(18,24,38,0.06)] ring-1 ring-slate-200">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3ff] text-sm font-bold text-[#1d4ed8]">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#163a9a]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {detail ? (
          <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] bg-[#0b1630] px-6 py-10 text-white sm:px-10 sm:py-12">
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
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">
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
              <Link href="/contact" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-[#163a9a] hover:border-[#1d4ed8]">
                Contact us
              </Link>
            </div>
          </div>
        </section>

        {others.length ? (
          <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">{group.label}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">Also in {group.label}</h2>
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
