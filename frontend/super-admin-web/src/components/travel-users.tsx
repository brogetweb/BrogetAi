"use client";

import { useMemo, useState } from "react";
import { travelUsers, type TravelUser } from "@/lib/desk";

const months: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

function isoDate(label: string) {
  const [day, month, year] = label.split(" ");
  const mm = months[month];
  if (!day || !mm || !year) return "";
  return `${year}-${mm}-${day.padStart(2, "0")}`;
}

function prettyDate(iso: string) {
  const [year, month, day] = iso.split("-");
  const name = Object.entries(months).find(([, value]) => value === month)?.[0];
  if (!year || !name || !day) return iso;
  return `${Number(day)} ${name} ${year}`;
}

export function TravelUsers() {
  const [statusOf, setStatusOf] = useState<Record<string, TravelUser["status"]>>({});
  const [notice, setNotice] = useState("");
  const [date, setDate] = useState("");
  const users = travelUsers.map((user) => ({ ...user, status: statusOf[user.id] ?? user.status }));
  const shown = useMemo(() => {
    if (!date) return users;
    return users.filter((user) => isoDate(user.joined) === date);
  }, [date, users]);
  const activeCount = shown.filter((user) => user.status === "active").length;
  const inactiveCount = shown.length - activeCount;

  function toggleBlock(user: TravelUser) {
    const next = user.status === "active" ? "inactive" : "active";
    setStatusOf((current) => ({ ...current, [user.id]: next }));
    setNotice(next === "inactive" ? `${user.name} is inactive. This stays on this screen until the API is connected.` : `${user.name} is active again.`);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total users" value={shown.length} hint={date ? prettyDate(date) : "All sample dates"} className="bg-white" />
        <Stat label="Active users" value={activeCount} hint="Can book travel" className="bg-[#e8f8ee]" />
        <Stat label="Inactive users" value={inactiveCount} hint="Blocked from the site" className="bg-[#fff1f2]" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e6ebf5] bg-white px-4 py-3">
        <label className="text-sm font-extrabold text-[#12182b]">
          Joined on
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-1 block rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-3 py-2.5 font-semibold outline-none focus:border-[#2f6bff]"
          />
        </label>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-[#5c677a]">{shown.length} shown{date ? ` · ${prettyDate(date)}` : ""}</p>
          {date ? (
            <button type="button" onClick={() => setDate("")} className="rounded-xl border border-[#e6ebf5] bg-[#f8fafc] px-4 py-2.5 text-sm font-extrabold">
              All dates
            </button>
          ) : null}
        </div>
      </div>

      {notice ? <p className="rounded-xl bg-[#e8f8ee] px-4 py-2.5 text-sm font-bold text-[#16a34a]">{notice}</p> : null}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-[#eef1f6] bg-white px-4 py-12 text-center text-sm font-semibold text-[#8b95a7]">No accounts created on that date.</p>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["User", "City", "Bookings", "Joined", "Status", ""].map((column) => (
                    <th key={column || "action"} className="px-4 py-3 font-extrabold">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((user) => (
                  <tr key={user.id} className="border-t border-[#f1f4f8]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff] text-sm font-extrabold text-[#2f6bff]">
                          {user.name.slice(0, 1)}
                        </span>
                        <span>
                          <p className="font-extrabold text-[#12182b]">{user.name}</p>
                          <p className="text-xs font-bold text-[#8b95a7]">{user.email}</p>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{user.city}</td>
                    <td className="px-4 py-3 font-extrabold text-[#12182b]">{user.bookings}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{user.joined}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${user.status === "active" ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => toggleBlock(user)} className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${user.status === "active" ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#e8f8ee] text-[#16a34a]"}`}>
                        {user.status === "active" ? "Block" : "Unblock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint, className }: { label: string; value: number; hint: string; className: string }) {
  return (
    <article className={`rounded-2xl border border-[#e6ebf5] p-4 ${className}`}>
      <p className="text-xs font-extrabold tracking-[0.08em] text-[#8b95a7] uppercase">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-semibold text-[#5c677a]">{hint}</p>
    </article>
  );
}
