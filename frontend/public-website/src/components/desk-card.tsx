import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/lib/menu";

export function deskGrid(count: number) {
  if (count > 3) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
  if (count === 3) return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2";
}

export function DeskCard({ item, titleAs = "h3" }: { item: MenuItem; titleAs?: "h3" | "h4" }) {
  const Title = titleAs;
  return (
    <Link href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="desk-card group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-slate-200">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover object-center transition duration-700 group-hover:scale-[1.03]" />
        <span className={`absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase shadow-sm ${item.soon ? "text-[#1d4ed8]" : "text-emerald-700"}`}>{item.soon ? "Coming soon" : "Active"}</span>
      </div>
      <div className="flex flex-1 flex-col bg-white px-4 py-5 text-center">
        <Title className="text-lg font-semibold tracking-tight text-[#1d4ed8]">{item.label}</Title>
        <p className="mt-1.5 text-sm leading-6 text-[#1d4ed8]">{item.text}</p>
      </div>
    </Link>
  );
}
