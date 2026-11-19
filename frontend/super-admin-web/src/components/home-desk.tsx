"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HouseWalletCard } from "@/components/agent-count";
import { Icon, useDesk } from "@/components/admin-shell";
import {
  cibilRevenue,
  listAgents,
  listCreditReports,
  listCustomers,
  listFlightOrders,
  walletOverview,
  type CibilRevenueSnapshot,
  type WalletOverview,
  type FlightOrderRow,
} from "@/lib/api";

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function HomeDesk() {
  const { admin } = useDesk();
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [today] = useState(() => new Date());
  const [flights, setFlights] = useState<FlightOrderRow[]>([]);
  const [cibil, setCibil] = useState<CibilRevenueSnapshot | null>(null);
  const [agents, setAgents] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [reports, setReports] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.allSettled([listFlightOrders(), cibilRevenue(), listAgents(), listCustomers(), listCreditReports(), walletOverview()])
      .then((results) => {
        if (!active) return;
        const [flightRes, cibilRes, agentRes, customerRes, reportRes, overviewRes] = results;
        if (overviewRes.status === "fulfilled") setOverview(overviewRes.value);
        if (flightRes.status === "fulfilled") setFlights(flightRes.value);
        if (cibilRes.status === "fulfilled") setCibil(cibilRes.value);
        if (agentRes.status === "fulfilled") setAgents(agentRes.value.length);
        if (customerRes.status === "fulfilled") setCustomers(customerRes.value.length);
        if (reportRes.status === "fulfilled") setReports(reportRes.value.length);
        const failed = results.find((row) => row.status === "rejected");
        if (failed && failed.status === "rejected") {
          setError(failed.reason instanceof Error ? failed.reason.message : "Could not load some desk totals.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const paid = flights.filter((r) => r.status === "paid" || r.status === "ticketed");
  const flightTotal = paid.reduce((s, r) => s + (r.moneyTo?.customerPaid ?? r.total ?? 0), 0);
  const brogetFee = paid.reduce((s, r) => s + (r.moneyTo?.brogetFee ?? r.markup ?? 0), 0);
  const aoPay = paid.reduce((s, r) => s + (r.moneyTo?.aoPayWallet ?? r.netFare ?? 0), 0);
  const recentFlights = [...flights].slice(0, 5);
  const topAgents = (cibil?.agents ?? []).filter((a) => a.hasActivity).slice(0, 5);
  const silentAgents = (cibil?.agents ?? []).filter((a) => !a.hasActivity).slice(0, 5);
  const realTopups = (overview?.recentTopups ?? []).filter((t) => t.status === "success" && !t.testMode);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#0e1b33_0%,#16306b_55%,#2f6bff_120%)] px-6 py-6 text-white md:px-8 md:py-7">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#2f6bff]/40 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold tracking-[0.14em] text-[#9fb0d0]">{today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">{greeting(today)}, {(admin?.name || "Admin").split(" ")[0]}</h1>
            <p className="mt-1 max-w-xl text-sm font-semibold text-[#c9d6f2]">Live money from agent wallets, CIBIL checks and Book flights. No sample rows.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["/agents", "agents", "Add agent"],
              ["/wallet", "wallet", "Agent wallets"],
              ["/cibil", "cibil", "CIBIL reports"],
              ["/customers", "customers", "Customers"],
            ].map(([href, icon, label]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-extrabold ring-1 ring-white/15 transition hover:bg-white/20">
                <Icon name={icon} /> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi href="/agents" tone="text-[#2f6bff]" label="Agents" value={loading ? "…" : String(agents)} hint={loading ? "…" : `${customers} customers`} />
        <Kpi href="/wallet" tone="text-[#16a34a]" label="Agents recharged" value={overview ? money(overview.totals.recharged) : "…"} hint={overview ? `${overview.totals.topups} payments` : "…"} />
        <Kpi href="/cibil" tone="text-[#7c3aed]" label="Used for CIBIL" value={overview ? money(overview.totals.used) : "…"} hint={overview ? `${overview.totals.checks} checks` : "…"} />
        <Kpi href="/wallet" tone="text-[#d97706]" label="Agent wallets now" value={overview ? money(overview.totals.agentBalances) : "…"} hint="Spendable by agents" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <section className="rounded-3xl border border-[#e6ebf5] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">Latest agent top-ups</h2>
              <p className="text-xs font-bold text-[#8b95a7]">Real Razorpay payments, newest first</p>
            </div>
            <Link href="/wallet" className="text-sm font-extrabold text-[#2f6bff]">View all</Link>
          </div>
          <div className="divide-y divide-[#eef1f6]">
            {realTopups.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e8f8ee] text-xs font-extrabold text-[#16a34a]">{t.agentName.slice(0, 2).toUpperCase()}</span>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-[#12182b]">{t.agentName}</p>
                    <p className="text-xs font-semibold text-[#8b95a7]">{new Date(t.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>
                  </div>
                </div>
                <p className="shrink-0 font-extrabold text-[#16a34a]">+{money(t.amount)}</p>
              </div>
            ))}
            {overview && realTopups.length === 0 ? <p className="py-8 text-center text-sm font-semibold text-[#8b95a7]">No agent top-ups yet.</p> : null}
          </div>
        </section>
        <div className="grid content-start gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <HouseWalletCard />
          <Link href="/flights" className="rounded-2xl bg-[#2f6bff] p-4 text-white transition hover:brightness-105">
            <p className="text-lg font-extrabold">Flights money</p>
            <p className="mt-1 text-sm font-semibold text-[#d6e4ff]">{loading ? "…" : `${money(flightTotal)} collected`}</p>
          </Link>
          <Link href="/cibil" className="rounded-2xl bg-[#16a34a] p-4 text-white transition hover:brightness-105">
            <p className="text-lg font-extrabold">CIBIL by agent</p>
            <p className="mt-1 text-sm font-semibold text-[#dcfce7]">{loading ? "…" : `${money(cibil?.totalAmount ?? 0)} from checks`}</p>
          </Link>
        </div>
      </div>

      {error ? <p className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-semibold text-[#be123c]">{error}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Tile label="Flight orders" value={loading ? "…" : String(flights.length)} tint="bg-[#eaf1ff]" />
        <Tile label="Flight paid" value={loading ? "…" : money(flightTotal)} tint="bg-[#e8f1ff]" />
        <Tile label="CIBIL amount" value={loading ? "…" : money(cibil?.totalAmount ?? 0)} tint="bg-[#e8f8ee]" />
        <Tile label="Customers" value={loading ? "…" : String(customers)} tint="bg-[#fff6e5]" />
        <Tile label="Agents" value={loading ? "…" : String(agents)} tint="bg-[#fff1f2]" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-3xl border border-[#e6ebf5] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">Flights split</h2>
              <p className="text-xs font-bold text-[#8b95a7]">Live Broget Pay → AO Pay / Broget fee</p>
            </div>
            <Link href="/flights" className="text-sm font-extrabold text-[#2f6bff]">
              Open desk
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Mini label="Customer paid" value={money(flightTotal)} />
            <Mini label="AO Pay" value={money(aoPay)} />
            <Mini label="Broget fee" value={money(brogetFee)} />
          </div>
          <div className="mt-4 divide-y divide-[#eef1f6]">
            {recentFlights.length === 0 && !loading ? (
              <p className="py-8 text-center text-sm font-semibold text-[#8b95a7]">No flight payments yet.</p>
            ) : null}
            {recentFlights.map((row) => (
              <div key={row.requestId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-[#12182b]">{row.travellerName || "Traveller"}</p>
                  <p className="truncate text-xs font-semibold text-[#8b95a7]">
                    {row.route || "—"} · {row.status}
                  </p>
                </div>
                <p className="shrink-0 font-extrabold text-[#2f6bff]">{money(row.moneyTo?.customerPaid ?? row.total)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#e6ebf5] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">CIBIL by agent</h2>
              <p className="text-xs font-bold text-[#8b95a7]">
                {cibil ? `${cibil.totalChecks} checks · ${reports} report rows` : "Wallet usage per agent"}
              </p>
            </div>
            <Link href="/cibil" className="text-sm font-extrabold text-[#16a34a]">
              Open desk
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Mini label="Collected" value={money(cibil?.totalAmount ?? 0)} />
            <Mini label="Silent agents" value={String(cibil?.silentAgents ?? 0)} />
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">Top by amount</p>
              {topAgents.length === 0 && !loading ? (
                <p className="rounded-xl bg-[#f8fafc] px-3 py-4 text-sm font-semibold text-[#8b95a7]">No CIBIL charges yet.</p>
              ) : null}
              <div className="divide-y divide-[#eef1f6] rounded-xl border border-[#eef1f6]">
                {topAgents.map((row) => (
                  <div key={row.agentMongoId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-extrabold text-[#12182b]">{row.name}</p>
                      <p className="text-xs font-bold text-[#8b95a7]">{row.checks} checks</p>
                    </div>
                    <p className="shrink-0 font-extrabold text-[#16a34a]">{money(row.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
            {silentAgents.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">No amount yet</p>
                <div className="flex flex-wrap gap-2">
                  {silentAgents.map((row) => (
                    <span key={row.agentMongoId} className="rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-extrabold text-[#b45309]">
                      {row.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Tile({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <article className={`rounded-2xl border border-white/60 p-4 ${tint}`}>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-extrabold">{label}</p>
    </article>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] px-3 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#8b95a7]">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#0b1f3a]">{value}</p>
    </div>
  );
}

function greeting(date: Date) {
  const hour = date.getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

function Kpi({ href, label, value, hint, tone }: { href: string; label: string; value: string; hint: string; tone: string }) {
  return (
    <Link href={href} className={`kpi-card group rounded-2xl border border-[#e6ebf5] bg-white p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-lg ${tone}`}>
      <p className="text-sm font-extrabold text-[#5c677a]">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#12182b]">{value}</p>
      <p className="mt-1 text-xs font-bold">{hint}</p>
    </Link>
  );
}
