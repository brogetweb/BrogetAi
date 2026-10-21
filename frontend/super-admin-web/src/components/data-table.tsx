"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Row } from "@/lib/desk";

const tones = {
  ok: "bg-[#e8f8ee] text-[#16a34a]",
  wait: "bg-[#fff6e5] text-[#d97706]",
  bad: "bg-[#fff1f2] text-[#dc2626]",
  info: "bg-[#eaf1ff] text-[#2f6bff]",
};

export function DataTable({ columns, rows, compact = false }: { columns: string[]; rows: Row[]; compact?: boolean }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) => row.cells.join(" ").toLowerCase().includes(needle));
  }, [query, rows]);
  const statusIndex = columns.findIndex((column) => column === "Status" || column === "State" || column === "KYC");

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
      {compact ? null : (
        <div className="flex items-center justify-between gap-3 border-b border-[#eef1f6] px-4 py-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this list"
            className="w-full max-w-xs rounded-xl border border-[#eef1f6] bg-[#f8fafc] px-3 py-2 text-sm font-semibold outline-none focus:border-[#2f6bff]"
          />
          <p className="shrink-0 text-xs font-bold text-[#8b95a7]">{visible.length} shown</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-extrabold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center font-semibold text-[#8b95a7]">No rows match that search.</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.cells.join("|")} className="border-t border-[#f1f4f8]">
                  {row.cells.map((cell, index) => (
                    <td key={`${cell}-${index}`} className="px-4 py-3 font-semibold text-[#3d4658]">
                      {index === statusIndex && row.tone ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${tones[row.tone]}`}>{cell}</span>
                      ) : index === 0 ? (
                        <span className="font-extrabold text-[#12182b]">{cell}</span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
