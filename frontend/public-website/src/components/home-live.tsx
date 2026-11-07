import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { allServices, liveServices, menuGroups } from "@/lib/menu";

const stats = [
  [String(allServices.length), "Services"],
  [String(menuGroups.length), "Desks"],
  [String(liveServices.length), "Live now"],
  [String(allServices.length - liveServices.length), "Opening soon"],
];

export function HomeLive() {
  return (
    <section id="live" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-6 sm:px-5 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-white px-5 py-5 text-center ring-1 ring-slate-200">
            <p className="text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">{value}</p>
            <p className="mt-1 text-[11px] font-bold tracking-[0.16em] text-slate-500 uppercase">{label}</p>
          </div>
        ))}
      </div>

      <Reveal className="mx-auto mt-14 max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] text-emerald-700 uppercase">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          Live now
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-4xl">Open today, ready to use.</h2>
        <p className="mt-3 text-sm leading-6 text-[#1d4ed8] sm:text-base">These services are running now. Open a page to see what each one does.</p>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {liveServices.map(({ group, item }, index) => (
          <Reveal key={item.slug} delay={index * 0.06} className="h-full">
            <Link href={item.href} className="desk-card group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image src={item.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" />
                <span className="absolute top-3 left-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase">Live</span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-[10px] font-bold tracking-[0.14em] text-[#2f6bff] uppercase">{group.label}</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-[#163a9a]">{item.label}</h3>
                <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">{item.text}</p>
                <p className="mt-3 text-sm font-semibold text-[#1d4ed8]">
                  View service <span aria-hidden="true">→</span>
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
