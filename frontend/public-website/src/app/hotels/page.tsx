import { HotelExplorer } from "@/components/hotel-explorer";
import { SiteFooter } from "@/components/site-footer";
import { readParam } from "@/lib/catalog";

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const city = readParam(query.city) || "Dubai";
  return (
    <>
      <main className="min-h-screen bg-[#f6f5f2] pb-24">
        <HotelExplorer
              city={city}
              checkIn={readParam(query.checkIn) || "2026-11-12"}
              checkOut={readParam(query.checkOut) || "2026-11-16"}
              guests={Number(readParam(query.guests) || 2)}
            />
      </main>
      <SiteFooter />
    </>
  );
}
