import type { ReactNode } from "react";

export type Tone = "blue" | "green" | "violet" | "amber" | "rose" | "slate";

const tones: Record<Tone, { chip: string; bar: string; text: string; glow: string }> = {
  blue: { chip: "bg-[#eaf1ff] text-[#2f6bff]", bar: "from-[#5b8cff] to-[#2f6bff]", text: "text-[#2f6bff]", glow: "rgba(47,107,255,0.18)" },
  green: { chip: "bg-[#e8f8ee] text-[#16a34a]", bar: "from-[#34d399] to-[#16a34a]", text: "text-[#16a34a]", glow: "rgba(22,163,74,0.16)" },
  violet: { chip: "bg-[#f1ecff] text-[#7c3aed]", bar: "from-[#a78bfa] to-[#7c3aed]", text: "text-[#7c3aed]", glow: "rgba(124,58,237,0.16)" },
  amber: { chip: "bg-[#fff6e5] text-[#d97706]", bar: "from-[#fbbf24] to-[#d97706]", text: "text-[#b45309]", glow: "rgba(217,119,6,0.16)" },
  rose: { chip: "bg-[#fff1f2] text-[#e11d48]", bar: "from-[#fb7185] to-[#e11d48]", text: "text-[#be123c]", glow: "rgba(225,29,72,0.14)" },
  slate: { chip: "bg-[#f1f4f9] text-[#475569]", bar: "from-[#94a3b8] to-[#475569]", text: "text-[#5c677a]", glow: "rgba(71,85,105,0.12)" },
};

/** Guess a tone from the old per-page colour classes so every page shares one card design. */
export function toneFrom(classes = ""): Tone {
  const c = classes.toLowerCase();
  if (/16a34a|e8f8ee|dcfce7|emerald|green/.test(c)) return "green";
  if (/dc2626|fff1f2|e11d48|be123c|rose|red/.test(c)) return "rose";
  if (/b45309|d97706|fff6e5|fff7e8|amber/.test(c)) return "amber";
  if (/7c3aed|violet|purple/.test(c)) return "violet";
  if (/2f6bff|eaf1ff|e8f1ff|blue/.test(c)) return "blue";
  return "slate";
}

const defaultIcon = <path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6" />;

export function StatCard({ label, value, hint, tone = "blue", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: Tone; icon?: ReactNode }) {
  const t = tones[tone];
  return (
    <article
      className="stat-card relative overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white p-4 transition hover:-translate-y-0.5"
      style={{ boxShadow: `0 1px 2px rgba(18,24,43,.04), 0 12px 28px -18px ${t.glow}` }}
    >
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-extrabold text-[#5c677a]">{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${t.chip}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {icon ?? defaultIcon}
          </svg>
        </span>
      </div>
      <p className="mt-1 font-[Manrope] text-[28px] font-extrabold leading-tight tracking-tight text-[#12182b] tabular-nums">{value}</p>
      {hint ? <p className={`mt-1 text-xs font-bold ${t.text}`}>{hint}</p> : null}
    </article>
  );
}

/** Segmented tabs / filter chips. */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div role="tablist" className="inline-flex rounded-xl border border-[#e6ebf5] bg-[#f1f4f9] p-1">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${value === key ? "bg-white text-[#12182b] shadow-[0_1px_3px_rgba(18,24,43,0.12)]" : "text-[#5c677a] hover:text-[#12182b]"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Icons for stat cards. */
export const icons = {
  users: <path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M16 6.1a3 3 0 0 1 0 5.8" />,
  wallet: <path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h.01" />,
  rupee: <path d="M6 4h12M6 9h12M8 4c4 0 6 2 6 5s-2 5-6 5h-2l8 6" />,
  gauge: <path d="M12 14l3-3M4 18a9 9 0 1 1 16 0" />,
  check: <path d="M5 12.5 9.2 17 19 7" />,
  alert: <path d="M12 8v5M12 17h.01M10.3 3.9 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
  plane: <path d="M2 16l20-6-2-2-7 2-5-6H6l3 7-5 1-2-2-1 1 2 4z" />,
  clock: <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  file: <path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4v4h4" />,
};

/** Pick a stat icon from its label. */
export function iconFor(label: string) {
  const l = label.toLowerCase();
  if (/pending|wait|hold/.test(l)) return icons.clock;
  if (/inactive|blocked|silent|no cibil|failed|no amount/.test(l)) return icons.alert;
  if (/flight|order|ticket|booking|hotel/.test(l)) return icons.plane;
  if (/wallet|balance/.test(l)) return icons.wallet;
  if (/collected|amount|recharged|paid|revenue|fee|money|used/.test(l)) return icons.rupee;
  if (/check|cibil|score/.test(l)) return icons.gauge;
  if (/report|document|kyc/.test(l)) return icons.file;
  if (/active|verified|success/.test(l)) return icons.check;
  return icons.users;
}
