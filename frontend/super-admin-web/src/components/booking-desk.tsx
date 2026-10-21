"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { Row } from "@/lib/desk";

const months: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function isoDate(label: string) {
  const [day, month] = label.split(" ");
  const mm = months[month];
  if (!day || !mm) return "";
  return `2026-${mm}-${day.padStart(2, "0")}`;
}

export function BookingDesk({ columns, rows }: { columns: string[]; rows: Row[] }) {
  const [date, setDate] = useState("");
  const statusIndex = columns.indexOf("Status");
  const dateIndex = columns.indexOf("Date");
  const filtered = useMemo(() => {
    if (!date) return rows;
    return rows.filter((row) => isoDate(row.cells[dateIndex] ?? "") === date);
  }, [date, dateIndex, rows]);
  const ticketed = filtered.filter((row) => row.cells[statusIndex] === "Ticketed").length;
  const pending = filtered.filter((row) => row.cells[statusIndex] === "Pending").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total booked" value={filtered.length} className="bg-white" />
        <Stat label="Ticketed" value={ticketed} className="bg-[#eaf1ff]" />
        <Stat label="Pending" value={pending} className="bg-[#fff6e5]" />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-extrabold">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 block rounded-xl border border-[#e6ebf5] bg-white px-3 py-2.5 font-semibold outline-none focus:border-[#2f6bff]"
          />
        </label>
        {date ? (
          <button type="button" onClick={() => setDate("")} className="rounded-xl border border-[#e6ebf5] bg-white px-4 py-2.5 text-sm font-extrabold">
            All dates
          </button>
        ) : (
          <p className="pb-2.5 text-sm font-semibold text-[#5c677a]">Showing every sample date.</p>
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-[#eef1f6] bg-white px-4 py-10 text-center text-sm font-semibold text-[#8b95a7]">No bookings on that date.</p>
      ) : (
        <DataTable columns={columns} rows={filtered} />
      )}
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <article className={`rounded-2xl border border-[#eef1f6] p-4 ${className}`}>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-extrabold">{label}</p>
    </article>
  );
}
