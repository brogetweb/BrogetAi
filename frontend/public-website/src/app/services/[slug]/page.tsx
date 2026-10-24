import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceSoon } from "@/components/service-soon";
import { findService, serviceSlugs } from "@/lib/menu";

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = findService(slug);
  if (!found) return { title: "Broget AI" };
  return {
    title: `${found.item.label} — Broget AI`,
    description: `${found.item.text} Coming soon.`,
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findService(slug);
  if (!found) notFound();
  return <ServiceSoon group={found.group} item={found.item} />;
}
