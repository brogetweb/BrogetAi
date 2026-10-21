import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

const points = [
  {
    title: "A monthly amount",
    text: "Set aside a fixed amount each month, next to the trip you are already planning.",
  },
  {
    title: "One account",
    text: "The plan sits with your fares and stays, so the booking and the saving stay together.",
  },
  {
    title: "Opening later",
    text: "There is no fund list and no payment on this page. Flights and hotels are open now.",
  },
];

export default function SipPage() {
  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-16 h-[300px] overflow-hidden sm:h-[380px]">
          <Image src="/images/maldives.jpg" alt="" fill priority sizes="100vw" className="object-cover object-[center_45%]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(8,16,32,0.78)_0%,rgba(8,16,32,0.35)_48%,rgba(8,16,32,0.15)_100%)]" />
          <div className="relative mx-auto max-w-7xl px-5 pt-8 sm:pt-10 lg:px-8">
            <p className="inline-flex rounded-full border border-amber-200/50 bg-amber-200/20 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-amber-100 uppercase">Coming soon</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl">SIP, beside the trip you are planning.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">A monthly savings plan is on the way. Until it opens, search a fare or hold a room.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/flights" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#17191e]">Search flights</Link>
              <Link href="/hotels" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white">View stays</Link>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-8 grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-5 lg:px-8">
          {points.map((point) => (
            <article key={point.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-lg font-semibold tracking-tight">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{point.text}</p>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
