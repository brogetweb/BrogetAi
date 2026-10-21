"use client";

import { useState } from "react";

const topics = ["A fare", "A room", "My account", "Something else"];

export function ContactForm() {
  const [sent, setSent] = useState("");
  const [topic, setTopic] = useState(topics[0]);

  if (sent) {
    return (
      <div className="flex min-h-[420px] flex-col justify-center rounded-[1.75rem] bg-white p-8 ring-1 ring-slate-200 sm:p-10" role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12.5l4.2 4.2L19 7.5" />
          </svg>
        </span>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight">Thanks, {sent}.</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Your note is with the trip desk. If this is about a hold, keep that reference nearby.</p>
        <button type="button" onClick={() => setSent("")} className="mt-8 w-fit rounded-full bg-[#17191e] px-5 py-2.5 text-sm font-semibold text-white">Write another</button>
      </div>
    );
  }

  return (
    <form
      className="rounded-[1.75rem] bg-white p-6 ring-1 ring-slate-200 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSent(String(data.get("name") || "there"));
      }}
    >
      <h2 className="text-2xl font-semibold tracking-tight">Write to the trip desk</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">A name, an email, and what you need. Mention the hold reference if you have one.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field id="name" name="name" label="Name" placeholder="Priya Sharma" autoComplete="name" />
        <Field id="email" name="email" label="Email" placeholder="priya@email.com" type="email" autoComplete="email" />
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-slate-700">About</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={topic === item}
              onClick={() => setTopic(item)}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold ${topic === item ? "bg-[#17191e] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <input type="hidden" name="topic" value={topic} />
      </fieldset>

      <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="message">
        Message
        <textarea id="message" name="message" required rows={5} placeholder="Hi, I am Priya. This is about my hold." className="mt-1.5 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 font-medium outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white" />
      </label>
      <button type="submit" className="mt-6 w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white hover:bg-indigo-500">Send message</button>
    </form>
  );
}

function Field({ id, name, label, placeholder, type = "text", autoComplete }: { id: string; name: string; label: string; placeholder: string; type?: string; autoComplete: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input id={id} name={name} type={type} required placeholder={placeholder} autoComplete={autoComplete} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 font-medium outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white" />
    </label>
  );
}
