import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

/** Full page for products that are not live yet (Hotels, Bus). */
export function ComingSoon({ icon, title, copy, points }: { icon: IconName; title: string; copy: string; points: string[] }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1630_0%,#123a8f_60%,#1d5bff_100%)] text-white">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky/40 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-sun/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ffc59e] ring-1 ring-sun/30">Coming soon</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-lg text-lg text-white/75">{copy}</p>
          <ul className="mt-6 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/85">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15"><Icon name="check" size={14} strokeWidth={2.6} /></span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn-sun px-6 py-3">Search flights now</Link>
            <Link href="/register" className="btn rounded-xl border border-white/25 px-6 py-3 text-white hover:bg-white/10">Create your profile</Link>
          </div>
        </div>
        <div className="hidden justify-center md:flex">
          <span className="grid h-56 w-56 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur"><Icon name={icon} size={104} strokeWidth={1.3} /></span>
        </div>
      </div>
    </section>
  );
}
