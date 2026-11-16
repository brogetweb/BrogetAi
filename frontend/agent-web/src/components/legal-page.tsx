import Link from "next/link";
import { PublicFooter, PublicNav } from "@/components/public-chrome";
import { business } from "@/lib/business";

export type LegalSection = { id: string; title: string; clauses: string[] };

const policyLinks = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/contact", label: "Contact Us" },
];

export function LegalPage({ title, lede, current, sections }: { title: string; lede: string; current: string; sections: LegalSection[] }) {
  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <PublicNav />
      <main className="px-4 pb-16 pt-28 md:px-6">
        <article className="mx-auto max-w-3xl">
          <p className="eyebrow text-brand">Policies</p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-muted">{lede}</p>
          <p className="mt-3 text-sm text-subtle">
            {business.legalName} · Last updated {business.policiesUpdated}
          </p>

          <nav aria-label="Policies" className="mt-6 flex flex-wrap gap-2">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.href === current ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  link.href === current ? "border-brand bg-brand-50 text-brand" : "border-line bg-white text-muted hover:border-[#cfd8e8] hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`} className="text-muted hover:text-ink">
                {index + 1}. {section.title}
              </a>
            ))}
          </nav>

          <div className="card mt-8 space-y-10 p-6 md:p-8">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  {index + 1}. {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-muted">
                  {section.clauses.map((clause, clauseIndex) => (
                    <p key={clause}>
                      <span className="mr-2 text-subtle">
                        {index + 1}.{clauseIndex + 1}
                      </span>
                      {clause}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-8 text-sm leading-6 text-muted">
            Questions about this page: write to{" "}
            <a href={`mailto:${business.supportEmail}`} className="font-semibold text-brand">
              {business.supportEmail}
            </a>{" "}
            or see <Link href="/contact" className="font-semibold text-brand">Contact Us</Link>.
          </p>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
