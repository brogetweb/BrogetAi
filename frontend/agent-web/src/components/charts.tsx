"use client";

import { useEffect, useRef, useState } from "react";

/* Chart tokens - recessive grid/axes, text in ink tokens, data in brand/status colours. */
const GRID = "#e7eaf0";
const AXIS = "#d7dce6";
const INK_2 = "#5b6577";
const INK_3 = "#8a93a5";
const BRAND = "#0066ff";

export type DayPoint = { key: string; label: string; full: string; value: number };

/** Builds the last `days` calendar days (oldest → today) and counts items per day. */
export function lastDays<T>(items: T[], getDate: (item: T) => string | undefined, days = 7, getValue: (item: T) => number = () => 1): DayPoint[] {
  const out: DayPoint[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      full: d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" }),
      value: 0,
    });
  }
  const index = new Map(out.map((p, i) => [p.key, i]));
  for (const item of items) {
    const raw = getDate(item);
    if (!raw) continue;
    const d = new Date(raw);
    d.setHours(0, 0, 0, 0);
    const i = index.get(d.toDateString());
    if (i != null) out[i].value += getValue(item);
  }
  return out;
}

function niceMax(max: number) {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => max <= s * 4) ?? pow * 10;
  return step * 4;
}

/** Single-series vertical bar chart with per-bar hover tooltip. Title names the series, so no legend. */
export function DailyBars({ data, format = (v) => String(v), unit }: { data: DayPoint[]; format?: (v: number) => string; unit: string }) {
  const [hover, setHover] = useState<number | null>(null);
  // Draw at the real container width so axis text stays 11px on phones instead of shrinking with the viewBox.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(560);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 420 ? 190 : 220;
  const pad = { t: 12, r: 8, b: 28, l: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const ticks = [0, max / 4, max / 2, (3 * max) / 4, max];
  const slot = innerW / data.length;
  const barW = Math.min(36, slot * 0.56);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div ref={box} className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block w-full" role="img" aria-label={`${unit} per day, last ${data.length} days. Total ${format(total)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={t === 0 ? AXIS : GRID} strokeWidth={1} strokeDasharray={t === 0 ? undefined : "3 4"} />
            <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={INK_3}>
              {Number.isInteger(t) ? t : t.toFixed(1)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = pad.l + slot * i + slot / 2;
          const top = y(d.value);
          const h = Math.max(0, pad.t + innerH - top);
          const r = Math.min(4, h);
          const x = cx - barW / 2;
          const base = pad.t + innerH;
          const active = hover === i;
          return (
            <g key={d.key}>
              {/* hover column - bigger than the mark */}
              <rect x={pad.l + slot * i} y={pad.t} width={slot} height={innerH} fill={active ? "rgba(0,102,255,0.05)" : "transparent"} rx={8} />
              {h > 0 ? (
                <path
                  d={`M${x},${base} L${x},${top + r} Q${x},${top} ${x + r},${top} L${x + barW - r},${top} Q${x + barW},${top} ${x + barW},${top + r} L${x + barW},${base} Z`}
                  fill={BRAND}
                  opacity={hover == null || active ? 1 : 0.45}
                  style={{ transition: "opacity 150ms" }}
                />
              ) : (
                <line x1={x} x2={x + barW} y1={base - 1} y2={base - 1} stroke={GRID} strokeWidth={2} strokeLinecap="round" />
              )}
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11" fill={active ? "#0a1020" : INK_3} fontWeight={active ? 600 : 400}>
                {d.label}
              </text>
              <rect
                x={pad.l + slot * i}
                y={0}
                width={slot}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                aria-label={`${d.full}: ${format(d.value)} ${unit}`}
                className="cursor-default outline-none"
              />
            </g>
          );
        })}
      </svg>
      {hover != null ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-white px-3 py-2 text-xs shadow-[var(--shadow-pop)]"
          style={{ left: `${((pad.l + slot * hover + slot / 2) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%`, marginTop: -8 }}
        >
          <p className="whitespace-nowrap font-medium text-muted">{data[hover].full}</p>
          <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap font-semibold text-ink">
            <span className="h-2 w-2 rounded-sm" style={{ background: BRAND }} />
            {format(data[hover].value)} {unit}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export type Band = { label: string; range: string; color: string; count: number };

/** Horizontal bars for CIBIL score bands. Band name + count are always visible (never colour alone). */
export function BandBars({ bands }: { bands: Band[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = bands.reduce((s, b) => s + b.count, 0);
  const max = Math.max(1, ...bands.map((b) => b.count));
  return (
    <ul className="space-y-3.5">
      {bands.map((band) => {
        const pct = total ? Math.round((band.count / total) * 100) : 0;
        const active = hover === band.label;
        return (
          <li
            key={band.label}
            onMouseEnter={() => setHover(band.label)}
            onMouseLeave={() => setHover(null)}
            className={`rounded-lg px-2 py-1.5 transition ${active ? "bg-soft" : ""}`}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-ink">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: band.color }} />
                {band.label}
                <span className="text-xs font-normal text-subtle">{band.range}</span>
              </span>
              <span className="tabular font-semibold text-ink">
                {band.count}
                <span className="ml-1.5 text-xs font-normal text-subtle">{active ? `${pct}%` : ""}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eef1f6]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(band.count / max) * 100}%`, background: band.color, transition: "width 700ms cubic-bezier(.2,.8,.2,1)" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Tiny trend line for stat tiles (decorative summary; the number beside it is the value). */
export function Sparkline({ values, color = BRAND, height = 36 }: { values: number[]; color?: string; height?: number }) {
  const W = 120;
  const H = height;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const pts = values.map((v, i) => [i * step, H - 3 - (v / max) * (H - 6)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const id = `spark-${color.replace("#", "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-7 w-20" aria-hidden preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export { INK_2 };
