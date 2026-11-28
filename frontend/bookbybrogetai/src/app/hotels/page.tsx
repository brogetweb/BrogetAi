import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Hotels (coming soon)" };

export default function HotelsPage() {
  return (
    <ComingSoon
      icon="hotel"
      title="Hotel bookings are almost here"
      copy="Book stays across India with the same traveller profile you use for flights."
      points={["Hotels in every major city", "Real photos, prices and reviews", "Free cancellation on many stays"]}
    />
  );
}
