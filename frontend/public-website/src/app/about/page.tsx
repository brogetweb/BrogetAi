import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { SiteFooter } from "@/components/site-footer";
import { allServices, liveServices, menuGroups } from "@/lib/menu";

export const metadata: Metadata = {
  title: "About us — Broget AI",
  description: "BrogetAI brings travel, banking, payments, and builder services together on one platform, run by one team.",
};

const stats = [
  [String(allServices.length), "Services"],
  [String(menuGroups.length), "Desks"],
  [String(liveServices.length), "Live today"],
  ["1", "Team behind it all"],
];

const values = [
  ["shield", "Consent and security first", "Credit checks run only with consent. Partner keys and credentials stay on our servers, never in the browser."],
  ["users", "Built with agents", "Our agent network helps customers with credit reports, payments, and bookings, close to where they live and work."],
  ["bolt", "Simple by default", "Every service has a clear page: what it does, how it works, and whether it is live today."],
  ["support", "People you can reach", "One support desk for every service. Write to us and the right team replies."],
];

const story = [
  ["The idea", "People juggle different apps and offices for travel, credit, payments, and property. We wanted one place for all of it."],
  ["Today", `${liveServices.map(({ item }) => item.label).join(", ")} are live, with agents serving customers every day.`],
  ["Next", "Travel booking, SIP, deposits, education, health care, and agriculture are on the way, on the same platform."],
];

export default function AboutPage() {
  return (
    <>
      <main className="bg-white text-slate-900">
        <PageHero
          eyebrow="About us"
          title="One platform for the services"
          accent="people use every day."
          text="BrogetAI brings travel, credit, payments, and builder projects together, so customers and agents can get things done in one place, with one team behind it."
        >
          <Link href="/#services" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">
            Explore services
            <ServiceIcon name="arrow" className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="inline-flex items-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/10">
            Contact us
          </Link>
        </PageHero>

        <section className="relative z-10 mx-auto -mt-10 max-w-5xl px-5 lg:px-8">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)] sm:grid-cols-4">
            {stats.map(([value, label]) => (
              <div key={label} className="bg-white px-5 py-6 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <Reveal>
            <p className="text-sm font-semibold text-blue-600">Who we are</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">One company, one standard, many services.</h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              BrogetAI is built around a simple idea: the services people depend on should not be scattered. Credit reports, payment collection and payouts, travel, and property work all sit on one platform, under one name.
            </p>
            <ol className="mt-8 space-y-5 border-l border-slate-200 pl-6">
              {story.map(([title, text]) => (
                <li key={title} className="relative">
                  <span className="absolute top-1.5 -left-[1.95rem] h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-1 ring-blue-200" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                </li>
              ))}
            </ol>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
                <Image src="/images/home/home-hero.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold tracking-[0.14em] text-blue-200 uppercase">Live today</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {liveServices.map(({ item }) => (
                      <li key={item.slug}>
                        <Link href={item.href} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-blue-600">What we do</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Four desks, {allServices.length} services.</h2>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {menuGroups.map((group, index) => {
                const live = group.items.filter((item) => !item.soon).length;
                return (
                  <Reveal key={group.id} delay={index * 0.06} className="h-full min-w-0">
                    <article className="panel-glow flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                          <ServiceIcon name={group.id} />
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${live ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {live ? `${live} live` : "Launching"}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950">{group.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{group.headline}</p>
                      <ul className="mt-5 flex-1 space-y-2 border-t border-slate-100 pt-4">
                        {group.items.map((item) => (
                          <li key={item.slug}>
                            <Link href={item.href} className="group flex items-center gap-2 text-sm text-slate-700 hover:text-blue-600">
                              <ServiceIcon name={item.slug} className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                              <span className="min-w-0 flex-1 truncate">{item.label}</span>
                              {!item.soon ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-label="Live" /> : null}
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

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">What we stand for</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">The way we work.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map(([icon, title, text], index) => (
              <Reveal key={title} delay={index * 0.05} className="h-full">
                <article className="flex h-full gap-5 rounded-2xl border border-slate-200 p-6 sm:p-7">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <ServiceIcon name={icon} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
