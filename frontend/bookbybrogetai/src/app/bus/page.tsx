import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Bus tickets (coming soon)" };

export default function BusPage() {
  return (
    <ComingSoon
      icon="bus"
      title="Bus tickets are on the way"
      copy="Intercity buses with live seat maps, booked with your Broget AI traveller profile."
      points={["AC, sleeper and Volvo buses", "Pick your seat on a live map", "M-ticket on your phone"]}
    />
  );
}
