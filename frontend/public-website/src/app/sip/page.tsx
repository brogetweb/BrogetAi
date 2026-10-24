import type { Metadata } from "next";
import { ServiceSoon } from "@/components/service-soon";
import { menuGroups } from "@/lib/menu";

const group = menuGroups.find((entry) => entry.id === "banking");
const item = group?.items.find((entry) => entry.href === "/sip");

export const metadata: Metadata = {
  title: "SIP — Broget AI",
  description: "Start a monthly savings plan beside the rest of the desk. Coming soon.",
};

export default function SipPage() {
  if (!group || !item) return null;
  return <ServiceSoon group={group} item={item} />;
}
