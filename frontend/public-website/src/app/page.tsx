import Image from "next/image";
import Link from "next/link";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { HomeBrowse } from "@/components/home-browse";
import { SearchPanel } from "@/components/search-panel";
import { SiteFooter } from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pt-16 text-[#17191e]">
        <HeroSlideshow />

        <div id="search" className="relative z-20 mx-auto -mt-16 max-w-7xl scroll-mt-24 px-4 sm:px-5 lg:px-8">
          <SearchPanel />
        </div>

        <section className="mx-auto max-w-7xl px-5 pt-10 lg:px-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/flights", title: "Flights", text: "Compare nonstop and one-stop fares, then hold the price." },
              { href: "/hotels", title: "Hotels", text: "Choose the city and the dates, then reserve the room." },
              { href: "/cibil", title: "Credit score", text: "See your CIBIL score before the next step." },
              { href: "/sip", title: "SIP", text: "Keep a savings plan beside the booking." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md">
                <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <HomeBrowse />

        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[1.75rem] bg-[#12141a] text-white lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative min-h-[280px]">
              <Image src="/images/hotel-pool.jpg" alt="Infinity pool looking over the sea at dusk" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-300 uppercase">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Search, compare, then hold.</h2>
              <ol className="mt-8 space-y-5">
                {[
                  ["01", "Search the route", "Set the cities, the dates, and who is travelling."],
                  ["02", "Compare the fare", "Nonstop and one-stop sit in one list, with the cabin you picked."],
                  ["03", "Hold it", "Keep the fare or the room while you decide. Payment tickets it."],
                ].map(([step, title, text]) => (
                  <li key={step} className="flex gap-4">
                    <span className="text-sm font-semibold text-indigo-300">{step}</span>
                    <span>
                      <span className="block font-semibold">{title}</span>
                      <span className="mt-1 block text-sm leading-6 text-white/65">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/flights" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#17191e]">Search flights</Link>
                <Link href="/hotels" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white">View stays</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
