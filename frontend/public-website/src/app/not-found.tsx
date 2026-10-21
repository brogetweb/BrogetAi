import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <main className="bg-[#f3f0ea] px-5 pb-24 pt-36">
        <div className="mx-auto max-w-xl">
          <p className="text-[11px] font-extrabold tracking-[0.18em] text-indigo-600">404</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">That page is not on the map.</h1>
          <p className="mt-3 text-slate-600">The link may be old. Flights and hotels are the pages that are ready.</p>
          <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#12141a] px-5 py-3 text-sm font-bold text-white">Back home</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
