import { notFound } from "next/navigation";
import { Icon } from "@/components/admin-shell";
import { AdminAccountDesk } from "@/components/admin-account";
import { AgentsDesk } from "@/components/agents-desk";
import { BookingDesk } from "@/components/booking-desk";
import { CibilList } from "@/components/cibil-list";
import { CustomerList } from "@/components/customer-list";
import { FlightOrders } from "@/components/flight-orders";
// KYC is paused.
// import { KycDesk } from "@/components/kyc-desk";
import { SectionView } from "@/components/section-view";
import { TravelUsers } from "@/components/travel-users";
import { WalletOverviewDesk } from "@/components/wallet-overview";
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
      <header className="relative overflow-hidden rounded-3xl border border-[#e6ebf5] bg-white px-5 py-5 shadow-[var(--shadow-card)] md:px-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_140%_at_100%_0%,rgba(47,107,255,0.10),transparent_60%)]" />
        <div className="relative flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,#5b8cff,#2f6bff)] text-white shadow-[0_10px_24px_-10px_rgba(47,107,255,0.8)]">
            <Icon name={section.slug} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold tracking-[0.14em] text-[#8b95a7]">{section.group.toUpperCase()}</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{section.title}</h1>
            <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-[#5c677a]">{section.blurb}</p>
          </div>
        </div>
      </header>
      <div className="mt-5">
        {section.slug === "flights" ? <FlightOrders /> : null}
        {section.slug === "hotels" ? <BookingDesk columns={section.columns} rows={section.rows} /> : null}
        {section.slug === "customers" ? <CustomerList /> : null}
        {section.slug === "cibil" ? <CibilList /> : null}
        {section.slug === "agents" ? <AgentsDesk /> : null}
        {section.slug === "account" ? <AdminAccountDesk /> : null}
        {section.slug === "wallet" ? <WalletOverviewDesk /> : null}
        {/* {section.slug === "kyc" ? <KycDesk /> : null} */}
        {section.slug === "users" ? <TravelUsers /> : null}
        {section.slug === "flights" || section.slug === "hotels" || section.slug === "customers" || section.slug === "cibil" || section.slug === "agents" || section.slug === "users" || section.slug === "account" || section.slug === "wallet" ? null : <SectionView section={section} />}
      </div>
    </div>
  );
}
