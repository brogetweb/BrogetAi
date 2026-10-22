import Image from "next/image";
import Link from "next/link";
import { DeskCard, deskGrid } from "@/components/desk-card";
import { SiteFooter } from "@/components/site-footer";
import { menuGroups } from "@/lib/menu";

const parts = [
  ["01", "Travel", "Book flights, trains, buses, and hotels in real time."],
  ["02", "Banking", "CIBIL, a monthly SIP, and fixed or recurring deposits."],
  ["03", "Payment", "Collect with a gateway or a payment link. Pay out to banks, wallets, UPI, and cards."],
  ["04", "Our Services", "Education, health care, agriculture, and builder ships."],
];

export default function AboutPage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-[5.25rem] overflow-hidden bg-[#07101f] text-white">
          <Image src="/images/home/home-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.9)_0%,rgba(7,16,31,0.62)_52%,rgba(7,16,31,0.28)_100%)]" />
          <div className="relative mx-auto flex min-h-[22rem] max-w-7xl flex-col justify-center px-5 py-14 sm:min-h-[26rem] sm:px-5 lg:px-8">
            <p className="text-[11px] font-bold tracking-[0.2em] text-blue-100 uppercase">About us</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">One BrogetAI desk for the trip, the money, and the work beside them.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">Book a flight, train, bus, or hotel in real time. Check a CIBIL report, start a SIP, or open a deposit. Collect a payment, then pay it out.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#travel" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#12141a]">See the desk</Link>
              <Link href="/contact" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white">Contact us</Link>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4 lg:px-8">
          {parts.map(([step, title, text]) => (
            <article key={step} className="rounded-2xl bg-white px-5 py-5 text-center shadow-[0_16px_40px_rgba(18,24,38,0.08)] ring-1 ring-slate-200">
              <p className="text-xs font-bold tracking-[0.14em] text-[#1d4ed8]">{step}</p>
              <h2 className="mt-1 text-base font-semibold text-[#1d4ed8]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">{text}</p>
            </article>
          ))}
        </section>

        <div className="mx-auto mt-16 max-w-7xl space-y-16 px-5 lg:px-8">
          {menuGroups.map((group) => (
            <section key={group.id}>
              <div className="mx-auto max-w-xl text-center">
                <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">{group.label}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">{group.headline}</h2>
                <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">{group.lede}</p>
              </div>
              <div className={`mt-6 grid w-full gap-5 ${deskGrid(group.items.length)}`}>
                {group.items.map((item) => (
                  <DeskCard key={item.href} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mx-auto mt-16 max-w-7xl px-5 lg:px-8">
          <div className="rounded-[1.75rem] bg-[#12141a] px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-semibold tracking-[-0.04em]">A question about the desk?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/75">Write to BrogetAI. Travel, banking, payments, and the services beside them stay in one place.</p>
            <Link href="/contact" className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#17191e]">Contact us</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
