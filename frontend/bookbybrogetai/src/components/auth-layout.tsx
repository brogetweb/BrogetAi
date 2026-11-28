import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

const perks: [string, string][] = [
  ["Best fares, all airlines", "Compare IndiGo, Air India, Akasa, Vistara and more in one search."],
  ["Book in under a minute", "Your profile fills the ticket for you every time."],
  ["Trips & e-tickets in one place", "Download your e-ticket PDF anytime from My trips."],
];

/** Split-screen frame for Log in / Create profile. */
export function AuthLayout({ eyebrow, title, subtitle, notice, children }: { eyebrow: string; title: string; subtitle: string; notice?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-64px)] max-w-6xl items-stretch gap-0 px-4 py-8 md:py-12 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
      <aside className="relative hidden overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#0b1630_0%,#123a8f_55%,#1d5bff_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky/40 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-sun/30 blur-3xl" />
        <svg aria-hidden className="pointer-events-none absolute right-8 top-24 h-40 w-40 text-white/10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>
        <div className="relative">
          <p className="chip bg-white/10 text-white/90 ring-1 ring-white/15"><Icon name="plane" size={14} /> Book by Broget AI</p>
          <h2 className="mt-6 max-w-sm text-4xl font-extrabold leading-tight">Your next trip starts with one profile.</h2>
          <p className="mt-3 max-w-sm text-white/70">Join thousands of travellers booking smarter flights across India and abroad.</p>
        </div>
        <ul className="relative space-y-3">
          {perks.map(([t, c]) => (
            <li key={t} className="flex gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-brand">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" /></svg>
              </span>
              <span>
                <span className="block text-sm font-bold">{t}</span>
                <span className="block text-[13px] leading-5 text-white/65">{c}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex items-center justify-center">
        <div className="w-full max-w-[460px] rise">
          {notice}
          <div className="card p-6 sm:p-9">
            <p className="text-xs font-bold tracking-[.18em] text-brand">{eyebrow}</p>
            <h1 className="mt-2 text-[28px] font-extrabold leading-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-subtle">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6l-8-3z" /></svg>
            Your details are encrypted and never shared.
          </p>
        </div>
      </section>
    </div>
  );
}

const icons = {
  user: <path d="M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  lock: <path d="M6 10V8a6 6 0 1 1 12 0v2M5 10h14v10H5z" />,
  pin: <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
};

/** Input with a leading icon and an optional trailing action (e.g. Show password). */
export function IconField({
  label,
  icon,
  hint,
  action,
  ...input
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: keyof typeof icons; hint?: string; action?: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[13px] font-semibold text-ink">
        {label}
        {action}
      </span>
      <span className="relative mt-1.5 block">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[icon]}</svg>
        <input {...input} className="w-full rounded-xl border border-line bg-soft/60 py-3 pl-11 pr-3.5 text-[15px] font-medium text-ink outline-none transition placeholder:text-subtle hover:border-[#cfd8e8] focus:border-brand focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,91,255,.12)]" />
      </span>
      {hint ? <span className="mt-1 block text-xs text-subtle">{hint}</span> : null}
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="9" /></svg>
      {message}
    </p>
  );
}
