"use client";

import { useState, type FormEvent } from "react";

import { supportEmail } from "@/lib/contact";

const topics = ["CIBIL", "Payments (BroGetPay)", "Builder Ships", "Travel", "SIP, FD & RD", "Become an agent", "Something else"];

type Fields = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const empty: Fields = { name: "", email: "", phone: "", message: "" };

const inputClass =
  "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:ring-rose-500/15";

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [topic, setTopic] = useState(topics[0]);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  function update(key: keyof Fields, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    const subject = `[${topic}] Enquiry from ${values.name.trim()}`;
    const body = `${values.message.trim()}\n\n—\nName: ${values.name.trim()}\nEmail: ${values.email.trim()}\nPhone: ${values.phone.trim()}\nTopic: ${topic}`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-[26rem] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-slate-950">Your email is ready to send.</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          We opened your email app with the message addressed to <span className="font-semibold text-slate-900">{supportEmail}</span>. Press send there and our team will reply.
        </p>
        <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">Email app didn&apos;t open? Write to us directly at the address above.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={copyEmail} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            {copied ? "Email copied" : "Copy email address"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCopied(false);
              setValues(empty);
            }}
            className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.25)] sm:p-8" onSubmit={submit} noValidate>
      <h2 className="text-2xl font-bold tracking-[-0.02em] text-slate-950">Send us a message</h2>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">Fill in the form and we&apos;ll open your email app with everything ready to send.</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" value={values.name} error={errors.name} autoComplete="name" placeholder="Your name" onChange={(value) => update("name", value)} />
        <Field id="email" label="Email" type="email" value={values.email} error={errors.email} autoComplete="email" placeholder="you@email.com" onChange={(value) => update("email", value)} />
        <Field id="phone" label="Mobile number" type="tel" value={values.phone} error={errors.phone} autoComplete="tel" placeholder="10-digit mobile" onChange={(value) => update("phone", value)} />
        <label className="block text-sm font-semibold text-slate-800" htmlFor="topic">
          Topic
          <select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className={inputClass}>
            {topics.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 block text-sm font-semibold text-slate-800" htmlFor="message">
        Message
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="Tell us what you need. Add a booking or report reference if you have one."
          className={`${inputClass} resize-y`}
        />
      </label>
      {errors.message ? <p id="message-error" className="mt-2 text-sm font-medium text-rose-600">{errors.message}</p> : null}

      <div className="mt-7 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Or email us directly at{" "}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-blue-600 hover:text-blue-700">{supportEmail}</a>
        </p>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(37,99,235,0.8)] hover:bg-blue-500">
          Send message
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M5 12h14 M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </form>
  );
}

function Field({ id, label, value, error, onChange, type = "text", autoComplete, placeholder }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void; type?: string; autoComplete: string; placeholder: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-800" htmlFor={id}>
      {label}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {error ? <span id={`${id}-error`} className="mt-1.5 block text-sm font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

function validate(values: Fields) {
  const errors: Partial<Fields> = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.replace(/[^\d]/g, "");
  const message = values.message.trim();
  if (name.length < 2) errors.name = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email.";
  const local = phone.length > 10 ? phone.slice(-10) : phone;
  if (!/^[6-9]\d{9}$/.test(local)) errors.phone = "Enter a 10-digit mobile number.";
  if (message.length < 20) errors.message = "Please write a short note, at least 20 characters.";
  return errors;
}
