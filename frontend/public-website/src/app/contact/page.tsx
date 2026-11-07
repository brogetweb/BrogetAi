import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { supportEmail, supportHours } from "@/lib/contact";
import { PageHero } from "@/components/page-hero";
import { ServiceIcon } from "@/components/service-icon";
import { SiteFooter } from "@/components/site-footer";
import { allServices, menuGroups } from "@/lib/menu";

export const metadata: Metadata = {
  title: "Contact us — Broget AI",
  description: `Write to the BrogetAI team at ${supportEmail}. Support hours Monday to Saturday, 10:00 to 18:00.`,
};

const sites = Array.from(new Map(allServices.flatMap(({ item }) => (item.site ? [[item.site.name, item.site]] : []))).values());

const tips = [
  ["Pick the right topic", "CIBIL, payments, Builder Ships, travel, or something else."],
  ["Add a reference", "If it is about a report, payment, or booking, include the reference you were given."],
  ["Use a reachable number", "We reply to the email and mobile number you share."],
];

export default function ContactPage() {
  return (
    <>
      <main className="bg-slate-50 text-slate-900">
        <PageHero
          eyebrow="Contact us"
          title="Let's talk about"
          accent="what you need."
          text="A credit report, a payment, a builder project, or a question about a service. Send one message and the right team will reply."
        />

        <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-5 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <a href={`mailto:${supportEmail}`} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)] hover:border-blue-300">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">Email us</span>
                <span className="mt-0.5 block truncate text-sm font-medium text-blue-600 group-hover:text-blue-700">{supportEmail}</span>
                <span className="mt-1 block text-xs text-slate-500">We reply on working days</span>
              </span>
            </a>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2" />
                </svg>
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-950">Support hours</span>
                <span className="mt-0.5 block text-sm font-medium text-slate-700">{supportHours}</span>
                <span className="mt-1 block text-xs text-slate-500">Indian Standard Time</span>
              </span>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.3)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <ServiceIcon name="bolt" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-950">Live services</span>
                <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {sites.map((site) => (
                    <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-700 hover:text-blue-600">
                      {site.name} ↗
                    </a>
                  ))}
                </span>
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-14 lg:grid-cols-[1.4fr_1fr] lg:gap-10 lg:px-8 lg:py-20">
          <ContactForm />
          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-950">Before you write</h2>
              <ol className="mt-5 space-y-5">
                {tips.map(([title, text], index) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 ring-1 ring-blue-100">{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <p className="mt-0.5 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-950">Go straight to a desk</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {menuGroups.map((group) => (
                  <li key={group.id}>
                    <Link href={`/#${group.id}`} className="group flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:border-blue-300 hover:text-blue-600">
                      <ServiceIcon name={group.id} className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                      <span className="truncate">{group.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
