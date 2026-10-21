import { DataTable } from "@/components/data-table";
import type { Section } from "@/lib/desk";

export function SectionView({ section }: { section: Section }) {
  return <DataTable columns={section.columns} rows={section.rows} />;
}
