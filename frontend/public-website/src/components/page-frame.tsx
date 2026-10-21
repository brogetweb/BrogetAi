import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageFrame({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f3f0ea] px-5 pb-20 pt-28 text-[#12141a] lg:px-8">
        <div className="mx-auto max-w-6xl">
          {eyebrow ? <p className="text-[11px] font-extrabold tracking-[0.18em] text-indigo-600">{eyebrow}</p> : null}
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{lede}</p>
          <div className="mt-10">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
