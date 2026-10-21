import { FlightExplorer } from "@/components/flight-explorer";
import { SiteFooter } from "@/components/site-footer";
import { readParam } from "@/lib/catalog";

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  return (
    <>
      <main className="min-h-screen bg-[#f6f5f2] pb-24">
        <FlightExplorer
              from={readParam(query.from) || "Delhi (DEL)"}
              to={readParam(query.to) || "Dubai (DXB)"}
              depart={readParam(query.depart) || "2026-11-12"}
              ret={readParam(query.return)}
              adults={Number(readParam(query.adults) || readParam(query.travellers) || 1)}
              children={Number(readParam(query.children) || 0)}
              cabin={readParam(query.cabin) || "Economy"}
            />
      </main>
      <SiteFooter />
    </>
  );
}
