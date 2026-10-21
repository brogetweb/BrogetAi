import { notFound } from "next/navigation";
import { AgentsDesk } from "@/components/agents-desk";
import { BookingDesk } from "@/components/booking-desk";
import { CibilList } from "@/components/cibil-list";
import { CustomerList } from "@/components/customer-list";
import { KycDesk } from "@/components/kyc-desk";
import { SectionView } from "@/components/section-view";
import { TravelUsers } from "@/components/travel-users";
import { findSection, sections } from "@/lib/desk";

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: slug } = await params;
  const section = findSection(slug);
  if (!section) notFound();
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">{section.title}</h1>
      <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[#5c677a]">{section.blurb}</p>
      <div className="mt-5">
        {section.slug === "flights" || section.slug === "hotels" ? <BookingDesk columns={section.columns} rows={section.rows} /> : null}
        {section.slug === "customers" ? <CustomerList /> : null}
        {section.slug === "cibil" ? <CibilList /> : null}
        {section.slug === "agents" ? <AgentsDesk /> : null}
        {section.slug === "kyc" ? <KycDesk /> : null}
        {section.slug === "users" ? <TravelUsers /> : null}
        {section.slug === "flights" || section.slug === "hotels" || section.slug === "customers" || section.slug === "cibil" || section.slug === "agents" || section.slug === "kyc" || section.slug === "users" ? null : <SectionView section={section} />}
      </div>
    </div>
  );
}
