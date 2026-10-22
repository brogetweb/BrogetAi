import type { Metadata } from "next";
import { ServiceSoon } from "@/components/service-soon";
import { menuGroups } from "@/lib/menu";

const group = menuGroups.find((entry) => entry.id === "banking");
const item = group?.items.find((entry) => entry.href === "/cibil");

export const metadata: Metadata = {
  title: "CIBIL — BerogetAI",
  description: "Access CIBIL credit reports instantly. Coming soon.",
};

export default function CibilPage() {
  if (!group || !item) return null;
  return <ServiceSoon group={group} item={item} />;
}
