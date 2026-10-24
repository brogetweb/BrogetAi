import Link from "next/link";
import { menuGroups } from "@/lib/menu";
import { OpenAccount } from "./auth-drawer";
import { Brand } from "./brand";

const columns = [
  ...menuGroups.map((group) => ({
    title: group.label,
    links: group.items.map((item) => ({ href: item.href, label: item.label })),
  })),
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact us" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in", mode: "login" as const },
      { href: "/register", label: "Create account", mode: "register" as const },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#1b2230] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-5 lg:px-8 lg:py-16">
        <div className="flex flex-col items-start gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Brand tone="light" />
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              Travel, banking, payments, and the services beside them. One BrogetAI desk.
            </p>
          </div>
          <Link href="/contact" className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#17191e] hover:bg-indigo-50">
            Contact the desk
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h2 className="text-xs font-bold tracking-[0.16em] text-indigo-200 uppercase">{column.title}</h2>
              <div className="mt-3 flex flex-col items-start gap-1 text-sm">
                {column.links.map((link) =>
                  "mode" in link ? (
                    <OpenAccount key={link.label} mode={link.mode} className="max-w-full rounded-lg py-1.5 text-left text-slate-200 hover:text-white">
                      {link.label}
                    </OpenAccount>
                  ) : (
                    <Link key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined} className="max-w-full rounded-lg py-1.5 text-slate-200 hover:text-white">
                      {link.label}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-5 text-center text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:text-left lg:px-8">
          <span>© {new Date().getFullYear()} Broget AI</span>
          <span>Questions about a hold go to the trip desk.</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
