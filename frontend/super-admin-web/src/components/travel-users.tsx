"use client";

import { useEffect, useMemo, useState } from "react";
import { useDesk } from "@/components/admin-shell";
import { listTravelUsers, setTravelUserStatus, type TravelUserRow } from "@/lib/api";

function prettyDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function dayKey(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function TravelUsers() {
  const { notify } = useDesk();
  const [users, setUsers] = useState<TravelUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    let active = true;
    listTravelUsers()
      .then((rows) => {
        if (active) setUsers(rows);
      })
      .catch((caught) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : "Could not load travel users.";
        setError(message);
        notify("bad", "Could not load travel users", message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [notify]);

  const shown = useMemo(() => {
    if (!date) return users;
    return users.filter((user) => dayKey(user.createdAt) === date);
  }, [date, users]);
  const activeCount = shown.filter((user) => user.status === "active").length;
  const inactiveCount = shown.length - activeCount;

  async function toggleBlock(user: TravelUserRow) {
    const next = user.status === "active" ? "inactive" : "active";
    try {
      const saved = await setTravelUserStatus(user.id, next);
      setUsers((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      setNotice(next === "inactive" ? `${saved.name} is blocked from booking.` : `${saved.name} is active again.`);
      notify(next === "inactive" ? "bad" : "ok", next === "inactive" ? "User blocked" : "User active", saved.name);
    } catch (caught) {
      notify("bad", "Could not update user", caught instanceof Error ? caught.message : "Try again.");
    }
  }

  if (loading) {
    return <p className="rounded-2xl border border-[#eef1f6] bg-white px-4 py-12 text-center text-sm font-semibold text-[#8b95a7]">Loading travel users…</p>;
  }

  if (error && users.length === 0) {
    return <p className="rounded-2xl border border-[#ffe4e6] bg-[#fff1f2] px-4 py-12 text-center text-sm font-semibold text-[#dc2626]">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total users" value={shown.length} hint={date ? prettyDate(date) : "From Book by Broget AI"} className="bg-white" />
        <Stat label="Active users" value={activeCount} hint="Can book travel" className="bg-[#e8f8ee]" />
        <Stat label="Inactive users" value={inactiveCount} hint="Blocked from booking" className="bg-[#fff1f2]" />
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
        <p className="rounded-2xl border border-[#eef1f6] bg-white px-4 py-12 text-center text-sm font-semibold text-[#8b95a7]">
          {users.length === 0 ? "No Book app accounts yet. Create a profile in the mobile app." : "No accounts created on that date."}
        </p>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#eef1f6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#f8fafc] text-[11px] font-extrabold tracking-wide text-[#8b95a7]">
                <tr>
                  {["User", "Mobile", "City", "Joined", "Status", ""].map((column) => (
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
                          {user.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span>
                          <p className="font-extrabold text-[#12182b]">{user.name}</p>
                          <p className="text-xs font-bold text-[#8b95a7]">{user.email}</p>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{user.phone || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{user.city || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#3d4658]">{prettyDate(user.createdAt)}</td>
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
