import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { findService, serviceSlugs } from "@/lib/menu";
import { serviceDetails } from "@/lib/services";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findService(slug);
  if (!found) return { title: "Broget AI" };
  const summary = serviceDetails[slug]?.summary ?? found.item.text;
  return {
    title: `${found.item.label} — Broget AI`,
    description: found.item.soon ? `${summary} Coming soon.` : summary,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findService(slug);
  if (!found) notFound();
  return <ServicePage group={found.group} item={found.item} />;
}
