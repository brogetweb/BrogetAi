import Link from "next/link";
import { SearchForm } from "@/components/search-form";

const routes: [string, string, string, string][] = [
  ["DEL", "BOM", "Delhi", "Mumbai"],
  ["BLR", "DEL", "Bengaluru", "Delhi"],
  ["BOM", "GOI", "Mumbai", "Goa"],
  ["HYD", "MAA", "Hyderabad", "Chennai"],
  ["DEL", "DXB", "Delhi", "Dubai"],
  ["CCU", "BLR", "Kolkata", "Bengaluru"],
];

const steps: [string, string][] = [
  ["Search", "Compare fares across airlines — no sign-up needed to look."],
  ["Create your profile", "One quick profile with your name, mobile and email. Required before booking."],
  ["Book & pay", "Add travellers, see the full price with taxes, pay securely."],
  ["Travel", "Your trip and e-ticket stay in My trips."],
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1630_0%,#123a8f_55%,#1d5bff_100%)] pb-28 pt-14 text-white md:pt-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-sun/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <p className="chip bg-white/10 text-white/90 ring-1 ring-white/20">✈ Flights across India & abroad</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.08] md:text-6xl">Fly smarter.<br />Book in minutes.</h1>
          <p className="mt-4 max-w-xl text-base text-white/75 md:text-lg">Compare fares from every major airline. Browse freely — create your profile only when you&apos;re ready to book.</p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <SearchForm />
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Popular routes</h2>
            <p className="mt-1 text-sm text-muted">Tap a route to see live fares.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map(([from, to, a, b]) => (
            <Link key={from + to} href={`/flights?from=${from}&to=${to}&adults=1&cabin=0`} className="card group flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:border-brand/30">
              <div>
                <p className="font-display text-lg font-bold">{a} → {b}</p>
                <p className="text-xs font-semibold text-subtle">{from} · {to}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-soft text-brand transition group-hover:bg-brand group-hover:text-white">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-2xl font-extrabold md:text-3xl">How booking works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, copy], i) => (
            <div key={title} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[linear-gradient(140deg,#3a74ff,#0ea5e9)] text-sm font-bold text-white">{i + 1}</span>
              <p className="mt-4 font-display text-base font-bold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{copy}</p>
            </div>
          ))}
        </div>
        <div className="card mt-8 flex flex-col items-start justify-between gap-4 bg-[linear-gradient(120deg,#eef4ff,#fff)] p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-extrabold">Ready to book?</p>
            <p className="mt-1 text-sm text-muted">Create your free profile once — every booking after that takes seconds.</p>
          </div>
          <Link href="/register" className="btn-primary px-6 py-3">Create profile</Link>
        </div>
      </section>
    </>
  );
}
