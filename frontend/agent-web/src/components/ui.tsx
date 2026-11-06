import Link from "next/link";
import type { ReactNode } from "react";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden className="shrink-0">
      <defs>
        <linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d8bff" />
          <stop offset="1" stopColor="#0047c2" />
        </linearGradient>
        <linearGradient id="bm-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bm-g)" />
      <rect x=".5" y=".5" width="39" height="20" rx="10.5" fill="url(#bm-h)" />
      <path d="M13 11h8.2c3.6 0 5.8 1.8 5.8 4.7 0 1.9-1 3.3-2.7 3.9 2.2.6 3.5 2.2 3.5 4.4 0 3.2-2.4 5-6.3 5H13zm4 7.3h3.6c1.6 0 2.5-.7 2.5-1.9s-.9-1.9-2.5-1.9H17zm0 7.2h4.1c1.7 0 2.7-.7 2.7-2s-1-2-2.7-2H17z" fill="#fff" />
    </svg>
  );
}

export function Logo({ tone = "dark", sub = "Agent", href = "/" }: { tone?: "light" | "dark"; sub?: string; href?: string }) {
  const onDark = tone === "light";
  return (
    <Link href={href} className="group flex items-center gap-2.5" aria-label="Broget AI home">
      <LogoMark />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className={`font-display text-[17px] font-bold tracking-tight ${onDark ? "text-white" : "text-ink"}`}>Broget AI</span>
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            onDark ? "bg-white/10 text-white/70" : "bg-brand-50 text-brand-700"
          }`}
        >
          {sub}
        </span>
      </span>
    </Link>
  );
}

export type ScoreBand = { label: string; color: string; bg: string; text: string };

export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null || !Number.isFinite(score) || score <= 0) return { label: "No score", color: "#94a3b8", bg: "bg-slate-100", text: "text-slate-600" };
  if (score >= 750) return { label: "Excellent", color: "#16a34a", bg: "bg-emerald-50", text: "text-emerald-700" };
  if (score >= 650) return { label: "Good", color: "#0066ff", bg: "bg-blue-50", text: "text-blue-700" };
  if (score >= 550) return { label: "Fair", color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700" };
  return { label: "Poor", color: "#dc2626", bg: "bg-red-50", text: "text-red-700" };
}

export function ScoreBadge({ score }: { score: number | null | undefined }) {
  const band = scoreBand(score);
  return <span className={`badge ${band.bg} ${band.text}`}>{band.label}</span>;
}

/** Semicircle gauge for a CIBIL score in the 300–900 range. */
export function ScoreGauge({ score, size = 220 }: { score: number | null | undefined; size?: number }) {
  const band = scoreBand(score);
  const valid = score != null && Number.isFinite(score) && score > 0;
  const pct = valid ? Math.min(1, Math.max(0, (Number(score) - 300) / 600)) : 0;
  const r = 80;
  const len = Math.PI * r;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size * 0.62 }}>
      <svg viewBox="0 0 200 120" className="h-full w-full">
        <defs>
          <linearGradient id="gauge-track" x1="0" x2="1">
            <stop offset="0%" stopColor="#fecaca" />
            <stop offset="40%" stopColor="#fde68a" />
            <stop offset="70%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#bbf7d0" />
          </linearGradient>
        </defs>
        <path d="M20 105 A80 80 0 0 1 180 105" fill="none" stroke="url(#gauge-track)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M20 105 A80 80 0 0 1 180 105"
          fill="none"
          stroke={band.color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${len * pct} ${len}`}
          style={{ transition: "stroke-dasharray 900ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-5xl font-bold leading-none tracking-tight text-ink">{valid ? score : "-"}</p>
        <p className="mt-1.5 text-xs font-semibold" style={{ color: band.color }}>
          {band.label}
        </p>
      </div>
      <span className="absolute -bottom-5 left-[6%] text-[10px] font-semibold text-subtle">300</span>
      <span className="absolute -bottom-5 right-[6%] text-[10px] font-semibold text-subtle">900</span>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">{icon}</span>
      <p className="mt-4 text-sm font-semibold text-ink">{title}</p>
      {body ? <p className="mt-1 max-w-xs text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  const palette = ["#0066ff", "#7c3aed", "#0891b2", "#16a34a", "#ea580c", "#db2777"];
  const color = palette[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % palette.length];
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}
