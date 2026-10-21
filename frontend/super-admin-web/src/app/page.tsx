import type { ReactNode } from "react";
import Link from "next/link";
import { AgentCount, CreditCount, CustomerCount } from "@/components/agent-count";
import { DataTable } from "@/components/data-table";
import { flights, hotels } from "@/lib/desk";

const stats = [
  { label: "Flights", value: String(flights.length), tint: "bg-[#eaf1ff]", line: "#2f6bff", points: [2, 3, 2, 4, 3, 5, 4] },
  { label: "Hotels", value: String(hotels.length), tint: "bg-[#f3e8ff]", line: "#7c3aed", points: [1, 2, 2, 3, 2, 4, 5] },
  { label: "Customer List", value: "live", tint: "bg-[#fff6e5]", line: "#d97706", points: [3, 3, 4, 4, 5, 5, 5] },
  { label: "Check CIBIL Report", value: "live", tint: "bg-[#e8f8ee]", line: "#16a34a", points: [0, 1, 1, 1, 2, 2, 2] },
  { label: "Agents", value: "live", tint: "bg-[#fff1f2]", line: "#dc2626", points: [1, 1, 2, 2, 2, 3, 3] },
];

export default function HomePage() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Welcome back</h1>
          <p className="mt-1 text-sm font-semibold text-[#5c677a]">Customers and credit reports appear when an agent adds them.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/flights" className="rounded-2xl bg-[#2f6bff] p-4 text-white">
            <p className="text-lg font-extrabold">Flights + Hotels</p>
            <p className="mt-1 text-sm font-semibold text-[#d6e4ff]">Travel booking</p>
          </Link>
          <Link href="/cibil" className="rounded-2xl bg-[#16a34a] p-4 text-white">
            <p className="text-lg font-extrabold">Check CIBIL Report</p>
            <p className="mt-1 text-sm font-semibold text-[#dcfce7]">Every agent's report</p>
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <article key={stat.label} className={`rounded-2xl p-4 ${stat.tint}`}>
            <p className="text-3xl font-extrabold tracking-tight">
              {stat.label === "Agents" ? <AgentCount /> : stat.label === "Customer List" ? <CustomerCount /> : stat.label === "Check CIBIL Report" ? <CreditCount /> : stat.value}
            </p>
            <p className="mt-1 text-sm font-extrabold">{stat.label}</p>
            <Spark points={stat.points} color={stat.line} />
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Flights and Hotels" href="/flights" action="View flights">
          <LineChart />
        </ChartCard>
        <ChartCard title="Check CIBIL Report" href="/cibil" action="View checks">
          <BarChart />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Flights" href="/flights" action="View all">
          <DataTable compact columns={["Customer", "Route", "Airline", "Amount", "Status", "Date"]} rows={flights.slice(0, 4)} />
        </Panel>
        <Panel title="Hotels" href="/hotels" action="View all">
          <DataTable compact columns={["Customer", "Hotel", "Location", "Amount", "Status", "Date"]} rows={hotels.slice(0, 4)} />
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, href, action, children }: { title: string; href: string; action: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-extrabold">{title}</h2>
        <Link href={href} className="text-sm font-extrabold text-[#2f6bff]">{action}</Link>
      </div>
      {children}
    </section>
  );
}

function ChartCard({ title, href, action, children }: { title: string; href: string; action: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-[#e6ebf5] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-extrabold">{title}</h2>
        <Link href={href} className="text-sm font-extrabold text-[#2f6bff]">{action}</Link>
      </div>
      <p className="mb-2 text-xs font-bold text-[#8b95a7]">Sample · last 30 days</p>
      {children}
    </section>
  );
}

function Spark({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 88;
      const y = 28 - ((point - min) / (max - min || 1)) * 24;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 88 32" className="mt-3 h-8 w-full">
      <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function LineChart() {
  const flightsLine = [8, 12, 10, 16, 14, 18, 17, 22];
  const hotelsLine = [4, 6, 7, 6, 9, 11, 10, 13];
  return (
    <svg viewBox="0 0 320 140" className="h-44 w-full">
      <path d={line(flightsLine)} fill="none" stroke="#2f6bff" strokeWidth="3" />
      <path d={line(hotelsLine)} fill="none" stroke="#7c3aed" strokeWidth="3" />
    </svg>
  );
}

function line(points: number[]) {
  const max = 24;
  return points
    .map((point, index) => {
      const x = 16 + (index / (points.length - 1)) * 288;
      const y = 120 - (point / max) * 100;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function BarChart() {
  const groups = [
    [8, 4, 2],
    [10, 6, 3],
    [7, 8, 2],
    [12, 5, 4],
    [9, 7, 3],
    [14, 6, 2],
  ];
  return (
    <svg viewBox="0 0 320 140" className="h-44 w-full">
      {groups.map((bars, index) =>
        bars.map((bar, slot) => (
          <rect key={`${index}-${slot}`} x={24 + index * 48 + slot * 12} y={120 - bar * 7} width="8" height={bar * 7} rx="2" fill={["#16a34a", "#2f6bff", "#dc2626"][slot]} />
        )),
      )}
    </svg>
  );
}
