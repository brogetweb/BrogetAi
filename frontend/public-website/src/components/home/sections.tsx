import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ServiceIcon } from "@/components/service-icon";
import { allServices, findService, liveServices, menuGroups, type MenuItem } from "@/lib/menu";
import { serviceDetails } from "@/lib/services";

function pick(slug: string) {
  const found = findService(slug);
  if (!found) throw new Error(`Unknown service ${slug}`);
  return found.item;
}

type Feature = {
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  points: string[];
  main: MenuItem;
  related?: MenuItem[];
};

const features: Feature[] = [
  {
    eyebrow: "Banking · CIBIL",
    title: "Credit reports in minutes, with consent.",
    text: serviceDetails.cibil.summary,
    image: "/images/home/home-cibil.jpg",
    points: serviceDetails.cibil.features.slice(0, 3).map(([title, text]) => `${title}: ${text}`),
    main: pick("cibil"),
  },
  {
    eyebrow: "Payments · BroGetPay",
    title: "Collect money in. Send money out.",
    text: "A payment gateway, pay-in collections, and payouts from one BroGetPay account, with a merchant dashboard and developer APIs.",
    image: "/images/home/home-gateway.jpg",
    points: ["UPI, cards, net banking, and wallets", "UPI QR, payment links, and bank transfers", "Payouts to banks, UPI, wallets, and cards"],
    main: pick("payment-gateway"),
    related: [pick("payment-gateway"), pick("pay-in"), pick("payout")],
  },
  {
    eyebrow: "Our services · Builder Ships",
    title: "Construction and builder projects, end to end.",
    text: serviceDetails["builder-ships"].summary,
    image: "/images/home/home-builder.jpg",
    points: serviceDetails["builder-ships"].features.slice(0, 3).map(([title, text]) => `${title}: ${text}`),
    main: pick("builder-ships"),
  },
];

export function LiveProducts() {
  return (
    <section id="live" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-emerald-600">Live today</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Ready to use right now.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{liveServices.length} services are open today. More desks join as they launch.</p>
        </Reveal>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {features.map((feature, index) => (
            <Reveal key={feature.title}>
              <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={`relative ${index % 2 ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_30px_60px_-25px_rgba(15,23,42,0.35)] ring-1 ring-slate-200">
                    <Image src={feature.image} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                  </div>
                  <div className={`absolute -bottom-5 hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex ${index % 2 ? "-left-5" : "-right-5"}`}>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ServiceIcon name={feature.main.slug} className="h-[18px] w-[18px]" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{feature.main.site?.name}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        Live now
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-600">{feature.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{feature.title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">{feature.text}</p>
                  <ul className="mt-6 space-y-3">
                    {feature.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <ServiceIcon name="check" className="h-3 w-3" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  {feature.related ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {feature.related.map((item) => (
                        <Link key={item.slug} href={item.href} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-600">
                          <ServiceIcon name={item.slug} className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-8 flex flex-wrap gap-3">
                    {feature.main.site ? (
                      <a href={feature.main.site.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                        Open {feature.main.site.name}
                        <ServiceIcon name="external" className="h-4 w-4" />
                      </a>
                    ) : null}
                    <Link href={feature.main.href} className="inline-flex items-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                      Learn more
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const stats = [
  [String(allServices.length), "Services on one platform"],
  [String(menuGroups.length), "Desks: travel, banking, payments, more"],
  [String(liveServices.length), "Services live today"],
  ["1", "Team and support desk for all of it"],
];

const reasons = [
  ["shield", "Secure by design", "Partner keys and credentials stay on our servers, never in the browser."],
  ["users", "Built for agents", "Agents serve customers for credit reports, payments, and bookings from one place."],
  ["bolt", "Fast to start", "Live services open on their own sites, ready to use today."],
  ["support", "Real support", "Reach a real team through the contact page whenever you need help."],
];

export function Stats() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold text-blue-400">Why BrogetAI</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">One company behind every service.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-400">Customers and agents deal with one name, one team, and one set of standards, whatever the service.</p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-8">
              {stats.map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-4xl font-bold tracking-[-0.04em]">{value}</dd>
                  <dd className="mt-1 text-sm leading-6 text-slate-400">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map(([icon, title, text], index) => (
              <Reveal key={title} delay={index * 0.05} className="h-full">
                <article className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 ring-1 ring-blue-400/20">
                    <ServiceIcon name={icon} />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  ["Choose a service", "Pick from travel, banking, payments, or our other desks."],
  ["Read how it works", "Every service page shows what it does, the steps, and whether it is live."],
  ["Get started", "Open the live service on its own site, or talk to our team first."],
];

export function Steps() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Up and running in three steps.</h2>
        </Reveal>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="absolute top-6 right-[16%] left-[16%] hidden h-px bg-slate-200 md:block" aria-hidden="true" />
          {steps.map(([title, text], index) => (
            <li key={title} className="relative text-center">
              <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-bold text-slate-950 shadow-sm">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const faqs = [
  ["Which services are live today?", `${liveServices.map(({ item }) => item.label).join(", ")} are live now. The other services are launching soon.`],
  ["How do I check a CIBIL report?", "Reach a BrogetAI agent or open cibil.brogetai.com. The check runs only with the customer's consent."],
  ["What can I do with BroGetPay?", "Accept online payments with the gateway, collect with UPI QR codes, payment links, and bank transfers, and pay out to banks, UPI, wallets, and cards."],
  ["Can I book flights or hotels today?", "Travel booking is launching soon. Each travel page shows how it will work, and you can contact us in the meantime."],
  ["Does this website ask for my PAN or card details?", "No. This website does not ask for a PAN, a credit report, or card details. Those are handled on the service's own site."],
  ["How do I contact the team?", "Use the contact page. Tell us what you need and the right desk will reply."],
];

export function Faq() {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <p className="text-sm font-semibold text-blue-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Questions, answered.</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Can&apos;t find what you need?{" "}
            <Link href="/contact" className="font-semibold text-blue-600 hover:text-blue-700">Contact our team</Link>.
          </p>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {faqs.map(([question, answer], index) => (
            <details key={question} className="group px-6 py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950 [&::-webkit-details-marker]:hidden">
                {question}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_-20%,rgba(59,130,246,0.35),transparent)]" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">Ready to get started with BrogetAI?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-300">Tell us what you need and we&apos;ll point you to the right service.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100">Contact our team</Link>
              <Link href="/#services" className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">Browse services</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
