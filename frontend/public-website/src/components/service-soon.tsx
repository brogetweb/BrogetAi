import Image from "next/image";
import Link from "next/link";
import { DeskCard, deskGrid } from "@/components/desk-card";
import { HomeBrowse } from "@/components/home-browse";
import { SearchPanel } from "@/components/search-panel";
import { SiteFooter } from "@/components/site-footer";
import type { MenuGroup, MenuItem } from "@/lib/menu";

const notes: Record<string, [string, string][]> = {
  travel: [
    ["Live search", "Fares, seats, coaches, and rooms change as you search."],
    ["Real-time booking", "This is the desk for that booking. You book it here."],
    ["Opening soon", "The page is ready to open. Booking starts when the desk does."],
  ],
  banking: [
    ["One place", "Credit, a monthly SIP, and fixed or recurring deposits sit together."],
    ["Your account", "The check stays with the same BrogetAI account."],
    ["Opening soon", "There is no form on this page yet. It opens with the desk."],
  ],
  payment: [
    ["Collect", "Take a payment through the gateway or a link you send."],
    ["Pay out", "Send money to a bank, wallet, UPI, or card."],
    ["Opening soon", "The rail is listed now. It opens when the desk is ready."],
  ],
  products: [
    ["Beside travel", "Education, health, agriculture, and builder work sit on the same desk."],
    ["One company", "Each product stays inside BrogetAI."],
    ["Opening soon", "The product page is here. The service opens next."],
  ],
};

export function ServiceSoon({ group, item }: { group: MenuGroup; item: MenuItem }) {
  const others = group.items.filter((entry) => entry.href !== item.href);
  const points = notes[group.id] ?? notes.products;

  return (
    <>
      <main className="bg-[#f6f5f2] pb-20 text-[#17191e]">
        <section className="relative mt-[5.25rem] overflow-hidden bg-[#07101f] text-white">
          <Image src={item.image} alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(7,16,31,0.9)_0%,rgba(7,16,31,0.62)_52%,rgba(7,16,31,0.28)_100%)]" />
          <div className="relative mx-auto flex min-h-[22rem] max-w-3xl flex-col items-center justify-center px-5 py-14 text-center sm:min-h-[26rem] sm:px-5">
            <p className="text-[11px] font-bold tracking-[0.18em] text-blue-100 uppercase">{group.label}</p>
            <h1 className="mt-3 text-4xl leading-[1.08] font-semibold tracking-[-0.04em] sm:text-5xl">{item.label}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">{item.text}</p>
            <p className="mt-6 rounded-full bg-white px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#1d4ed8] uppercase">Coming soon</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={`/#${group.id}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#12141a]">Back to {group.label}</Link>
              <Link href="/contact" className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white">Contact us</Link>
            </div>
          </div>
        </section>

        {group.id === "travel" ? (
          <div id="search" className="relative z-20 mx-auto -mt-8 max-w-7xl scroll-mt-28 px-4 sm:px-5 lg:px-8">
            <SearchPanel mode={item.slug === "hotel-booking" ? "hotels" : "flights"} />
          </div>
        ) : null}

        <section className={`relative z-10 mx-auto grid max-w-7xl gap-3 px-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-3 lg:px-8 ${group.id === "travel" ? "mt-8" : "-mt-8"}`}>
          {points.map(([title, text]) => (
            <article key={title} className="rounded-2xl bg-white px-5 py-5 text-center shadow-[0_16px_40px_rgba(18,24,38,0.08)] ring-1 ring-slate-200">
              <h2 className="text-base font-semibold text-[#1d4ed8]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">{text}</p>
            </article>
          ))}
        </section>

        {group.id === "travel" ? <HomeBrowse part={item.slug === "hotel-booking" ? "stays" : "routes"} /> : null}

        {others.length ? (
          <section className="mx-auto mt-14 max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">{group.label}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">Also in {group.label}</h2>
            </div>
            <div className={`mt-6 grid w-full gap-5 ${deskGrid(others.length)}`}>
              {others.map((entry) => (
                <DeskCard key={entry.href} item={entry} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
