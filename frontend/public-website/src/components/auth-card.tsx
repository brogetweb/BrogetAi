"use client";

import Link from "next/link";
import { useState } from "react";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [sent, setSent] = useState(false);
  const title = mode === "login" ? "Log in" : "Create an account";

  return (
    <form
      className="max-w-md rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Accounts connect to the BerogetAI API. This form does not sign you in yet.</p>
      <label className="mt-6 block text-sm font-bold" htmlFor="email">Email</label>
      <input id="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 bg-[#f7f6f3] px-3 py-3 outline-none focus:border-indigo-400 focus:bg-white" />
      <label className="mt-4 block text-sm font-bold" htmlFor="password">Password</label>
      <input id="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className="mt-2 w-full rounded-xl border border-slate-200 bg-[#f7f6f3] px-3 py-3 outline-none focus:border-indigo-400 focus:bg-white" />
      <button type="submit" className="mt-6 w-full rounded-xl bg-[#12141a] py-3 text-sm font-bold text-white hover:bg-indigo-700">{title}</button>
      {sent ? <p role="status" className="mt-4 text-sm font-semibold text-indigo-700">Nothing was sent. Sign-in will work once the account API is connected.</p> : null}
      <p className="mt-5 text-sm text-slate-500">
        {mode === "login" ? (
          <>New here? <Link className="font-bold text-indigo-700" href="/register">Create an account</Link></>
        ) : (
          <>Already have an account? <Link className="font-bold text-indigo-700" href="/login">Log in</Link></>
        )}
      </p>
    </form>
  );
}
