import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  accent,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate mt-[4.5rem] overflow-hidden bg-slate-950 text-white">
      <div className="hero-grid-dark pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="aurora pointer-events-none absolute -top-40 left-1/2 -z-10 h-[28rem] w-[44rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-blue-600/30 blur-[110px]" aria-hidden="true" />
      <div className="aurora aurora-slow pointer-events-none absolute -right-40 bottom-[-12rem] -z-10 h-[24rem] w-[24rem] rounded-full bg-indigo-500/20 blur-[110px]" aria-hidden="true" />
      <div className="hero-rise mx-auto flex max-w-4xl flex-col items-center px-5 py-16 text-center sm:py-24">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-white">{eyebrow}</span>
        </nav>
        <h1 className="mt-6 text-[2.4rem] leading-[1.06] font-bold tracking-[-0.045em] sm:text-6xl">
          {title}
          {accent ? (
            <>
              {" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">{accent}</span>
            </>
          ) : null}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{text}</p>
        {children ? <div className="mt-9 flex w-full flex-wrap justify-center gap-3">{children}</div> : null}
      </div>
    </section>
  );
}
