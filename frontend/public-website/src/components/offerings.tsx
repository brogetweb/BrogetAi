import { DeskCard, deskGrid } from "@/components/desk-card";
import { Reveal } from "@/components/reveal";
import { allServices, menuGroups } from "@/lib/menu";

export function Offerings() {
  return (
    <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-5 lg:px-8 lg:pt-20">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">Our services</p>
        <h2 className="mt-3 text-3xl leading-[1.12] font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-5xl">{allServices.length} services across {menuGroups.length} desks.</h2>
        <p className="mt-3 text-sm leading-6 text-[#1d4ed8] sm:text-base">Every service has its own page. Open a card to see what it does and how it works.</p>
      </Reveal>
      <div className="sticky top-[5.5rem] z-30 mt-6 flex justify-center">
        <div className="flex max-w-full gap-2 overflow-x-auto rounded-full bg-[#f6f5f2]/90 p-1 backdrop-blur">
          {menuGroups.map((group) => (
            <a key={group.id} href={`#${group.id}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1d4ed8] ring-1 ring-slate-200 hover:bg-[#1d4ed8] hover:text-white">
              {group.label} <span className="text-xs opacity-70">· {group.items.length}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-16">
        {menuGroups.map((group, groupIndex) => {
          const live = group.items.filter((item) => !item.soon).length;
          return (
            <section key={group.id} id={group.id} className="scroll-mt-40">
              <Reveal className="flex flex-col gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">
                    {String(groupIndex + 1).padStart(2, "0")} · {group.label}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">{group.headline}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">{group.lede}</p>
                </div>
                <p className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] uppercase ${live ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {live ? `${live} of ${group.items.length} live` : "Opening soon"}
                </p>
              </Reveal>
              <div className={`desk-stage mt-6 grid w-full gap-5 lg:gap-6 ${deskGrid(group.items.length)}`}>
                {group.items.map((item, index) => (
                  <Reveal key={item.slug} className="h-full" delay={index * 0.08}>
                    <DeskCard item={item} titleAs="h4" />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
