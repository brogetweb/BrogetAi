import { DeskCard, deskGrid } from "@/components/desk-card";
import { Reveal } from "@/components/reveal";
import { menuGroups } from "@/lib/menu";

export function Offerings() {
  return (
    <section className="mx-auto max-w-7xl px-5 pt-12 lg:px-8 lg:pt-16">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">What we provide</p>
        <h2 className="mt-3 text-3xl leading-[1.12] font-semibold tracking-[-0.04em] text-[#163a9a] sm:text-5xl">A preview of the BrogetAI desk.</h2>
        <p className="mt-3 text-sm leading-6 text-[#1d4ed8] sm:text-base">Travel, banking, payments, and the services beside them. Open a card for the full section.</p>
      </Reveal>
      <div className="mt-6 flex justify-center">
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {menuGroups.map((group) => (
            <a key={group.id} href={`#${group.id}`} className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1d4ed8] ring-1 ring-slate-200 hover:bg-[#1d4ed8] hover:text-white">
              {group.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-12 space-y-16">
        {menuGroups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <Reveal className="mx-auto max-w-xl text-center">
              <p className="text-[11px] font-bold tracking-[0.18em] text-[#2f6bff] uppercase">{group.label}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#163a9a] sm:text-3xl">{group.headline}</h3>
              <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">{group.lede}</p>
            </Reveal>
            <div className={`desk-stage mt-6 grid w-full gap-5 ${deskGrid(group.items.length)}`}>
              {group.items.map((item, index) => (
                <Reveal key={item.href} className="h-full" delay={index * 0.08}>
                  <DeskCard item={item} titleAs="h4" />
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
