import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/lib/menu";

export function deskGrid(count: number) {
  if (count > 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
  if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2";
}

export function StatusBadge({ soon }: { soon?: boolean }) {
  return soon ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-amber-700 uppercase shadow-sm ring-1 ring-amber-200/70 backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
      Coming soon
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-emerald-700 uppercase shadow-sm ring-1 ring-emerald-200/70 backdrop-blur">
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      Live
    </span>
  );
}

export function DeskCard({ item, group, compact = false, titleAs = "h3" }: { item: MenuItem; group?: string; compact?: boolean; titleAs?: "h3" | "h4" }) {
  const Title = titleAs;
  return (
    <Link
      href={item.href}
      className="desk-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/80 hover:ring-[#1d4ed8]/40 focus-visible:ring-2 focus-visible:ring-[#1d4ed8] focus-visible:outline-none"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover object-center transition duration-700 ease-out group-hover:scale-[1.05] ${item.soon ? "saturate-[0.85]" : ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07101f]/55 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <StatusBadge soon={item.soon} />
        </div>
        {group ? (
          <span className="absolute bottom-3 left-3 text-[10px] font-bold tracking-[0.16em] text-white/90 uppercase">{group}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Title className="text-[1.05rem] leading-snug font-semibold tracking-tight text-slate-900 group-hover:text-[#1d4ed8]">{item.label}</Title>
        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-slate-600">{item.text}</p>
        <div className={`mt-4 flex items-center gap-3 border-t border-slate-100 pt-3.5 ${compact ? "justify-start" : "justify-between"}`}>
          <span className={`truncate text-xs font-medium text-slate-500 ${compact ? "hidden" : ""}`}>{item.site ? item.site.name : item.soon ? "Opening soon" : "BrogetAI"}</span>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1d4ed8]">
            {item.soon ? "Preview" : "View service"}
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
