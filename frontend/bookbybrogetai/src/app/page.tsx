import Link from "next/link";
import { HomeFlights } from "@/components/home-flights";
import { HomeSearch } from "@/components/home-search";
import { Icon, type IconName } from "@/components/icons";

const trust: [IconName, string, string][] = [
  ["lock", "Secure payments", "UPI, cards & net banking"],
  ["bolt", "Instant e-ticket", "PDF in My trips after payment"],
  ["tag", "No hidden charges", "Full price before you pay"],
  ["headset", "Real help", "support@brogetai.com"],
];

const steps: [string, string][] = [
  ["Search", "Compare fares across airlines. No sign-up needed to look."],
  ["Create your profile", "Name, mobile and email, once. Required before booking."],
  ["Book & pay", "Add travellers, see the full price with taxes, pay securely."],
  ["Fly", "Your trip and e-ticket stay in My trips."],
];

const products: [IconName, string, string, boolean][] = [
  ["plane", "Flights", "Domestic & international fares from every major airline.", true],
  ["hotel", "Hotels", "Stays across India with the same traveller profile.", false],
  ["bus", "Bus", "Intercity buses with live seat maps.", false],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1630_0%,#123a8f_55%,#1d5bff_100%)] pb-16 pt-12 text-white md:pt-16">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-sun/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-6xl px-4">
          <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.08] sm:text-4xl md:text-6xl">Flights, hotels & buses,<br className="hidden md:block" /> all in one place.</h1>
          <p className="mt-4 max-w-xl text-base text-white/75 md:text-lg">Compare fares from every major airline. Browse freely and create your profile only when you&apos;re ready to book.</p>
          <div className="mt-9">
            <HomeSearch />
          </div>
          <ul className="mt-8 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            {trust.map(([icon, title, copy]) => (
              <li key={title} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-white/15"><Icon name={icon} size={19} /></span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-xs text-white/60">{copy}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm font-bold text-subtle">
          <span className="text-xs tracking-[.18em]">TOP AIRLINES</span>
          {["IndiGo", "Air India", "Akasa Air", "SpiceJet", "Air India Express", "Vistara"].map((n) => <span key={n} className="text-muted">{n}</span>)}
        </div>
      </section>

      <HomeFlights />

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <p className="text-xs font-bold tracking-[.18em] text-brand">EVERYTHING IN ONE APP</p>
        <h2 className="mt-1 text-3xl font-extrabold">Book more than flights</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {products.map(([icon, title, copy, live]) => (
            <div key={title} className="border-l-2 border-line pl-5">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${live ? "bg-[#eef4ff] text-brand" : "bg-sun/10 text-sun"}`}><Icon name={icon} size={24} /></span>
              <p className="mt-3 flex items-center gap-2 font-display text-xl font-extrabold">
                {title}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${live ? "bg-emerald-50 text-emerald-700" : "bg-sun/10 text-sun"}`}>{live ? "Live" : "Coming soon"}</span>
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <p className="text-xs font-bold tracking-[.18em] text-brand">HOW IT WORKS</p>
        <h2 className="mt-1 text-3xl font-extrabold">Four steps to take off</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4">
          <span aria-hidden className="absolute left-5 right-5 top-5 hidden h-px bg-line md:block" />
          {steps.map(([title, copy], i) => (
            <li key={title} className="relative">
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] font-display text-sm font-bold text-white ring-8 ring-[#f6f8fc]">{i + 1}</span>
              <p className="mt-4 font-display text-lg font-bold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="-mb-16 mt-20 bg-[linear-gradient(120deg,#0b1630,#123a8f)] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-4 py-12 md:flex-row md:items-center">
          <div>
            <p className="font-display text-3xl font-extrabold">Ready when you are.</p>
            <p className="mt-1 text-white/70">Create your free profile once. Every booking after that takes seconds.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/register" className="btn-sun px-6 py-3">Create profile</Link>
            <Link href="/flights?from=DEL&to=BOM&adults=1&cabin=0" className="btn rounded-xl border border-white/25 px-6 py-3 text-white hover:bg-white/10">Browse flights</Link>
          </div>
        </div>
      </section>
    </>
  );
}
