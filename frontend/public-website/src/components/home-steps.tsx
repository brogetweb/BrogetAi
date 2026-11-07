import Link from "next/link";
import { Reveal } from "@/components/reveal";

const steps = [
  ["Pick a service", "Choose travel, banking, payments, or one of our other desks."],
  ["Open its page", "See what the service does, how it works, and whether it is live."],
  ["Get it done", "Start on the service's own site, or talk to the BrogetAI desk."],
];

const reasons = [
  ["One company", "Every service sits inside BrogetAI, under one name."],
  ["Agent network", "Agents help customers with reports, payments, and bookings."],
  ["Secure by design", "Partner keys stay on our servers, never in the browser."],
  ["Real support", "Reach a real team on the contact page."],
];

export function HomeSteps() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-5 lg:px-8 lg:pt-20">
      <div className="overflow-hidden rounded-[2rem] bg-[#0b1630] px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <Reveal>
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-200 uppercase">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">From a question to a finished job, in three steps.</h2>
            <ol className="mt-8 space-y-4">
              {steps.map(([title, text], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-400/20 text-sm font-bold text-blue-200 ring-1 ring-blue-300/30">{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-white/75">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-200 uppercase">Why BrogetAI</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {reasons.map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.06} className="h-full">
                  <article className="h-full rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                    <h3 className="text-base font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/75">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-5 lg:px-8">
      <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-[linear-gradient(110deg,#1d4ed8_0%,#163a9a_100%)] p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Not sure where to start?</h2>
          <p className="mt-2 text-base leading-7 text-white/80">Tell us what you need. The BrogetAI desk will point you to the right service.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#12141a] hover:bg-blue-50">Contact us</Link>
          <Link href="/#services" className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">All services</Link>
        </div>
      </div>
    </section>
  );
}
