"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { LoginScreen } from "@/components/login-screen";
import { publicWebsiteUrl } from "@/components/public-chrome";
import { clearSession, logout, restoreSession, saveSession, type AdminAccount, type AdminSession } from "@/lib/api";
import { agentLabel, findCustomer, groups, maskAadhaar, maskPan, phoneLabel, sections, type DeskCustomer } from "@/lib/desk";

const DeskContext = createContext<{ openCustomer: (id: string) => void; notify: (tone: "ok" | "bad", title: string, detail?: string) => void }>({
  openCustomer: () => {},
  notify: () => {},
});

export function useDesk() {
  return useContext(DeskContext);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const current = sections.find((section) => path === `/${section.slug}`);
    return current && current.group !== "Agents" ? { [current.group]: true } : {};
  });
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [admin, setAdmin] = useState<AdminAccount | null>(null);
  const [toast, setToast] = useState<{ id: number; tone: "ok" | "bad"; title: string; detail?: string } | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCustomer = useCallback((id: string) => {
    setMenu(false);
    setCustomerId(id);
    setDrawerMounted(true);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    window.setTimeout(() => {
      setDrawerMounted(false);
      setCustomerId(null);
    }, 280);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const pushToast = useCallback((tone: "ok" | "bad", title: string, detail?: string) => {
    const id = Date.now();
    setToast({ id, tone, title, detail });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  }, []);

  useEffect(() => {
    let active = true;
    restoreSession().then((account) => {
      if (!active) return;
      setAdmin(account);
      setSignedIn(Boolean(account));
    });
    return () => {
      active = false;
    };
  }, []);

  function signIn(session: AdminSession) {
    saveSession(session);
    setAdmin(session.user);
    setSignedIn(true);
    pushToast("ok", "Signed in", session.user.email);
  }

  function signOut() {
    setMenu(false);
    setNoticesOpen(false);
    setAdmin(null);
    setSignedIn(false);
    pushToast("ok", "Signed out");
    void logout().catch(() => clearSession());
  }

  useEffect(() => {
    const locked = menu || drawerOpen;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, drawerOpen]);

  if (signedIn === null) {
    return (
      <>
        <div className="grid h-dvh place-items-center bg-[#eef3fb]" />
        <LoginToast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  if (!signedIn) {
    return (
      <>
        <LoginScreen onSuccess={signIn} onError={(message) => pushToast("bad", "Could not sign in", message)} />
        <LoginToast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <DeskContext.Provider value={{ openCustomer, notify: pushToast }}>
      <div className="h-dvh overflow-hidden bg-[#eef3fb] text-[#12182b]">
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenu(false)}
          className={`fixed inset-0 z-30 bg-[#0e1b33]/40 transition-opacity duration-300 ease-out lg:hidden ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />
        <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[280px] max-w-[86vw] flex-col overflow-hidden bg-[#0e1b33] text-white shadow-[12px_0_40px_rgba(8,16,36,0.28)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-w-none lg:translate-x-0 lg:shadow-none ${menu ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex shrink-0 items-center gap-3 px-4 py-4">
            <a href={publicWebsiteUrl} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label="Open the public website">
              <Image src="/mark.png" alt="" width={40} height={40} className="h-10 w-10 rounded-2xl" />
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold tracking-tight">Broget AI</p>
                <p className="text-[10px] font-bold tracking-[0.12em] text-[#9fb0d0]">SUPER ADMIN</p>
              </div>
            </a>
            <button type="button" onClick={() => setMenu(false)} className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-white/80 hover:bg-white/10 lg:hidden" aria-label="Close menu">
              <Icon name="close" />
            </button>
          </div>
          <nav className="desk-nav min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
            <SideLink href="/" icon="home" label="Home" active={path === "/"} onPick={() => setMenu(false)} />
            {groups.map((group) => {
              const collapsible = group !== "Agents";
              const open = !collapsible || Boolean(openGroups[group]);
              const items = sections.filter((section) => section.group === group);
              return (
                <div key={group} className="mt-5">
                  {collapsible ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenGroups((current) => ({ ...current, [group]: !current[group] }))}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[11px] font-extrabold tracking-[0.14em] text-[#7f93b8] hover:bg-white/10"
                    >
                      {group}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  ) : (
                    <p className="px-3 pb-2 text-[11px] font-extrabold tracking-[0.14em] text-[#7f93b8]">{group}</p>
                  )}
                  <div className="overflow-hidden transition-[max-height] duration-200 ease-out" style={{ maxHeight: open ? 320 : 0 }}>
                    {items.map((section) => (
                      <SideLink key={section.slug} href={`/${section.slug}`} icon={section.slug} label={section.label} active={path === `/${section.slug}`} onPick={() => setMenu(false)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="shrink-0 border-t border-white/10 px-3 py-4">
            <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#fecaca] transition-colors duration-200 hover:bg-white/10">
              <Icon name="logout" />
              Logout
            </button>
          </div>
        </aside>
        <div className="flex h-dvh min-w-0 flex-col lg:pl-[280px]">
          <header className="z-20 flex shrink-0 items-center gap-3 border-b border-[#e6ebf5] bg-white/90 px-4 py-3 backdrop-blur md:px-6">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-[#e6ebf5] lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
              <Icon name="menu" />
            </button>
            <form
              className="hidden min-w-0 flex-1 md:block"
              onSubmit={(event) => {
                event.preventDefault();
                router.push(query.trim() ? `/customers?q=${encodeURIComponent(query.trim())}` : "/customers");
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search flights, hotels, or customers"
                className="w-full max-w-xl rounded-xl border border-[#e6ebf5] bg-[#f7f9fd] px-4 py-2.5 text-sm font-semibold outline-none transition-colors duration-200 focus:border-[#2f6bff]"
              />
            </form>
            <p className="ml-auto max-w-[42vw] truncate rounded-xl bg-[#eaf1ff] px-3 py-2 text-sm font-extrabold text-[#2f6bff] sm:max-w-[240px]" title={admin?.email}>{admin?.email}</p>
            <div className="relative">
              <button type="button" aria-label="Notifications" aria-expanded={noticesOpen} onClick={() => setNoticesOpen((open) => !open)} className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#e6ebf5] bg-white text-[#12182b]">
                <Icon name="bell" />
                <span className="sr-only">Notifications</span>
              </button>
              {noticesOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-[#e6ebf5] bg-white p-2 shadow-xl">
                  <p className="px-2 py-1.5 text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">NOTIFICATIONS</p>
                  <p className="px-2 py-3 text-sm font-semibold text-[#5c677a]">New customers show on their list.</p>
                  {/* <p className="px-2 py-3 text-sm font-semibold text-[#5c677a]">New customers and KYC uploads show on their lists.</p> */}
                </div>
              ) : null}
            </div>
            <button type="button" onClick={signOut} className="rounded-xl border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm font-extrabold text-[#dc2626]">
              Logout
            </button>
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
        {drawerMounted && customerId ? <CustomerDrawer id={customerId} open={drawerOpen} onClose={closeDrawer} /> : null}
        <LoginToast toast={toast} onClose={() => setToast(null)} />
      </div>
    </DeskContext.Provider>
  );
}

function LoginToast({ toast, onClose }: { toast: { id: number; tone: "ok" | "bad"; title: string; detail?: string } | null; onClose: () => void }) {
  if (!toast || typeof document === "undefined") return null;
  const ok = toast.tone === "ok";
  return createPortal(
    <div className="fixed top-20 right-4 z-[100] w-[min(22rem,calc(100vw-2rem))]" role="status" aria-live="polite">
      <div className="overflow-hidden rounded-2xl border border-[#e6ebf5] bg-white shadow-[0_18px_50px_rgba(18,24,43,0.16)]" style={{ animation: "toast-in 220ms ease-out" }}>
        <div className="flex items-start gap-3 px-4 py-3.5">
          <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${ok ? "bg-[#e8f8ee] text-[#16a34a]" : "bg-[#fff1f2] text-[#dc2626]"}`}>
            {ok ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M12 8v5M12 17h.01" /><circle cx="12" cy="12" r="8" /></svg>
            )}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-sm font-extrabold text-[#12182b]">{toast.title}</p>
            {toast.detail ? <p className="mt-0.5 break-words text-sm font-semibold leading-5 text-[#5c677a]">{toast.detail}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#8b95a7] hover:bg-[#f4f7fc]" aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className={`h-1 origin-left ${ok ? "bg-[#16a34a]" : "bg-[#dc2626]"}`} style={{ animation: "toast-bar 4.5s linear forwards" }} />
      </div>
    </div>,
    document.body,
  );
}

function SideLink({ href, icon, label, active, onPick }: { href: string; icon: string; label: string; active: boolean; onPick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onPick}
      className={`mb-1 flex items-center gap-3 rounded-2xl px-2.5 py-2 text-sm font-bold transition-colors duration-200 ${active ? "bg-[#2f6bff] text-white shadow-[0_8px_20px_rgba(47,107,255,0.35)]" : "text-[#d5e0f2] hover:bg-white/10"}`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${active ? "bg-white/20" : "bg-white/10"}`}>
        <Icon name={icon} />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function CustomerDrawer({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  const customer = findCustomer(id);

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close details" onClick={onClose} className={`absolute inset-0 bg-[#0e1b33]/45 ${open ? "fade-in" : "opacity-0"}`} />
      <aside className={`absolute inset-y-0 right-0 flex w-full flex-col bg-[#f4f7fc] shadow-2xl sm:max-w-[460px] sm:rounded-l-[28px] ${open ? "drawer-in" : "translate-x-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"}`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#e6ebf5] bg-white px-5 py-4 sm:rounded-tl-[28px]">
          <div className="min-w-0">
            <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">{customer?.id ?? "Customer"}</p>
            <h2 className="truncate text-xl font-extrabold">{customer?.name ?? "Customer"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#eef1f6] bg-white text-[#12182b]" aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {customer ? <CustomerFile customer={customer} /> : <p className="px-5 py-6 text-sm font-semibold text-[#5c677a]">That customer is not on this desk.</p>}
      </aside>
    </div>
  );
}

function CustomerFile({ customer }: { customer: DeskCustomer }) {
  const groups = [
    {
      title: "Basic",
      rows: [
        ["Full name", customer.name],
        ["Gender", customer.gender],
        ["Date of birth", customer.dob],
        ["Father", customer.fatherName],
        ["Mother", customer.motherName],
      ],
    },
    {
      title: "Identity",
      rows: [
        ["PAN", maskPan(customer.pan)],
        ["Aadhaar", maskAadhaar(customer.aadhaar)],
        ["Name on Aadhaar", customer.aadhaarName],
        ["Aadhaar date of birth", customer.aadhaarDob],
      ],
    },
    {
      title: "Contact",
      rows: [
        ["Mobile", phoneLabel(customer.phone)],
        ["Email", customer.email],
      ],
    },
    {
      title: "Address",
      rows: [
        ["Address", customer.address],
        ["City", customer.city],
        ["State", customer.state],
        ["PIN", customer.pin],
      ],
    },
  ];

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
      <p className="text-sm font-semibold leading-6 text-[#5c677a]">Added by {agentLabel(customer.agentId)} on {customer.added}. The agent enters this file and runs the CIBIL check. PAN and Aadhaar stay masked here.</p>
      <div className="flex flex-wrap gap-2">
        {/* <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#12182b]">KYC {customer.kyc}</span> */}
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#12182b]">CIBIL {customer.score === "—" ? customer.cibil : `${customer.score} · ${customer.cibil}`}</span>
      </div>
      {groups.map((group) => (
        <section key={group.title} className="rounded-2xl bg-white p-4">
          <h3 className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">{group.title}</h3>
          <dl className="mt-3 space-y-3">
            {group.rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-extrabold tracking-wide text-[#8b95a7]">{label}</dt>
                <dd className="text-sm font-bold text-[#12182b]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section className="rounded-2xl bg-white p-4">
        <h3 className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">Consent</h3>
        {customer.consents.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-[#5c677a]">No consent yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {customer.consents.map((consent) => (
              <li key={`${consent.purpose}-${consent.at}`}>
                <p className="text-sm font-extrabold">{consent.purpose}</p>
                <p className="text-xs font-semibold text-[#8b95a7]">{consent.at}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-2xl bg-white p-4">
        <h3 className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">Documents</h3>
        {customer.documents.length === 0 ? (
          <p className="mt-3 text-sm font-semibold text-[#5c677a]">No copies saved.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {customer.documents.map((document) => (
              <li key={`${document.kind}-${document.name}`} className="flex items-center justify-between gap-3 text-sm font-bold">
                <span>{document.name}</span>
                <span className="text-xs font-extrabold text-[#8b95a7]">{document.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "menu") return <svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
  if (name === "bell") return <svg {...props}><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9M10 20a2 2 0 0 0 4 0" /></svg>;
  if (name === "close") return <svg {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>;
  if (name === "home") return <svg {...props}><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></svg>;
  if (name === "flights") return <svg {...props}><path d="M3 13l18-6-6 16-2.5-6.5z" /></svg>;
  if (name === "hotels") return <svg {...props}><path d="M4 20V10a2 2 0 0 1 2-2h4v12M10 20V6h8a2 2 0 0 1 2 2v12M8 10h.01M8 14h.01" /></svg>;
  if (name === "users") return <svg {...props}><path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6" /></svg>;
  if (name === "cibil") return <svg {...props}><path d="M12 3a9 9 0 1 0 9 9h-9z" /></svg>;
  if (name === "customers") return <svg {...props}><path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M16 6.1a3 3 0 0 1 0 5.8" /></svg>;
  if (name === "kyc") return <svg {...props}><path d="M8 4h6l4 4v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4v4h4M9 13h6M9 17h4" /></svg>;
  if (name === "agents") return <svg {...props}><path d="M16 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1M10 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 8v6M22 11h-6" /></svg>;
  return <svg {...props}><path d="M10 7V5a2 2 0 0 1 2-2h7v14h-7a2 2 0 0 1-2-2M10 12H3M6 9l-3 3 3 3" /></svg>;
}
