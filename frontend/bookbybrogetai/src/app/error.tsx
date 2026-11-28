"use client";

import Link from "next/link";
import { session } from "@/lib/api";
import { Icon } from "@/components/icons";

/** Any crash shows this instead of a blank page. "Reset" also clears a broken saved login. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600"><Icon name="alert" size={26} /></span>
      <h1 className="mt-5 text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 text-muted">Please try again. If it keeps happening, sign out and sign back in.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">Try again</button>
        <button
          type="button"
          onClick={() => {
            session.clear();
            reset();
          }}
          className="btn-ghost"
        >
          Sign out &amp; retry
        </button>
      </div>
      <Link href="/" className="mt-6 inline-block text-sm font-semibold text-brand">Back to home</Link>
    </div>
  );
}
