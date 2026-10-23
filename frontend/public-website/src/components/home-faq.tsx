"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { menuGroups } from "@/lib/menu";

const answers: Record<string, [string, string][]> = {
  "Flight Booking": [
    ["Can I book a flight today?", "Not yet. Flight booking is coming soon."],
    ["Are the fares live?", "Live fares are not connected on this site yet."],
    ["Is a ticket confirmed here?", "No. A search on this page is not a confirmed ticket."],
    ["Can I hold a seat?", "No hold is created from this page."],
    ["Where do I open it?", "Use the Flight Booking card under Travel."],
  ],
  "Train Booking": [
    ["Can I book a train today?", "Train booking is coming soon."],
    ["Are seats live?", "Live seats are not connected yet."],
    ["Is a berth confirmed here?", "Nothing here is a confirmed train ticket."],
    ["Which trains will show?", "The train desk will list coaches when booking opens."],
  ],
  "Bus Booking": [
    ["Can I book a bus today?", "Bus booking is coming soon."],
    ["Are coaches live?", "Live coaches are not connected yet."],
    ["Is a seat confirmed here?", "No bus seat is held from this page."],
    ["Where is the bus desk?", "Open Bus Booking under Travel."],
  ],
  "Hotel Booking": [
    ["Are hotel rooms live?", "Room availability is not connected yet."],
    ["Can I reserve a stay?", "Nothing here is a held reservation."],
    ["Is the price final?", "There is no confirmed hotel price yet."],
    ["How do I ask about a room?", "Use Contact us and name the city and the dates."],
    ["Where do I open it?", "Use the Hotel Booking card under Travel."],
  ],
  CIBIL: [
    ["Can I check a CIBIL report?", "Not yet. A credit check stays off until access is approved."],
    ["Should I enter a PAN?", "No. Do not enter a real PAN on this site."],
    ["Is a report saved here?", "This page does not pull or store a live report."],
    ["Who runs a report later?", "When the desk is live, an agent runs it. It is not live now."],
  ],
  SIP: [
    ["Can I start a SIP today?", "SIP is coming soon. It is not an active plan here."],
    ["Is money taken from this page?", "No. This page does not start a payment."],
    ["Is a monthly amount fixed?", "No SIP amount is set on this site yet."],
    ["Where do I open it?", "Use the SIP card under Banking."],
  ],
  "FD & RD": [
    ["Can I open an FD today?", "Fixed deposits are coming soon."],
    ["Can I open an RD today?", "Recurring deposits are coming soon."],
    ["Is a rate shown as final?", "No deposit rate on this page is a confirmed offer."],
    ["Does this page take money?", "No. A deposit is not started from here."],
  ],
  "Payment Gateway": [
    ["Is the payment gateway open?", "Yes. It opens gateway.brogetpay.com."],
    ["Can I pay on this page?", "No. This page does not take a payment."],
    ["Is it the same login?", "The gateway is its own site."],
    ["What can it take?", "Online payments for purchases and subscriptions, on the gateway site."],
    ["Where is the card?", "Open the Payment Gateway card. It leaves this site."],
  ],
  "Payment Link": [
    ["Can I send a payment link today?", "Payment Link is coming soon."],
    ["Does a link collect money now?", "No link is created from this page yet."],
    ["Do I need a checkout page?", "The idea is a link without a checkout. It is not live yet."],
    ["Where do I open it?", "Use the Payment Link card under Payment."],
  ],
  PayOut: [
    ["Can I send a payout today?", "PayOut is coming soon."],
    ["Which rails are planned?", "Banks, wallets, UPI, and cards, when it opens."],
    ["Does this page move money?", "No payout is sent from this page."],
    ["Where do I open it?", "Use the PayOut card under Payment."],
  ],
  "Education Ecosystem": [
    ["Is education open?", "The education desk is coming soon."],
    ["Can I enrol from here?", "No enrolment is taken on this page yet."],
    ["What will it cover?", "Learning, campuses, and student services."],
    ["Where do I open it?", "Use the Education Ecosystem card under Our Services."],
  ],
  "Health Care": [
    ["Is health care open?", "Health care is coming soon."],
    ["Can I book a clinic here?", "No clinic visit is booked from this page yet."],
    ["Who is it for?", "Clinics, care, and health services for families."],
    ["Where do I open it?", "Use the Health Care card under Our Services."],
  ],
  Agriculture: [
    ["Is agriculture open?", "Agriculture is coming soon."],
    ["Can I order farm inputs here?", "No order is placed from this page yet."],
    ["What will it cover?", "Farm inputs, markets, and grower services."],
    ["Where do I open it?", "Use the Agriculture card under Our Services."],
  ],
  "Builder Ships": [
    ["Is Builder Ships active?", "Yes. It is open now."],
    ["Where does it go?", "It opens www.builderbroget.com."],
    ["Is it on this website?", "The card leaves this site and opens Builder Ships."],
    ["What is it for?", "Construction, sites, and builder projects."],
    ["How do I open it?", "Use the Builder Ships card under Our Services."],
  ],
};

const groups = menuGroups.flatMap((group) =>
  group.items.flatMap((item) => {
    const items = answers[item.label];
    if (!items) return [];
    return [{ label: item.label, image: item.image, href: item.href, soon: Boolean(item.soon), desk: group.label, items }];
  }),
);

export function HomeFaq() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const group = groups[index];
  const external = group.href.startsWith("http");

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % groups.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, cycle]);

  return (
    <section
      className="mx-auto max-w-7xl px-5 py-6 lg:px-8"
      aria-label="Questions"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setCycle((current) => current + 1);
      }}
    >
      <div className="border-t border-slate-300 pt-8 text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">FAQ</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">Every desk, a few answers at a time.</h2>
      </div>

      <div key={group.label} className="faq-enter mt-8 grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image src={group.image} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover object-center" />
        </div>
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 border-b border-slate-300 pb-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">
                {String(index + 1).padStart(2, "0")} · {group.desk} · {group.soon ? "Coming soon" : "Active"}
              </p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a]" aria-live="polite">{group.label}</h3>
            </div>
            <Link
              href={group.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="shrink-0 text-sm font-semibold text-[#1d4ed8] underline decoration-[#1d4ed8]/40 underline-offset-4 hover:decoration-[#1d4ed8]"
            >
              Open
            </Link>
          </div>
          <ol className="mt-1">
            {group.items.map(([question, answer], itemIndex) => (
              <li key={question} className="grid gap-1 border-b border-slate-200 py-3.5 sm:grid-cols-2 sm:items-start sm:gap-8">
                <p className="text-[15px] font-semibold leading-6 text-[#163a9a]">{itemIndex + 1}. {question}</p>
                <p className="text-sm leading-6 text-[#1d4ed8]">{answer}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 h-px bg-slate-200">
            <div key={`${index}-${cycle}`} className={`faq-progress h-px w-full bg-[#1d4ed8] ${paused ? "is-paused" : ""}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
