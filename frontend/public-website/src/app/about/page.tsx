import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

const services = [
  {
    title: "Flights",
    text: "Compare nonstop and one-stop fares, then hold the price.",
    href: "/flights",
    label: "Search flights",
    image: "/images/hero-flights-full.jpg",
    alt: "A passenger airplane in a clear sky",
  },
  {
    title: "Hotels",
    text: "Choose the city and the dates, then reserve the room.",
    href: "/hotels",
    label: "View stays",
    image: "/images/hero-hotels.jpg",
    alt: "A hotel suite opening onto the sea",
  },
  {
    title: "Credit score",
    text: "See where you stand before the next step.",
    href: "/cibil",
    label: "Credit score",
    image: "/images/hero-cibil-score.jpg",
    alt: "A phone showing a credit score ring",
  },
];

const places = [
  { city: "Dubai", image: "/images/dubai.jpg", href: "/hotels?city=Dubai" },
  { city: "Bali", image: "/images/bali.jpg", href: "/hotels?city=Bali" },
  { city: "Singapore", image: "/images/singapore.jpg", href: "/hotels?city=Singapore" },
  { city: "Goa", image: "/images/goa.jpg", href: "/hotels?city=Goa" },
];

const steps = [
  ["01", "Search", "Set the cities, the dates, and who is travelling."],
  ["02", "Compare", "Fares and rooms sit in one list, with the cabin you picked."],
  ["03", "Hold", "Keep the fare or the room while you decide. Payment tickets it."],
];

export default function AboutPage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-16 h-[300px] overflow-hidden sm:h-[360px]">
          <Image src="/images/dubai.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_40%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.72)_0%,rgba(8,16,32,0.28)_42%,transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_top,rgba(8,16,32,0.35),transparent)]" />
          <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8">
            <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-200 uppercase">About us</p>
            <h1 className="mt-2 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">One desk for the fare, the room, and the next step.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">BerogetAI keeps the flight and the stay in the same search, with a clear hold before you pay.</p>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl gap-3 px-4 sm:grid-cols-3 sm:px-5 lg:px-8">
          {[
            ["One search", "Flights and hotels share the same trip."],
            ["A hold first", "Keep the fare or the room while you decide."],
            ["One desk", "Questions about a hold come back to the same place."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-indigo-600 uppercase">What you can do</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Book the trip. Then the next step.</h2>
            </div>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {services.map((item) => (
              <Link key={item.title} href={item.href} className="group relative min-h-[340px] overflow-hidden rounded-3xl">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">{item.text}</p>
                  <p className="mt-4 text-sm font-semibold">{item.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-3xl">
              <Image src="/images/hotel-pool.jpg" alt="Infinity pool looking over the sea" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 p-8 text-white">
                <p className="text-[11px] font-bold tracking-[0.18em] text-white/70 uppercase">The trip</p>
                <p className="mt-2 max-w-sm text-3xl font-semibold tracking-[-0.04em]">Set the fare. Then choose the room.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {steps.map(([step, title, text]) => (
                <article key={step} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                  <p className="text-sm font-semibold text-indigo-600">{step}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">Places on the desk</h2>
            <Link href="/hotels" className="hidden text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 sm:inline">All stays</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {places.map((place) => (
              <Link key={place.city} href={place.href} className="group relative h-44 overflow-hidden rounded-2xl sm:h-56">
                <Image src={place.image} alt={place.city} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <p className="absolute bottom-4 left-4 text-lg font-semibold text-white">{place.city}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-5 lg:px-8">
          <div className="relative overflow-hidden rounded-[1.75rem]">
            <Image src="/images/maldives.jpg" alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-[#0c1222]/70" />
            <div className="relative flex flex-col items-start justify-between gap-6 px-8 py-12 text-white sm:flex-row sm:items-center sm:px-12">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.04em]">A question about a fare or a room?</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/75">Write to the trip desk and keep the reference from your hold ready.</p>
              </div>
              <Link href="/contact" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#17191e]">Contact us</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
