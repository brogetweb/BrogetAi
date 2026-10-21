import Link from "next/link";
import { SiteFooter } from "./site-footer";

export function LegalPage({
  title,
  lede,
  related,
  sections,
}: {
  title: string;
  lede: string;
  related: { href: string; label: string };
  sections: { id: string; title: string; clauses: string[] }[];
}) {
  return (
    <>
      <main className="bg-[#f7f6f3] px-5 pb-24 pt-28 text-[#17191e] lg:px-8">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{lede}</p>
          <p className="mt-4 text-sm text-slate-400">Last updated 10 October 2026</p>

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`} className="text-slate-500 hover:text-slate-900">
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>

          <div className="mt-10 space-y-10">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg font-semibold tracking-tight">{index + 1}. {section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  {section.clauses.map((clause, clauseIndex) => (
                    <p key={clause}>
                      <span className="mr-2 text-slate-400">{index + 1}.{clauseIndex + 1}</span>
                      {clause}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm leading-6 text-slate-500">
            See also the <Link href={related.href} className="font-semibold text-slate-800">{related.label}</Link>. Questions go to the <Link href="/contact" className="font-semibold text-slate-800">trip desk</Link>.
          </p>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
