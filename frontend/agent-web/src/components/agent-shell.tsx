"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  AgentAccount,
  createCustomer,
  checkTopup,
  verifyRazorpayPayment,
  createTopup,
  Customer,
  CreditCheck,
  downloadCreditPdf,
  fetchCreditPdf,
  listCreditChecks,
  listCustomers,
  logout,
  requestCreditReport,
  restoreSession,
  TopupResult,
  validateTopup,
  walletSnapshot,
  WalletSnapshot,
} from "@/lib/api";
import {
  IconAlert,
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconDownload,
  IconExternal,
  IconEye,
  IconFile,
  IconGauge,
  IconHome,
  IconLogout,
  IconMenu,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShield,
  IconUsers,
  IconWallet,
  IconX,
} from "@/components/icons";
import { Avatar, EmptyState, Logo, ScoreBadge, ScoreGauge, scoreBand } from "@/components/ui";
import { BandBars, DailyBars, lastDays, Sparkline } from "@/components/charts";
import { Toaster, useToasts } from "@/components/toast";
import { LedgerTable } from "@/components/ledger-table";

type Tab = "home" | "customers" | "cibil" | "checks" | "wallet";
type Notify = (ok: boolean, title: string, detail?: string) => void;
type WalletState = { wallet: WalletSnapshot | null; loading: boolean; reload: () => Promise<void> };

const nav: { id: Tab; label: string; hint: string; icon: ReactNode }[] = [
  { id: "home", label: "Dashboard", hint: "Overview of your desk", icon: <IconHome /> },
  { id: "customers", label: "Customers", hint: "Your saved customer book", icon: <IconUsers /> },
  { id: "cibil", label: "CIBIL check", hint: "Run a new credit report", icon: <IconGauge /> },
  { id: "checks", label: "Reports", hint: "All credit checks you have run", icon: <IconFile /> },
  { id: "wallet", label: "Wallet", hint: "Broget Pay balance and ledger", icon: <IconWallet /> },
];

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ======================================================================= */
/* Shell                                                                    */
/* ======================================================================= */

export function AgentShell() {
  const router = useRouter();
  const [user, setUser] = useState<AgentAccount | null>(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState<Tab>("home");
  const [menu, setMenu] = useState(false);
  const [checkFor, setCheckFor] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const { toasts, notify, dismiss, remove } = useToasts();
  const mainRef = useRef<HTMLElement>(null);

  // State updates happen only in promise callbacks, so this is safe to call from an effect.
  const fetchWallet = useCallback(
    () =>
      walletSnapshot()
        .then(setWallet)
        .catch((error) => notify(false, "Wallet", error instanceof Error ? error.message : "Failed"))
        .finally(() => setWalletLoading(false)),
    [notify],
  );

  const reloadWallet = useCallback(async () => {
    setWalletLoading(true);
    await fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    restoreSession()
      .then((account) => {
        if (!account) {
          router.replace("/login");
          return;
        }
        setUser(account);
      })
      .finally(() => setBooting(false));
  }, [router]);

  useEffect(() => {
    if (user) void fetchWallet();
  }, [user, fetchWallet]);

  const go = useCallback((next: Tab) => {
    setTab(next);
    setMenu(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, []);

  const startCheck = useCallback(
    (customerId?: string) => {
      setCheckFor(customerId ?? null);
      go("cibil");
    },
    [go],
  );

  if (booting || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-soft">
        <div className="flex flex-col items-center gap-4">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
          <p className="text-sm font-medium text-subtle">Loading your panel…</p>
        </div>
      </div>
    );
  }

  const current = nav.find((item) => item.id === tab) ?? nav[0];
  const walletState: WalletState = { wallet, loading: walletLoading, reload: reloadWallet };

  return (
    <div className="h-dvh overflow-hidden bg-soft text-ink">
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setMenu(false)}
        className={`fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px] transition-opacity lg:hidden ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] max-w-[86vw] flex-col bg-[linear-gradient(180deg,#07122a_0%,#0a1a3a_60%,#0b2150_100%)] text-white transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:translate-x-0 ${
          menu ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo tone="light" sub="Agent" href="/app" />
          <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden">
            <IconX size={18} />
          </button>
        </div>

        <div className="px-3">
          <button type="button" onClick={() => startCheck()} className="btn btn-primary w-full">
            <IconPlus size={16} /> New CIBIL check
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/35">Menu</p>
          <div className="space-y-0.5">
            {nav.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (item.id === "cibil" ? startCheck() : go(item.id))}
                  aria-current={active ? "page" : undefined}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    active ? "bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-white/10" : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className={active ? "text-[#7cb2ff]" : "text-white/40 group-hover:text-white/80"}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {active ? <span className="h-1.5 w-1.5 rounded-full bg-[#7cb2ff] shadow-[0_0_10px_2px_rgba(124,178,255,0.7)]" /> : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="space-y-3 p-3">
          <div className="noise relative overflow-hidden rounded-xl bg-[linear-gradient(140deg,#0057e0,#2563eb_55%,#7c3aed)] p-4 text-white shadow-[0_12px_30px_-10px_rgba(0,87,224,0.7)]">
            <div className="bg-grid-dark absolute inset-0 opacity-50" />
            <div className="relative">
              <p className="flex items-center gap-1.5 text-xs text-white/60">
                <IconWallet size={13} /> Broget Pay
              </p>
              <p className="font-display tabular mt-1 text-xl font-bold">{walletLoading && !wallet ? "…" : money(wallet?.balance ?? 0)}</p>
              <button type="button" onClick={() => go("wallet")} className="mt-3 inline-flex h-7 items-center gap-1 rounded-md bg-white px-2.5 text-xs font-semibold text-ink hover:bg-white/90">
                <IconPlus size={12} /> Add money
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <Avatar name={user.name || user.email} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
            <button
              type="button"
              title="Log out"
              aria-label="Log out"
              onClick={() => {
                void logout();
                router.replace("/login");
              }}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/50 transition hover:bg-red-500/15 hover:text-red-300"
            >
              <IconLogout size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex h-dvh flex-col lg:pl-[260px]">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white/80 px-4 backdrop-blur-xl backdrop-saturate-150 md:px-8">
          <button type="button" className="btn btn-secondary h-9 w-9 p-0 lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <IconMenu size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <span className="hidden text-subtle sm:inline">Agent desk</span>
            <span className="hidden text-line-strong sm:inline">/</span>
            <span className="truncate font-semibold text-ink">{current.label}</span>
          </div>
          <button
            type="button"
            onClick={() => go("wallet")}
            className="hidden h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold shadow-[var(--shadow-xs)] transition hover:bg-soft md:inline-flex"
          >
            <span className={`h-2 w-2 rounded-full ${wallet?.lowBalance ? "bg-amber-500" : "bg-emerald-500"}`} />
            <span className="tabular">{walletLoading && !wallet ? "…" : money(wallet?.balance ?? 0)}</span>
          </button>
          <Link href="/" className="btn btn-ghost btn-sm hidden h-9 xl:inline-flex" title="Public site">
            <IconExternal size={15} /> Website
          </Link>
          <span className="hidden sm:block">
            <Avatar name={user.name || user.email} size={32} />
          </span>
        </header>

        <main ref={mainRef} className="panel-scroll min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div key={tab} className="view-in stagger mx-auto max-w-6xl">
            {tab === "home" ? <HomeTab user={user} walletState={walletState} notify={notify} go={go} startCheck={startCheck} /> : null}
            {tab === "customers" ? <CustomersTab notify={notify} startCheck={startCheck} /> : null}
            {tab === "cibil" ? <CibilTab notify={notify} walletState={walletState} initialCustomerId={checkFor} go={go} /> : null}
            {tab === "checks" ? <ChecksTab notify={notify} startCheck={startCheck} /> : null}
            {tab === "wallet" ? <WalletTab user={user} walletState={walletState} notify={notify} /> : null}
          </div>
        </main>
      </div>

      <Toaster toasts={toasts} onDismiss={dismiss} onRemove={remove} />
    </div>
  );
}

/* ======================================================================= */
/* Shared bits                                                              */
/* ======================================================================= */

function PageHeader({ title, description, actions, icon }: { title: string; description?: string; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-line bg-white px-5 py-5 shadow-[var(--shadow-card)] md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_140%_at_100%_0%,rgba(0,102,255,0.10),transparent_60%),radial-gradient(35%_120%_at_70%_120%,rgba(124,58,237,0.07),transparent_60%)]" />
      <div className="bg-dots pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-50 [mask-image:linear-gradient(to_left,black,transparent)]" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {icon ? (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,#3d8bff,#0047c2)] text-white shadow-[var(--shadow-brand)]">{icon}</span>
          ) : null}
          <div>
            <h2 className="text-xl font-bold text-ink md:text-2xl">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  foot,
  spark,
  accent,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: string;
  foot?: string;
  spark?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="card card-hover relative overflow-hidden p-4 md:p-5">
      {accent ? <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} /> : null}
      {accent ? <span className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.08] blur-2xl" style={{ background: accent }} /> : null}
      <div className="relative flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-muted">{label}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl shadow-sm ${tone}`}>{icon}</span>
      </div>
      <p className="font-display tabular relative mt-3 truncate text-[1.5rem] font-bold leading-none tracking-tight text-ink md:text-[1.7rem]">{value}</p>
      <div className="relative mt-2 flex items-end justify-between gap-3">
        {foot ? <p className="min-w-0 truncate text-xs text-subtle">{foot}</p> : <span />}
        {spark ? <span className="hidden shrink-0 sm:block">{spark}</span> : null}
      </div>
    </div>
  );
}

function MiniStats({ items }: { items: { label: string; value: string; dot: string }[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card flex items-center gap-3 px-4 py-3.5">
          <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: item.dot }} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-subtle">{item.label}</p>
            <p className="font-display tabular text-xl font-bold leading-tight text-ink">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative block w-full sm:w-72">
      <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-9" />
    </label>
  );
}

function RowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-4">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
          <div className="skeleton h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  const tone =
    /success|complete|paid|done|ready|credited/.test(s)
      ? "bg-emerald-50 text-emerald-700"
      : /fail|error|reject|cancel/.test(s)
        ? "bg-red-50 text-red-700"
        : /pending|process|init|created/.test(s)
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";
  return <span className={`badge capitalize ${tone}`}>{status || "-"}</span>;
}

function Modal({ title, description, onClose, children }: { title: string; description?: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to <body> so the overlay covers the sidebar/header (tab wrapper animates with transform).
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" />
      <div className="fade-up relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            {description ? <p className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-soft hover:text-ink">
            <IconX size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/* ======================================================================= */
/* Dashboard                                                                */
/* ======================================================================= */

const BAND_DEFS = [
  { label: "Excellent", range: "750–900", color: "#16a34a", min: 750, max: 901 },
  { label: "Good", range: "650–749", color: "#0066ff", min: 650, max: 750 },
  { label: "Fair", range: "550–649", color: "#f59e0b", min: 550, max: 650 },
  { label: "Poor", range: "300–549", color: "#dc2626", min: 1, max: 550 },
];

function HomeTab({
  user,
  walletState,
  notify,
  go,
  startCheck,
}: {
  user: AgentAccount;
  walletState: WalletState;
  notify: Notify;
  go: (t: Tab) => void;
  startCheck: (id?: string) => void;
}) {
  const { wallet, loading, reload } = walletState;
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [checks, setChecks] = useState<CreditCheck[] | null>(null);

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch(() => setCustomers([]));
    listCreditChecks()
      .then(setChecks)
      .catch((error) => {
        setChecks([]);
        notify(false, "Reports", error instanceof Error ? error.message : "Failed");
      });
  }, [notify]);

  const scored = (checks ?? []).filter((c) => c.score != null && c.score > 0);
  const avg = scored.length ? Math.round(scored.reduce((s, c) => s + Number(c.score), 0) / scored.length) : null;
  const firstName = (user.name || "").split(/\s+/)[0] || "Agent";
  const checksLeft = wallet && wallet.charge > 0 ? Math.floor(wallet.balance / wallet.charge) : null;

  const reportsByDay = useMemo(() => lastDays(checks ?? [], (c) => c.createdAt), [checks]);
  const spentByDay = useMemo(
    () =>
      lastDays(
        (wallet?.entries ?? []).filter((e) => e.kind !== "topup" && e.status === "success"),
        (e) => e.createdAt,
        7,
        (e) => e.amount,
      ),
    [wallet],
  );
  const weekReports = reportsByDay.reduce((s, d) => s + d.value, 0);
  const bands = BAND_DEFS.map((b) => ({ ...b, count: scored.filter((c) => Number(c.score) >= b.min && Number(c.score) < b.max).length }));
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      {/* ===== Hero banner ===== */}
      <section className="noise relative overflow-hidden rounded-3xl bg-[linear-gradient(125deg,#07122a_0%,#0b2a6b_45%,#0057e0_80%,#3b82f6_100%)] text-white shadow-[0_30px_70px_-30px_rgba(0,71,194,0.8)]">
        <div className="bg-grid-dark mask-radial absolute inset-0" />
        <div className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[#7c3aed]/30 blur-[90px]" />
        <div className="absolute -bottom-32 right-20 h-80 w-80 rounded-full bg-[#22a6f2]/30 blur-[100px]" />
        <svg className="absolute -right-10 top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 text-white/[0.07] xl:block" viewBox="0 0 200 200" aria-hidden>
          <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-400" /> {today}
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-[2.5rem]">
              {greeting()}, {firstName}
            </h2>
            <p className="mt-2 max-w-md text-[15px] text-white/70">
              {weekReports > 0
                ? `You ran ${weekReports} credit check${weekReports === 1 ? "" : "s"} in the last 7 days. Keep the momentum going.`
                : "Your desk is ready. Add a customer and run your first CIBIL check."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => startCheck()} className="btn btn-lg bg-white text-ink shadow-xl hover:bg-white/90">
                <IconGauge size={17} /> Run CIBIL check
              </button>
              <button type="button" onClick={() => go("customers")} className="btn btn-lg bg-white/10 text-white ring-1 ring-white/20 backdrop-blur hover:bg-white/15">
                <IconUsers size={17} /> Add customer
              </button>
            </div>
          </div>

          {/* Glass balance card */}
          <div className="hairline-top relative rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-6">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-white/75">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15">
                  <IconWallet size={15} />
                </span>
                Broget Pay balance
              </p>
              <button type="button" onClick={() => void reload()} aria-label="Refresh balance" className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
                <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
            <p className="font-display tabular mt-3 text-4xl font-bold tracking-tight md:text-[2.75rem]">{loading && !wallet ? "…" : money(wallet?.balance ?? 0)}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white/[0.07] px-3 py-2.5 ring-1 ring-white/10">
                <p className="text-white/55">Per check</p>
                <p className="tabular mt-0.5 text-sm font-semibold">{money(wallet?.charge ?? 0)}</p>
              </div>
              <div className="rounded-xl bg-white/[0.07] px-3 py-2.5 ring-1 ring-white/10">
                <p className="text-white/55">Checks left</p>
                <p className="tabular mt-0.5 text-sm font-semibold">{checksLeft ?? "-"}</p>
              </div>
            </div>
            <button type="button" onClick={() => go("wallet")} className="btn mt-4 w-full bg-white text-ink hover:bg-white/90">
              <IconPlus size={16} /> Add money
            </button>
          </div>
        </div>
      </section>

      {wallet?.lowBalance ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-[linear-gradient(90deg,#fffbeb,#fff7ed)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-sm font-medium text-amber-900">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <IconAlert size={18} />
            </span>
            Low balance - add at least {money(wallet.charge)} before your next CIBIL check.
          </p>
          <button type="button" onClick={() => go("wallet")} className="btn bg-amber-600 text-white hover:bg-amber-700">
            Add money
          </button>
        </div>
      ) : null}

      {/* ===== KPIs ===== */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <StatCard
          label="Customers"
          value={customers ? String(customers.length) : "…"}
          icon={<IconUsers size={18} />}
          tone="bg-[linear-gradient(140deg,#3d8bff,#0047c2)] text-white"
          accent="#0066ff"
          foot="In your customer book"
        />
        <StatCard
          label="Reports run"
          value={checks ? String(checks.length) : "…"}
          icon={<IconFile size={18} />}
          tone="bg-[linear-gradient(140deg,#a78bfa,#6d28d9)] text-white"
          accent="#7c3aed"
          foot={`${weekReports} in the last 7 days`}
          spark={<Sparkline values={reportsByDay.map((d) => d.value)} color="#7c3aed" />}
        />
        <StatCard
          label="Average score"
          value={checks ? (avg != null ? String(avg) : "-") : "…"}
          icon={<IconGauge size={18} />}
          tone="bg-[linear-gradient(140deg,#34d399,#059669)] text-white"
          accent="#16a34a"
          foot={avg != null ? `${scoreBand(avg).label} · across ${scored.length} reports` : "No scored reports yet"}
        />
        <StatCard
          label="Spent on checks"
          value={money(wallet?.spent ?? 0)}
          icon={<IconArrowUp size={18} />}
          tone="bg-[linear-gradient(140deg,#fb923c,#ea580c)] text-white"
          accent="#ea580c"
          foot={`Added ${money(wallet?.added ?? 0)} in total`}
          spark={<Sparkline values={spentByDay.map((d) => d.value)} color="#ea580c" />}
        />
      </div>

      {/* ===== Charts ===== */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">Credit checks · last 7 days</h3>
              <p className="mt-0.5 text-sm text-muted">Reports you ran each day</p>
            </div>
            <div className="text-right">
              <p className="font-display tabular text-2xl font-bold text-ink">{checks ? weekReports : "…"}</p>
              <p className="text-xs text-subtle">this week</p>
            </div>
          </div>
          <div className="mt-5">{checks ? <DailyBars data={reportsByDay} unit={weekReports === 1 ? "check" : "checks"} /> : <div className="skeleton h-52 w-full" />}</div>
        </section>

        <section className="card p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-ink">Score bands</h3>
              <p className="mt-0.5 text-sm text-muted">How your customers score</p>
            </div>
            {avg != null ? <ScoreBadge score={avg} /> : null}
          </div>
          <div className="mt-5">
            {!checks ? (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-9 w-full" />
                ))}
              </div>
            ) : scored.length === 0 ? (
              <EmptyState icon={<IconGauge size={22} />} title="No scores yet" body="Score bands appear after your first report." />
            ) : (
              <BandBars bands={bands} />
            )}
          </div>
        </section>
      </div>

      {/* ===== Quick actions ===== */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Run a CIBIL check", hint: "Consent and instant score", icon: <IconGauge size={20} />, onClick: () => startCheck(), grad: "from-emerald-500 to-teal-600", glow: "group-hover:shadow-emerald-500/20" },
          { label: "Add a customer", hint: "Save PAN, DOB and contact", icon: <IconUsers size={20} />, onClick: () => go("customers"), grad: "from-blue-500 to-indigo-600", glow: "group-hover:shadow-blue-500/20" },
          { label: "Download reports", hint: "View or save past PDFs", icon: <IconDownload size={20} />, onClick: () => go("checks"), grad: "from-violet-500 to-fuchsia-600", glow: "group-hover:shadow-violet-500/20" },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={`card card-hover group flex items-center gap-4 p-4 text-left shadow-lg shadow-transparent ${action.glow}`}
          >
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${action.grad} text-white shadow-md`}>{action.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">{action.label}</span>
              <span className="block truncate text-xs text-subtle">{action.hint}</span>
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-soft text-subtle transition group-hover:bg-ink group-hover:text-white">
              <IconArrowRight size={15} />
            </span>
          </button>
        ))}
      </div>

      {/* ===== Recent lists ===== */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <div className="panel-head">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-violet-600">
                <IconFile size={16} />
              </span>
              <h3 className="text-sm font-semibold">Recent reports</h3>
            </div>
            <button type="button" onClick={() => go("checks")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-50">
              View all <IconArrowRight size={13} />
            </button>
          </div>
          {!checks ? <RowsSkeleton rows={3} /> : null}
          {checks && checks.length === 0 ? <EmptyState icon={<IconGauge size={22} />} title="No reports yet" body="Run your first CIBIL check to see it here." /> : null}
          <div className="divide-y divide-line">
            {(checks ?? []).slice(0, 5).map((row) => {
              const band = scoreBand(row.score);
              return (
                <div key={row.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-soft/60">
                  <Avatar name={row.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{row.name}</p>
                    <p className="truncate text-xs text-subtle">{shortDate(row.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={row.score} />
                    <span className="grid h-11 w-11 place-items-center rounded-full text-sm font-bold" style={{ background: `conic-gradient(${band.color} ${row.score ? ((Number(row.score) - 300) / 600) * 360 : 0}deg, #eef1f6 0deg)` }}>
                      <span className="tabular grid h-9 w-9 place-items-center rounded-full bg-white text-[12px] text-ink">{row.score ?? "-"}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="panel-head">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand">
                <IconWallet size={16} />
              </span>
              <h3 className="text-sm font-semibold">Wallet activity</h3>
            </div>
            <button type="button" onClick={() => go("wallet")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand hover:bg-brand-50">
              View ledger <IconArrowRight size={13} />
            </button>
          </div>
          {loading && !wallet ? <RowsSkeleton rows={3} /> : null}
          {wallet && wallet.entries.length === 0 ? <EmptyState icon={<IconWallet size={22} />} title="No wallet movement yet" body="Add money through Broget Pay to get started." /> : null}
          <LedgerRows entries={(wallet?.entries ?? []).slice(0, 5)} />
        </section>
      </div>
    </div>
  );
}

function LedgerRows({ entries }: { entries: WalletSnapshot["entries"] }) {
  return (
    <div className="divide-y divide-line">
      {entries.map((row) => {
        const credit = row.kind === "topup";
        return (
          <div key={row.id} className="flex items-center gap-3 px-5 py-3.5">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${credit ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>
              {credit ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{row.kind === "usage" ? "Credit check" : row.kind === "topup" ? "Wallet top-up" : row.kind}</p>
              <p className="truncate text-xs text-subtle">{row.note || shortDate(row.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${credit ? "text-emerald-600" : "text-ink"}`}>
                {credit ? "+" : "−"}
                {money(row.amount)}
              </p>
              <div className="mt-1">
                <StatusPill status={row.status} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ======================================================================= */
/* Wallet                                                                   */
/* ======================================================================= */

function WalletTab({ user, walletState, notify }: { user: AgentAccount; walletState: WalletState; notify: Notify }) {
  const { wallet, loading, reload } = walletState;
  const [amount, setAmount] = useState("500");
  const [mobile, setMobile] = useState(() => {
    const digits = (user.phone || "").replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : "";
  });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ amount: number; link: TopupResult } | null>(null);

  // Mirrors AddMoneyPage.next() in the agent mobile app: validate → POST /wallet/topups → show the pay screen.
  async function topup(event: FormEvent) {
    event.preventDefault();
    const value = Number(amount.trim());
    const phone = mobile.trim();
    const invalid = validateTopup(value, phone);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPaying(true);
    setError(null);
    try {
      const link = await createTopup(value, phone);
      setPayment({ amount: value, link });
      void reload();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Try again";
      setError(message);
      notify(false, "Top-up failed", message);
      void reload();
    } finally {
      setPaying(false);
    }
  }

  const pendingTopups = (wallet?.entries ?? []).filter((e) => e.kind === "topup" && (e.status || "").toLowerCase() === "pending");
  const checksLeft = wallet && wallet.charge > 0 ? Math.floor(wallet.balance / wallet.charge) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        icon={<IconWallet size={22} />}
        description="Top up with Razorpay and track every credit and debit."
        actions={
          <button type="button" onClick={() => void reload()} className="btn btn-secondary">
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 md:gap-4">
        <StatCard
          label="Current balance"
          value={money(wallet?.balance ?? 0)}
          icon={<IconWallet size={18} />}
          tone="bg-[linear-gradient(140deg,#3d8bff,#0047c2)] text-white"
          accent="#0066ff"
          foot={checksLeft != null ? `Enough for ${checksLeft} check${checksLeft === 1 ? "" : "s"}` : undefined}
        />
        <StatCard label="Total added" value={money(wallet?.added ?? 0)} icon={<IconArrowDown size={18} />} tone="bg-[linear-gradient(140deg,#34d399,#059669)] text-white" accent="#16a34a" foot="Successful top-ups" />
        <StatCard label="Total used" value={money(wallet?.spent ?? 0)} icon={<IconArrowUp size={18} />} tone="bg-[linear-gradient(140deg,#fb923c,#ea580c)] text-white" accent="#ea580c" foot="CIBIL checks and withdrawals" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,420px)_1fr]">
        <form onSubmit={topup} className="card h-fit p-6">
          <h3 className="text-base font-semibold">Add money</h3>
          <p className="mt-1 text-sm text-muted">Pay with UPI, cards, net banking or wallets. Your balance updates as soon as Razorpay confirms the payment.</p>

          <label className="mt-5 block">
            <span className="field-label">Amount</span>
            <span className="relative block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-subtle">₹</span>
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^\d.]/g, ""));
                  setError(null);
                }}
                inputMode="decimal"
                className="input pl-8 text-base font-semibold"
              />
            </span>
            <span className="mt-1.5 block text-xs text-subtle">Minimum ₹300 · maximum ₹5,00,000 per payment</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {[500, 1000, 2000, 5000].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  amount === String(value) ? "border-brand bg-brand-50 text-brand" : "border-line bg-white text-muted hover:border-[#cfd8e8]"
                }`}
              >
                ₹{value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="field-label">Mobile number (for UPI)</span>
            <span className="relative block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-subtle">+91</span>
              <input
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
                inputMode="numeric"
                placeholder="10-digit mobile"
                className="input pl-12"
              />
            </span>
          </label>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] leading-5 text-amber-900">
            <p className="font-semibold">Razorpay secure checkout</p>
            <p className="mt-1">The Razorpay window opens on this page. This wallet updates only after Razorpay confirms the payment.</p>
          </div>

          {error ? (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
              <IconAlert size={16} className="mt-0.5 shrink-0" />
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={paying} className="btn btn-primary btn-lg mt-5 w-full">
            {paying ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Creating payment…
              </>
            ) : (
              `Proceed to pay ${Number(amount) ? money(Number(amount)) : ""}`
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-subtle">
            <IconShield size={14} /> Secured by Razorpay
          </p>
        </form>

        <section className="card flex flex-col p-6">
          <h3 className="text-base font-semibold">Fee &amp; balance</h3>
          <p className="mt-1 text-sm text-muted">What each CIBIL check costs from this wallet.</p>
          <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">
            {[
              ["CIBIL check fee", money(wallet?.fee ?? 0)],
              ["GST", money(wallet?.gst ?? 0)],
              ["Total per check", money(wallet?.charge ?? 0)],
              ["Checks you can run now", checksLeft != null ? String(checksLeft) : "-"],
              ["Pending top-ups", pendingTopups.length ? `${pendingTopups.length} · ${money(pendingTopups.reduce((t, e) => t + e.amount, 0))}` : "None"],
            ].map(([k, v], i) => (
              <div key={k} className={`flex items-center justify-between px-4 py-3 ${i === 2 ? "bg-brand-50/60" : "odd:bg-white even:bg-[#fafbfd]"}`}>
                <dt className={i === 2 ? "font-semibold text-ink" : "text-muted"}>{k}</dt>
                <dd className={`tabular font-semibold ${i === 2 ? "text-brand-700" : "text-ink"}`}>{v}</dd>
              </div>
            ))}
          </dl>

          <h4 className="mt-6 text-sm font-semibold text-ink">How a top-up works</h4>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Enter amount", "Minimum ₹300 and a UPI mobile number."],
              ["Pay securely", "UPI, card, net banking or wallet in the Razorpay window."],
              ["Balance updates", "Instantly, once Razorpay confirms."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-xl border border-line bg-soft/60 p-3.5">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">{i + 1}</span>
                <p className="mt-2.5 text-sm font-semibold text-ink">{t}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <LedgerTable entries={wallet?.entries ?? null} loading={loading} notify={notify} />

      {payment ? (
        <RazorpayPayDialog
          amount={payment.amount}
          link={payment.link}
          walletState={walletState}
          notify={notify}
          onClose={() => {
            setPayment(null);
            void reload();
          }}
        />
      ) : null}
    </div>
  );
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
const RZP_BLUE = "#0b5cff";

type RazorpayHandlerResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (payload: { error?: { description?: string } }) => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

let razorpayLoader: Promise<RazorpayCtor> | null = null;

/** Loads Razorpay Checkout once per page. */
function loadRazorpay(): Promise<RazorpayCtor> {
  const existing = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
  if (existing) return Promise.resolve(existing);
  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => {
        const ctor = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
        if (ctor) resolve(ctor);
        else reject(new Error("Razorpay did not load."));
      };
      script.onerror = () => {
        razorpayLoader = null;
        reject(new Error("Could not load Razorpay. Check your internet connection."));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayLoader;
}

type PayPhase = "ready" | "open" | "verifying" | "paid" | "failed" | "cancelled";

/**
 * Razorpay Checkout for a wallet top-up. The Razorpay window opens over this dialog; its signed result goes to
 * /wallet/razorpay/verify, and the server credits the wallet only after Razorpay reports the payment captured.
 */
function RazorpayPayDialog({
  amount,
  link,
  walletState,
  notify,
  onClose,
}: {
  amount: number;
  link: TopupResult;
  walletState: WalletState;
  notify: Notify;
  onClose: () => void;
}) {
  const { wallet, reload } = walletState;
  const [phase, setPhase] = useState<PayPhase>("ready");
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoOpened = useRef(false);
  const announced = useRef(false);

  const entry = wallet?.entries.find((row) => row.id === link.requestId);
  const ledgerStatus = (entry?.status || "").toLowerCase();
  const view: PayPhase = ledgerStatus === "success" ? "paid" : phase;
  const done = view === "paid";

  const settle = useCallback(
    (status: string | undefined) => {
      if (status === "success") setPhase("paid");
      void reload();
    },
    [reload],
  );

  const openCheckout = useCallback(async () => {
    setMessage(null);
    let Razorpay: RazorpayCtor;
    try {
      Razorpay = await loadRazorpay();
    } catch (caught) {
      setPhase("failed");
      setMessage(caught instanceof Error ? caught.message : "Could not load Razorpay.");
      return;
    }
    const rzp = new Razorpay({
      key: link.keyId,
      order_id: link.orderId,
      amount: link.amountPaise ?? Math.round(amount * 100),
      currency: "INR",
      name: "Broget AI",
      description: "Wallet top-up",
      prefill: { contact: link.mobile ?? "" },
      notes: { requestId: link.requestId },
      theme: { color: RZP_BLUE },
      handler: async (result: RazorpayHandlerResult) => {
        setPhase("verifying");
        try {
          const confirmed = await verifyRazorpayPayment(link.requestId, result);
          if (confirmed.status === "success") settle("success");
          else {
            setPhase("cancelled");
            setMessage("Razorpay has not confirmed the payment yet. Tap Check status in a moment.");
            void reload();
          }
        } catch (caught) {
          setPhase("cancelled");
          setMessage(caught instanceof Error ? caught.message : "Could not confirm the payment. Tap Check status.");
        }
      },
      modal: {
        ondismiss: () => {
          setPhase((current) => (current === "open" ? "cancelled" : current));
        },
      },
    });
    rzp.on("payment.failed", (payload) => {
      // Razorpay lets the payer retry in the same window; remember the reason in case they close it.
      setMessage(payload?.error?.description || "The payment failed. You can try again.");
    });
    setPhase("open");
    rzp.open();
  }, [amount, link, reload, settle]);

  // Open Razorpay right away - the agent already clicked "Proceed to pay".
  useEffect(() => {
    if (autoOpened.current) return;
    autoOpened.current = true;
    void openCheckout();
  }, [openCheckout]);

  useEffect(() => {
    if (announced.current || !done) return;
    announced.current = true;
    notify(true, "Payment received", `${money(amount)} added to your wallet.`);
  }, [done, amount, notify]);

  async function checkNow() {
    setChecking(true);
    try {
      const result = await checkTopup(link.requestId);
      settle(result.status);
      if (result.status !== "success") setMessage("No completed payment yet. If money was debited, wait a minute and check again.");
    } catch (caught) {
      notify(false, "Check status", caught instanceof Error ? caught.message : "Try again");
    }
    setChecking(false);
  }

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(link.requestId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked - ignore */
    }
  }

  const steps = [
    { label: "Order created", state: "done" },
    { label: "Pay securely", state: view === "paid" || view === "verifying" ? "done" : "active" },
    { label: "Wallet credited", state: view === "paid" ? "done" : view === "verifying" ? "active" : "todo" },
  ] as const;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Add money">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-[3px]" />
      <div className="fade-up relative max-h-[94dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="relative overflow-hidden px-6 pb-7 pt-5 text-white" style={{ background: "linear-gradient(145deg, #2b6bff 0%, #0b3fbf 60%, #072a87 100%)" }}>
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide">
              <IconShield size={13} /> Secured by Razorpay
            </span>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/15 hover:text-white">
              <IconX size={18} />
            </button>
          </div>
          <p className="relative mt-6 text-xs font-medium uppercase tracking-[0.14em] text-white/70">Adding to Broget wallet</p>
          <p className="font-display tabular relative mt-1 text-[44px] font-bold leading-none">{money(amount)}</p>
          <button type="button" onClick={() => void copyOrder()} className="relative mt-3 inline-flex items-center gap-1.5 rounded-md bg-black/15 px-2 py-1 font-mono text-[11px] text-white/85 hover:bg-black/25" title="Copy order id">
            Order {link.requestId} {copied ? <IconCheck size={12} /> : null}
          </button>
        </div>

        <div className="px-6 pb-6 pt-5">
          <ol className="flex items-start">
            {steps.map((step, i) => (
              <li key={step.label} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <span className={`h-[2px] flex-1 ${i === 0 ? "opacity-0" : steps[i - 1].state === "done" && step.state !== "todo" ? "bg-emerald-500" : "bg-line"}`} />
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      step.state === "done" ? "bg-emerald-500 text-white" : step.state === "active" ? "text-white ring-4 ring-[#0b5cff]/15" : "bg-soft text-subtle"
                    }`}
                    style={step.state === "active" ? { background: RZP_BLUE } : undefined}
                  >
                    {step.state === "done" ? <IconCheck size={14} /> : i + 1}
                  </span>
                  <span className={`h-[2px] flex-1 ${i === steps.length - 1 ? "opacity-0" : step.state === "done" && steps[i + 1].state !== "todo" ? "bg-emerald-500" : "bg-line"}`} />
                </div>
                <span className={`mt-2 text-[11px] font-semibold ${step.state === "todo" ? "text-subtle" : "text-ink"}`}>{step.label}</span>
              </li>
            ))}
          </ol>

          {view === "paid" ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_8px_24px_-6px_rgba(16,185,129,.6)]">
                <IconCheck size={32} />
              </span>
              <p className="mt-4 text-lg font-semibold text-emerald-800">Payment successful</p>
              <p className="mt-1 text-sm text-emerald-700">
                {money(amount)} added. New balance {money(wallet?.balance ?? 0)}.
              </p>
              {entry?.utr ? <p className="mt-2 font-mono text-[11px] text-emerald-700/80">Ref {entry.utr}</p> : null}
            </div>
          ) : view === "verifying" ? (
            <div className="mt-6 rounded-2xl border border-line bg-soft/60 p-6 text-center">
              <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-[3px] border-[#dbe5ff] border-t-[#0b5cff]" />
              <p className="mt-4 text-base font-semibold text-ink">Confirming your payment…</p>
              <p className="mt-1 text-sm text-muted">Please keep this window open.</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-4 gap-2">
                {["UPI", "Cards", "Net banking", "Wallets"].map((method) => (
                  <span key={method} className="rounded-xl border border-[#e2e8f5] bg-[#f8faff] py-2 text-center text-[11px] font-semibold text-ink">
                    {method}
                  </span>
                ))}
              </div>

              {view === "cancelled" || view === "failed" ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                  <IconAlert size={16} className="mt-0.5 shrink-0" />
                  {message || "Payment not completed. No money was taken - you can try again."}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => void openCheckout()}
                disabled={view === "open"}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(11,92,255,.75)] transition hover:brightness-110 active:scale-[.99] disabled:opacity-60"
                style={{ background: RZP_BLUE }}
              >
                {view === "open" ? "Razorpay window is open…" : view === "ready" ? `Pay ${money(amount)}` : "Try again"} <IconArrowRight size={18} />
              </button>

              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-soft px-3.5 py-3 text-[13px] text-muted">
                {view === "open" ? <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-emerald-500" /> : <IconShield size={15} className="shrink-0" />}
                <span>{view === "open" ? "Complete the payment in the Razorpay window." : "Your wallet updates only after Razorpay confirms the payment."}</span>
              </div>
            </>
          )}

          <div className="mt-5 flex gap-2">
            {!done && view !== "ready" ? (
              <button type="button" onClick={() => void checkNow()} disabled={checking || view === "verifying"} className="btn btn-secondary flex-1">
                <IconRefresh size={15} className={checking ? "animate-spin" : ""} /> {checking ? "Checking…" : "Check status"}
              </button>
            ) : null}
            <button type="button" onClick={onClose} className={`btn ${done ? "btn-primary" : "btn-secondary"} ${done || view === "ready" ? "flex-1" : ""}`}>
              {done ? "Done" : "Close"}
            </button>
          </div>
          {!done ? <p className="mt-3 text-center text-[11px] text-subtle">If money was debited but this shows pending, tap Check status - it is never lost.</p> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ======================================================================= */
/* Customers                                                                */
/* ======================================================================= */

const emptyCustomer = { firstName: "", lastName: "", mobile: "", email: "", pan: "", dateOfBirth: "" };

function CustomersTab({ notify, startCheck }: { notify: Notify; startCheck: (id?: string) => void }) {
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchRows = useCallback(
    () =>
      listCustomers()
        .then(setRows)
        .catch((error) => notify(false, "Customers", error instanceof Error ? error.message : "Failed"))
        .finally(() => setLoading(false)),
    [notify],
  );

  const load = useCallback(() => {
    setLoading(true);
    void fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.mobile, r.pan, r.email].some((v) => (v || "").toLowerCase().includes(q)));
  }, [rows, query]);

  return (
    <div>
      <PageHeader
        title="Customers"
        icon={<IconUsers size={22} />}
        description={`${rows.length} customer${rows.length === 1 ? "" : "s"} in your book - shared with the mobile app.`}
        actions={
          <button type="button" onClick={() => setAdding(true)} className="btn btn-primary">
            <IconPlus size={16} /> Add customer
          </button>
        }
      />

      {rows.length > 0 ? (
        <MiniStats
          items={(() => {
            const checked = rows.filter((r) => r.score != null && r.score > 0);
            const avg = checked.length ? Math.round(checked.reduce((t, r) => t + Number(r.score), 0) / checked.length) : null;
            return [
              { label: "Total customers", value: String(rows.length), dot: "#0066ff" },
              { label: "CIBIL checked", value: String(checked.length), dot: "#16a34a" },
              { label: "Not checked yet", value: String(rows.length - checked.length), dot: "#f59e0b" },
              { label: "Average score", value: avg != null ? String(avg) : "-", dot: "#7c3aed" },
            ];
          })()}
        />
      ) : null}

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder="Search name, mobile, PAN…" />
          <button type="button" onClick={() => void load()} className="btn btn-ghost">
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading && rows.length === 0 ? <RowsSkeleton /> : null}
        {!loading && rows.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={22} />}
            title="No customers yet"
            body="Add your first customer to run a CIBIL check."
            action={
              <button type="button" onClick={() => setAdding(true)} className="btn btn-primary">
                <IconPlus size={16} /> Add customer
              </button>
            }
          />
        ) : null}
        {rows.length > 0 && filtered.length === 0 ? <EmptyState icon={<IconSearch size={22} />} title="No matches" body={`Nothing matches “${query}”.`} /> : null}

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table min-w-[720px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>PAN</th>
                  <th>Last score</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{row.name}</p>
                          <p className="truncate text-xs text-subtle">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{row.mobile}</td>
                    <td className="px-5 py-3.5 font-mono text-[13px] tracking-wide text-muted">{row.pan}</td>
                    <td className="px-5 py-3.5">
                      {row.score != null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{row.score}</span>
                          <ScoreBadge score={row.score} />
                        </div>
                      ) : (
                        <span className="text-xs text-subtle">{row.cibil || "Not checked"}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" onClick={() => startCheck(row.id)} className="btn btn-secondary px-3 py-1.5 text-xs">
                        <IconGauge size={14} /> Check CIBIL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {adding ? (
        <AddCustomerModal
          notify={notify}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}

function AddCustomerModal({ notify, onClose, onSaved }: { notify: Notify; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof typeof emptyCustomer, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{10}$/.test(form.mobile)) return notify(false, "Check mobile", "Enter a 10-digit mobile number.");
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan)) return notify(false, "Check PAN", "PAN format is ABCDE1234F.");
    setSaving(true);
    try {
      await createCustomer(form);
      notify(true, "Customer saved", `${form.firstName} ${form.lastName}`.trim());
      onSaved();
    } catch (error) {
      notify(false, "Could not save", error instanceof Error ? error.message : "Try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Add customer" description="Details must match the customer's PAN records." onClose={onClose}>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="field-label">First name</span>
          <input required autoFocus value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="input" />
        </label>
        <label>
          <span className="field-label">Last name</span>
          <input required value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="input" />
        </label>
        <label>
          <span className="field-label">Mobile</span>
          <input
            required
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={form.mobile}
            onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="input"
          />
        </label>
        <label>
          <span className="field-label">Date of birth</span>
          <input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">Email</span>
          <input required type="email" placeholder="name@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="input" />
        </label>
        <label className="sm:col-span-2">
          <span className="field-label">PAN</span>
          <input
            required
            placeholder="ABCDE1234F"
            value={form.pan}
            onChange={(e) => set("pan", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10))}
            className="input font-mono tracking-wider"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ======================================================================= */
/* CIBIL check                                                              */
/* ======================================================================= */

function CibilTab({
  notify,
  walletState,
  initialCustomerId,
  go,
}: {
  notify: Notify;
  walletState: WalletState;
  initialCustomerId: string | null;
  go: (t: Tab) => void;
}) {
  const { wallet, reload } = walletState;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ id: string; score: number | null; message: string; name: string; reportUrl?: string | null } | null>(null);
  const selected = useMemo(() => customers.find((row) => row.id === customerId) || null, [customerId, customers]);

  useEffect(() => {
    listCustomers()
      .then((rows) => {
        setCustomers(rows);
        const preferred = initialCustomerId && rows.some((r) => r.id === initialCustomerId) ? initialCustomerId : rows[0]?.id;
        if (preferred) setCustomerId(preferred);
      })
      .catch((error) => notify(false, "Customers", error instanceof Error ? error.message : "Failed"))
      .finally(() => setLoadingCustomers(false));
  }, [notify, initialCustomerId]);

  const insufficient = wallet != null && wallet.balance < wallet.charge;
  const step = result ? 3 : agreed && gender ? 2 : 1;

  async function runCheck() {
    if (!selected) return notify(false, "Pick a customer");
    if (!agreed) return notify(false, "Consent required", "Customer must accept consent.");
    if (!gender) return notify(false, "Select gender", "CIBIL needs the customer's gender.");
    setLoading(true);
    setResult(null);
    try {
      const first = selected.firstName || selected.name.split(/\s+/)[0] || "";
      const last = selected.lastName || selected.name.split(/\s+/).slice(1).join(" ") || first;
      const saved = await requestCreditReport({
        firstName: first,
        lastName: last,
        mobile: selected.mobile,
        dateOfBirth: selected.dateOfBirth,
        email: selected.email,
        pan: selected.pan,
        gender,
      });
      setResult({ id: saved.id, score: saved.score, message: saved.message, name: selected.name, reportUrl: saved.reportUrl });
      notify(true, "CIBIL ready", saved.score != null ? `Score ${saved.score}` : saved.message);
      void reload();
    } catch (error) {
      notify(false, "CIBIL failed", error instanceof Error ? error.message : "Try again");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setAgreed(false);
    setGender("");
  }

  return (
    <div>
      <PageHeader icon={<IconGauge size={22} />} title="Run a CIBIL check" description={`Fee ${money(wallet?.charge ?? 0)} is charged from your wallet.`} />

      {/* Stepper */}
      <ol className="mb-6 grid grid-cols-3 gap-2">
        {["Select customer", "Gender & consent", "Score & report"].map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${active ? "border-brand/30 bg-brand-50" : "border-line bg-white"}`}>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                  done ? "bg-emerald-500 text-white" : active ? "bg-brand text-white" : "bg-soft text-subtle"
                }`}
              >
                {done ? <IconCheck size={13} /> : n}
              </span>
              <span className={`truncate text-xs font-semibold sm:text-sm ${active ? "text-brand" : done ? "text-ink" : "text-subtle"}`}>{label}</span>
            </li>
          );
        })}
      </ol>

      {insufficient ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-sm font-medium text-amber-800">
            <IconAlert size={18} className="shrink-0" />
            Balance {money(wallet?.balance ?? 0)} is below the check fee of {money(wallet?.charge ?? 0)}.
          </p>
          <button type="button" onClick={() => go("wallet")} className="btn bg-amber-600 text-white hover:bg-amber-700">
            Add money
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="card p-6">
          <h3 className="text-sm font-semibold text-ink">1. Customer</h3>
          {loadingCustomers ? <div className="skeleton mt-3 h-11 w-full" /> : null}
          {!loadingCustomers && customers.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-line p-5 text-center">
              <p className="text-sm text-muted">You haven&apos;t added any customers yet.</p>
              <button type="button" onClick={() => go("customers")} className="btn btn-primary mt-3">
                <IconPlus size={16} /> Add customer
              </button>
            </div>
          ) : null}
          {customers.length > 0 ? (
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setResult(null);
              }}
              className="input mt-3 cursor-pointer py-3"
            >
              {customers.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.mobile}
                </option>
              ))}
            </select>
          ) : null}

          {selected ? (
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-soft p-4 text-sm sm:grid-cols-3">
              <Detail label="PAN" value={selected.pan} mono />
              <Detail label="Date of birth" value={selected.dateOfBirth} />
              <Detail label="Email" value={selected.email} className="col-span-2 sm:col-span-1" />
            </div>
          ) : null}

          <h3 className="mt-7 text-sm font-semibold text-ink">2. Gender &amp; consent</h3>
          <div className="mt-3" role="radiogroup" aria-label="Customer gender">
            <span className="field-label">Gender (as per PAN)</span>
            <div className="grid grid-cols-2 gap-2">
              {(["Male", "Female"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={gender === option}
                  onClick={() => setGender(option)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    gender === option ? "border-brand bg-brand-50 text-brand ring-2 ring-brand/15" : "border-line bg-white text-muted hover:border-[#cfd8e8]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 transition hover:bg-soft/60">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#0066ff]" />
            <span className="text-sm text-muted">
              <span className="block font-semibold text-ink">Customer consent</span>I agree to share my data for verification purposes.
            </span>
          </label>

          <button
            type="button"
            disabled={loading || customers.length === 0 || !selected}
            onClick={() => void runCheck()}
            className="btn btn-success mt-6 w-full py-3.5 text-[15px]"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Fetching report…
              </>
            ) : (
              <>
                <IconGauge size={18} /> Run CIBIL check · {money(wallet?.charge ?? 0)}
              </>
            )}
          </button>
        </section>

        <section className="card flex flex-col p-6">
          <h3 className="text-sm font-semibold text-ink">3. Result</h3>
          {!result && !loading ? (
            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
              <div className="opacity-40">
                <ScoreGauge score={null} size={200} />
              </div>
              <p className="mt-8 text-sm text-muted">Run a check to see the score and PDF report here.</p>
            </div>
          ) : null}
          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
              <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand" />
              <p className="text-sm text-muted">Contacting the bureau…</p>
            </div>
          ) : null}
          {result ? (
            <div className="flex flex-1 flex-col">
              <div className="pt-6">
                <ScoreGauge score={result.score} />
              </div>
              <p className="mt-10 text-center text-sm font-semibold text-ink">{result.name}</p>
              <p className="mt-1 text-center text-sm text-muted">{result.message}</p>
              <ScoreScale />
              {result.reportUrl ? (
                <a href={result.reportUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-6 w-full">
                  <IconExternal size={15} /> View full CIBIL report
                </a>
              ) : null}
              <div className={result.reportUrl ? "mt-2" : "mt-6"}>
                <PdfActions id={result.id} notify={notify} />
              </div>
              <button type="button" onClick={reset} className="btn btn-ghost mt-2 w-full">
                Run another check
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Detail({ label, value, mono, className = "" }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-[11px] font-medium text-subtle">{label}</p>
      <p className={`truncate font-semibold text-ink ${mono ? "font-mono text-xs tracking-wider" : ""}`}>{value || "-"}</p>
    </div>
  );
}

function ScoreScale() {
  const bands = [
    ["300–549", "Poor", "bg-red-500"],
    ["550–649", "Fair", "bg-amber-500"],
    ["650–749", "Good", "bg-blue-500"],
    ["750–900", "Excellent", "bg-emerald-500"],
  ];
  return (
    <div className="mt-6 grid grid-cols-4 gap-1.5 text-center">
      {bands.map(([range, label, color]) => (
        <div key={label}>
          <div className={`h-1.5 rounded-full ${color}`} />
          <p className="mt-1.5 text-[11px] font-semibold text-ink">{label}</p>
          <p className="text-[10px] text-subtle">{range}</p>
        </div>
      ))}
    </div>
  );
}

/* ======================================================================= */
/* Reports                                                                  */
/* ======================================================================= */

function ChecksTab({ notify, startCheck }: { notify: Notify; startCheck: (id?: string) => void }) {
  const [rows, setRows] = useState<CreditCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchRows = useCallback(
    () =>
      listCreditChecks()
        .then(setRows)
        .catch((error) => notify(false, "Reports", error instanceof Error ? error.message : "Failed"))
        .finally(() => setLoading(false)),
    [notify],
  );

  const load = useCallback(() => {
    setLoading(true);
    void fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.name, r.mobile, r.pan].some((v) => (v || "").toLowerCase().includes(q)));
  }, [rows, query]);

  return (
    <div>
      <PageHeader
        title="Reports"
        icon={<IconFile size={22} />}
        description="Every CIBIL check you have run, with PDF reports."
        actions={
          <button type="button" onClick={() => startCheck()} className="btn btn-primary">
            <IconPlus size={16} /> New check
          </button>
        }
      />

      {rows.length > 0 ? (
        <MiniStats
          items={(() => {
            const scored = rows.filter((r) => r.score != null && r.score > 0);
            const avg = scored.length ? Math.round(scored.reduce((t, r) => t + Number(r.score), 0) / scored.length) : null;
            return [
              { label: "Total reports", value: String(rows.length), dot: "#0066ff" },
              { label: "Last 7 days", value: String(lastDays(rows, (r) => r.createdAt).reduce((t, d) => t + d.value, 0)), dot: "#7c3aed" },
              { label: "Average score", value: avg != null ? String(avg) : "-", dot: "#16a34a" },
              { label: "Excellent (750+)", value: String(scored.filter((r) => Number(r.score) >= 750).length), dot: "#0891b2" },
            ];
          })()}
        />
      ) : null}

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox value={query} onChange={setQuery} placeholder="Search name, mobile, PAN…" />
          <button type="button" onClick={load} className="btn btn-ghost">
            <IconRefresh size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loading && rows.length === 0 ? <RowsSkeleton /> : null}
        {!loading && rows.length === 0 ? (
          <EmptyState
            icon={<IconFile size={22} />}
            title="No reports yet"
            body="Your CIBIL checks and PDFs will appear here."
            action={
              <button type="button" onClick={() => startCheck()} className="btn btn-primary">
                Run first check
              </button>
            }
          />
        ) : null}
        {rows.length > 0 && filtered.length === 0 ? <EmptyState icon={<IconSearch size={22} />} title="No matches" body={`Nothing matches “${query}”.`} /> : null}

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table min-w-[760px]">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th className="text-right">Report</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">{row.name}</p>
                          <p className="truncate text-xs text-subtle">{row.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{shortDate(row.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-bold">{row.score ?? "-"}</span>
                        <ScoreBadge score={row.score} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end">
                        <PdfActions id={row.id} notify={notify} compact />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

/* ======================================================================= */
/* PDF actions + viewer                                                     */
/* ======================================================================= */

function PdfActions({ id, notify, compact = false }: { id: string; notify: Notify; compact?: boolean }) {
  const [busy, setBusy] = useState<"view" | "download" | null>(null);
  const [viewer, setViewer] = useState<{ url: string; filename: string } | null>(null);

  async function openView() {
    setBusy("view");
    try {
      const file = await fetchCreditPdf(id);
      setViewer({ url: file.url, filename: file.filename });
    } catch (error) {
      notify(false, "View PDF", error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function openDownload() {
    setBusy("download");
    try {
      await downloadCreditPdf(id);
      notify(true, "PDF downloaded");
    } catch (error) {
      notify(false, "Download PDF", error instanceof Error ? error.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const closeViewer = useCallback(() => {
    setViewer((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeViewer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewer, closeViewer]);

  return (
    <>
      <div className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void openView()}
          className={`btn btn-secondary ${compact ? "px-3 py-1.5 text-xs" : "sm:flex-1"}`}
        >
          <IconEye size={compact ? 14 : 16} /> {busy === "view" ? "Opening…" : "View"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void openDownload()}
          className={`btn btn-primary ${compact ? "px-3 py-1.5 text-xs" : "sm:flex-1"}`}
        >
          <IconDownload size={compact ? 14 : 16} /> {busy === "download" ? "Saving…" : compact ? "PDF" : "Download PDF"}
        </button>
      </div>

      {viewer
        ? createPortal(
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close PDF" onClick={closeViewer} className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" />
          <div className="fade-up absolute inset-3 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:inset-8">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                <IconFile size={16} className="shrink-0 text-brand" />
                <span className="truncate">{viewer.filename}</span>
              </p>
              <div className="flex shrink-0 gap-2">
                <a href={viewer.url} download={viewer.filename} className="btn btn-primary px-3 py-2 text-xs">
                  <IconDownload size={14} /> Download
                </a>
                <button type="button" onClick={closeViewer} className="btn btn-secondary px-3 py-2 text-xs">
                  Close
                </button>
              </div>
            </div>
            <iframe title={viewer.filename} src={viewer.url} className="w-full flex-1 bg-soft" />
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
