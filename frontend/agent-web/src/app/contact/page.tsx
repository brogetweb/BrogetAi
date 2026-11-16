import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/public-chrome";
import { business } from "@/lib/business";

export const metadata: Metadata = { title: "Contact Us", description: `Contact ${business.brand} support for the agent panel, wallet payments and credit checks.` };

export default function ContactPage() {
  const rows: [string, React.ReactNode][] = [
    ["Company", business.legalName],
    ["Email", <a key="e" href={`mailto:${business.supportEmail}`} className="font-semibold text-brand">{business.supportEmail}</a>],
    ...(business.phone ? ([["Phone", <a key="p" href={`tel:${business.phone.replace(/\s/g, "")}`} className="font-semibold text-brand">{business.phone}</a>]] as [string, React.ReactNode][]) : []),
    ["Support hours", business.supportHours],
    ...(business.registeredAddress ? ([["Registered address", business.registeredAddress]] as [string, React.ReactNode][]) : []),
    ["Website", business.website],
  ];
  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <PublicNav />
      <main className="px-4 pb-16 pt-28 md:px-6">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow text-brand">Support</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-base leading-7 text-muted">
            For help with your agent account, wallet top-ups, refunds or credit checks, write to us. Include your registered email and, for payments, the Razorpay payment ID.
          </p>

          <dl className="card mt-8 divide-y divide-line overflow-hidden">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-1 px-6 py-4 sm:grid-cols-[180px_1fr] sm:gap-4">
                <dt className="text-sm font-medium text-subtle">{label}</dt>
                <dd className="text-sm text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 text-sm leading-6 text-muted">
            We reply within 1 to 2 working days. See also our <Link href="/refund-policy" className="font-semibold text-brand">Refund &amp; Cancellation Policy</Link>,{" "}
            <Link href="/terms" className="font-semibold text-brand">Terms &amp; Conditions</Link> and{" "}
            <Link href="/privacy" className="font-semibold text-brand">Privacy Policy</Link>.
          </p>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
