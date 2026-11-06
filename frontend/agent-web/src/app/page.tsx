import Link from "next/link";
import type { ReactNode } from "react";
import { PublicFooter, PublicNav } from "@/components/public-chrome";
import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconDevices,
  IconDownload,
  IconFile,
  IconGauge,
  IconLock,
  IconShield,
  IconUsers,
  IconWallet,
} from "@/components/icons";
import { LogoMark, ScoreGauge } from "@/components/ui";

const steps = [
  { title: "Get your login", copy: "Your Super Admin creates your agent account - the same email and password as the mobile app.", icon: <IconLock size={18} /> },
  { title: "Add money", copy: "Top up your Broget Pay wallet over UPI from ₹300. Balance updates once payment confirms.", icon: <IconWallet size={18} /> },
  { title: "Add a customer", copy: "Save PAN, date of birth, mobile and email once to your shared customer book.", icon: <IconUsers size={18} /> },
  { title: "Run the check", copy: "Capture consent and OTP, see the score instantly and download the PDF report.", icon: <IconGauge size={18} /> },
];

const faqs = [
  ["Who can sign in to the agent panel?", "Only agents created by a Broget AI Super Admin. Use the same credentials as the agent mobile app."],
  ["How am I charged for a CIBIL check?", "Each check deducts one flat fee plus GST from your Broget Pay wallet. The exact amount is shown on your dashboard before you run a check."],
  ["Is my data shared with the mobile app?", "Yes. Customers, wallet balance and report history are the same on web and mobile - work wherever is convenient."],
  ["What happens if a payment is pending?", "Your balance only changes once Broget Pay confirms the payment. Use Refresh on the dashboard after you finish paying."],
  ["Is customer consent required?", "Always. A check can only run after the customer accepts consent and an OTP is entered."],
];

export default function LandingPage() {
  return (
    <div id="top" className="min-h-dvh bg-canvas text-ink">
      <PublicNav />

      {/* ================= Hero (compact, two-column) ================= */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="aurora absolute inset-0" />
        <div className="bg-grid mask-radial absolute inset-0 opacity-70" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-28 md:px-6 md:pb-20 md:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <span className="chip fade-up">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Agent panel is now live on the web
            </span>

            <h1 className="fade-up delay-1 mt-6 text-[2.4rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.4rem]">
              CIBIL checks, customers &amp; wallet - <span className="text-gradient">one desk.</span>
            </h1>

            <p className="fade-up delay-2 mx-auto mt-5 max-w-xl text-base leading-7 text-muted md:text-lg md:leading-8 lg:mx-0">
              Run consent-based credit checks, top up Broget Pay and download reports - synced with your mobile agent app.
            </p>

            <div className="fade-up delay-3 mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="/login" className="btn btn-primary btn-lg">
                Sign in to panel <IconArrowRight size={16} />
              </Link>
              <a href="#how" className="btn btn-secondary btn-lg">
                See how it works
              </a>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted lg:justify-start">
              {["Consent-first", "UPI top-ups", "Same login as mobile"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <IconCheck size={15} className="text-emerald-600" /> {item}
                </span>
              ))}
            </div>

            <dl className="mx-auto mt-9 grid max-w-md grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/70 py-4 shadow-[var(--shadow-xs)] backdrop-blur lg:mx-0">
              {[
                ["300–900", "Score range"],
                ["₹300", "Min. top-up"],
                ["1 login", "Web + mobile"],
              ].map(([value, label]) => (
                <div key={label} className="px-3 text-center">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-lg font-bold tracking-tight text-ink md:text-xl">{value}</dd>
                  <dd className="mt-0.5 text-xs text-subtle">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ================= Features (bento) ================= */}
      <section id="features" className="scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow="Features"
            title="Everything an agent needs, nothing they don't"
            copy="The jobs you already do on mobile - wallet, customers and CIBIL - laid out for a bigger screen."
          />

          <div className="mt-16 grid gap-4 md:grid-cols-6">
            <BentoCard
              className="md:col-span-4"
              icon={<IconGauge size={18} />}
              title="Instant CIBIL with clear score bands"
              copy="Consent, OTP and score in one guided flow. Poor, Fair, Good or Excellent - a result your customer understands at a glance."
            >
              <div className="grid items-center gap-6 sm:grid-cols-[1fr_1.1fr]">
                <div className="pt-4">
                  <ScoreGauge score={782} size={210} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Poor", "300–549", "bg-red-500"],
                    ["Fair", "550–649", "bg-amber-500"],
                    ["Good", "650–749", "bg-blue-500"],
                    ["Excellent", "750–900", "bg-emerald-500"],
                  ].map(([label, range, color]) => (
                    <div key={label} className="rounded-xl border border-line bg-soft/60 p-3">
                      <span className={`block h-1.5 w-8 rounded-full ${color}`} />
                      <p className="mt-2 text-sm font-semibold">{label}</p>
                      <p className="text-xs text-subtle">{range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2" icon={<IconWallet size={18} />} title="Broget Pay wallet" copy="Top up over UPI and see every credit and debit.">
              <div className="space-y-2">
                <MiniLedger credit label="Wallet top-up" amount="+₹2,000.00" />
                <MiniLedger label="Credit check" amount="−₹61.36" />
                <MiniLedger credit label="Wallet top-up" amount="+₹500.00" />
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2" icon={<IconUsers size={18} />} title="Shared customer book" copy="Save customer details once; use them on web and mobile.">
              <div className="space-y-2">
                {[
                  ["RK", "Rahul Kulkarni", "#0066ff"],
                  ["PS", "Priya Shinde", "#7c3aed"],
                  ["AM", "Amit More", "#0891b2"],
                ].map(([i, n, c]) => (
                  <div key={n} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
                    <span className="grid h-7 w-7 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: c }}>
                      {i}
                    </span>
                    <span className="flex-1 text-sm font-medium">{n}</span>
                    <span className="h-1.5 w-10 rounded-full bg-line" />
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2" icon={<IconFile size={18} />} title="PDF reports" copy="View the full report in-browser or download it for the lender.">
              <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
                <span className="grid h-11 w-9 place-items-center rounded-md bg-red-50 text-[9px] font-bold text-red-600 ring-1 ring-red-100">PDF</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">credit-report.pdf</p>
                  <p className="text-xs text-subtle">Ready to download</p>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
                  <IconDownload size={15} />
                </span>
              </div>
            </BentoCard>

            <BentoCard className="md:col-span-2" icon={<IconDevices size={18} />} title="Web + mobile" copy="One login, one wallet. Start in the field, finish at the desk.">
              <div className="flex items-end justify-center gap-3 pt-2">
                <div className="h-20 w-32 rounded-lg border border-line bg-white p-2 shadow-sm">
                  <div className="h-2 w-12 rounded bg-brand/70" />
                  <div className="mt-2 h-1.5 w-20 rounded bg-line" />
                  <div className="mt-1.5 h-1.5 w-16 rounded bg-line" />
                </div>
                <div className="h-24 w-12 rounded-xl border border-line bg-white p-1.5 shadow-sm">
                  <div className="h-1.5 w-6 rounded bg-brand/70" />
                  <div className="mt-1.5 h-1 w-8 rounded bg-line" />
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* ================= How it works ================= */}
      <section id="how" className="scroll-mt-24 border-y border-line bg-white px-4 py-24 md:px-6 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="How it works" title="From login to report in four steps" />
          <ol className="relative mt-16 grid gap-4 md:grid-cols-4">
            <span className="absolute left-[12.5%] right-[12.5%] top-[2.1rem] hidden h-px bg-[linear-gradient(90deg,transparent,var(--color-line-strong)_15%,var(--color-line-strong)_85%,transparent)] md:block" />
            {steps.map((step, index) => (
              <li key={step.title} className="relative text-center">
                <span className="relative mx-auto grid h-[4.25rem] w-[4.25rem] place-items-center rounded-2xl border border-line bg-white text-brand shadow-[var(--shadow-card)]">
                  {step.icon}
                  <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">{index + 1}</span>
                </span>
                <h3 className="mt-6 text-base font-semibold">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[15rem] text-sm leading-6 text-muted">{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= Trust + Pricing (dark) ================= */}
      <section id="pricing" className="noise relative scroll-mt-24 overflow-hidden bg-navy-900 px-4 py-24 text-white md:px-6 md:py-32">
        <div className="bg-grid-dark mask-radial absolute inset-0" />
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-brand/25 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow text-brand-400">Pricing & trust</p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.1] md:text-5xl">Pay per check. No subscription, no surprises.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">
              Load your Broget Pay wallet once and each CIBIL check is deducted from it - with the fee and GST shown before you run it.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { icon: <IconShield size={18} />, title: "Consent-first", copy: "No check runs without customer consent and OTP." },
                { icon: <IconLock size={18} />, title: "Secure sessions", copy: "Token-based sign-in tied to your agent account." },
                { icon: <IconWallet size={18} />, title: "Transparent ledger", copy: "Every top-up and deduction, line by line." },
                { icon: <IconFile size={18} />, title: "Report history", copy: "Re-download any past PDF in one click." },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-brand-400 ring-1 ring-white/10">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-sm text-white/55">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hairline-top relative rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)] backdrop-blur md:p-10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/70">Broget Pay wallet</p>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">Pay as you go</span>
            </div>
            <p className="mt-6 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold tracking-tight">₹0</span>
              <span className="text-white/50">/ month</span>
            </p>
            <p className="mt-2 text-sm text-white/55">Only pay for the checks you run. The per-check fee is set by Broget AI and shown on your dashboard.</p>
            <ul className="mt-8 space-y-3.5 border-t border-white/10 pt-8 text-sm">
              {["No setup or monthly fee", "Flat fee + 18% GST per credit check", "UPI top-ups from ₹300", "Full wallet ledger & PDF history"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                    <IconCheck size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/login" className="btn btn-lg mt-9 w-full bg-white text-ink hover:bg-white/90">
              Sign in and top up <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="scroll-mt-24 px-4 py-24 md:px-6 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHead align="left" eyebrow="FAQ" title="Questions agents ask" copy="Can't find what you're looking for? Reach out to your Super Admin." />
          </div>
          <div className="card divide-y divide-line overflow-hidden">
            {faqs.map(([q, a]) => (
              <details key={q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink">
                  {q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-muted transition duration-200 group-open:rotate-45 group-open:border-brand group-open:bg-brand group-open:text-white">
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-10 text-sm leading-6 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

/* ---------------------------------------------------------------------- */

function SectionHead({ eyebrow, title, copy, align = "center" }: { eyebrow: string; title: string; copy?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <p className="eyebrow text-brand">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold leading-[1.1] text-ink md:text-[2.75rem]">{title}</h2>
      {copy ? <p className="mt-4 text-base leading-7 text-muted md:text-lg">{copy}</p> : null}
    </div>
  );
}

function BentoCard({ className = "", icon, title, copy, children }: { className?: string; icon: ReactNode; title: string; copy: string; children: ReactNode }) {
  return (
    <div className={`card card-hover flex flex-col overflow-hidden ${className}`}>
      <div className="flex-1 bg-[linear-gradient(180deg,var(--color-soft),#fff)] p-5">{children}</div>
      <div className="border-t border-line p-6">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand ring-1 ring-brand-100">{icon}</span>
        <h3 className="mt-4 text-base font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-muted">{copy}</p>
      </div>
    </div>
  );
}

function MiniLedger({ credit, label, amount }: { credit?: boolean; label: string; amount: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5">
      <span className={`grid h-7 w-7 place-items-center rounded-full ${credit ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
        {credit ? <IconArrowDown size={13} /> : <IconArrowUp size={13} />}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className={`tabular text-sm font-semibold ${credit ? "text-emerald-600" : "text-ink"}`}>{amount}</span>
    </div>
  );
}

/** Compact hero visual - layered product cards with static sample data (illustrative only). */
function HeroVisual() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-[480px] sm:h-[430px]" aria-hidden>
      <div className="absolute inset-6 rounded-full bg-brand/25 blur-[80px]" />
      <div className="absolute right-0 top-10 h-40 w-40 rounded-full bg-[#7c3aed]/20 blur-[70px]" />

      {/* Balance card (back) */}
      <div className="noise absolute left-0 right-10 top-0 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#07122a_0%,#0b2a6b_50%,#0057e0_100%)] p-6 text-white shadow-[0_30px_70px_-25px_rgba(0,71,194,0.75)]">
        <div className="bg-grid-dark mask-radial absolute inset-0" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-white/70">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15">
                <IconWallet size={14} />
              </span>
              Broget Pay balance
            </span>
            <LogoMark size={26} />
          </div>
          <p className="font-display tabular mt-4 text-4xl font-bold tracking-tight">₹4,820.00</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10">
              <p className="text-white/55">Per check</p>
              <p className="tabular mt-0.5 font-semibold">Fee + GST</p>
            </div>
            <div className="rounded-xl bg-white/[0.08] px-3 py-2 ring-1 ring-white/10">
              <p className="text-white/55">Checks left</p>
              <p className="tabular mt-0.5 font-semibold">78</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score card (front) */}
      <div className="drift absolute bottom-0 right-0 w-[78%] rounded-3xl border border-line bg-white p-5 shadow-[0_40px_80px_-30px_rgba(10,16,32,0.45)] sm:w-[70%]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#7c3aed] text-xs font-semibold text-white">PS</span>
            <div>
              <p className="text-sm font-semibold text-ink">Priya Shinde</p>
              <p className="text-[11px] text-subtle">CIBIL report · just now</p>
            </div>
          </div>
          <span className="badge bg-emerald-50 text-emerald-700">Excellent</span>
        </div>
        <div className="mt-5">
          <ScoreGauge score={811} size={200} />
        </div>
        <div className="mt-7 flex items-center gap-2 rounded-xl bg-soft p-2.5">
          <span className="grid h-8 w-7 place-items-center rounded-md bg-red-50 text-[8px] font-bold text-red-600 ring-1 ring-red-100">PDF</span>
          <span className="flex-1 text-xs font-medium text-ink">credit-report.pdf</span>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">
            <IconDownload size={13} />
          </span>
        </div>
      </div>

      {/* Floating chips */}
      <div className="absolute -left-2 bottom-24 hidden items-center gap-2.5 rounded-2xl border border-line bg-white/95 py-2.5 pl-2.5 pr-4 shadow-[var(--shadow-pop)] backdrop-blur sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <IconCheck size={16} />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink">Top-up confirmed</p>
          <p className="text-[11px] text-subtle">+₹2,000 via UPI</p>
        </div>
      </div>
      <div className="absolute -left-4 bottom-4 hidden items-center gap-2.5 rounded-2xl border border-line bg-white/95 py-2.5 pl-2.5 pr-4 shadow-[var(--shadow-pop)] backdrop-blur md:flex">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand">
          <IconShield size={16} />
        </span>
        <div>
          <p className="text-xs font-semibold text-ink">Consent captured</p>
          <p className="text-[11px] text-subtle">OTP verified</p>
        </div>
      </div>
    </div>
  );
}
