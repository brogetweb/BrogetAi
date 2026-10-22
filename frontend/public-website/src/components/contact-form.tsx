"use client";

import { useState, type FormEvent } from "react";

const topics = ["Travel", "Banking", "Payment", "Our Services", "Account", "Something else"];

type Fields = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const empty: Fields = { name: "", email: "", phone: "", message: "" };

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [topic, setTopic] = useState(topics[0]);
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [sent, setSent] = useState("");

  function update(key: keyof Fields, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      document.getElementById(first)?.focus();
      return;
    }
    setSent(values.name.trim());
  }

  if (sent) {
    return (
      <div className="flex min-h-[28rem] flex-col justify-center bg-white px-6 py-10 sm:px-10" role="status">
        <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">Message received</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#163a9a]">Thanks, {sent}.</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-[#1d4ed8]">The BrogetAI desk has your note about {topic.toLowerCase()}. Keep your email and phone nearby for the reply.</p>
        <button
          type="button"
          onClick={() => {
            setSent("");
            setValues(empty);
          }}
          className="mt-8 w-fit bg-[#1d4ed8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e40af]"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form className="bg-white px-6 py-8 sm:px-10 sm:py-10" onSubmit={submit} noValidate>
      <p className="text-[11px] font-bold tracking-[0.2em] text-[#1d4ed8] uppercase">Write to us</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163a9a]">Send a message</h2>
      <p className="mt-2 text-sm leading-6 text-[#1d4ed8]">Name, email, phone, and what you need. Travel, banking, payments, or a service.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" value={values.name} error={errors.name} autoComplete="name" placeholder="Your name" onChange={(value) => update("name", value)} />
        <Field id="email" label="Email" type="email" value={values.email} error={errors.email} autoComplete="email" placeholder="you@email.com" onChange={(value) => update("email", value)} />
        <Field id="phone" label="Phone" type="tel" value={values.phone} error={errors.phone} autoComplete="tel" placeholder="10-digit mobile" onChange={(value) => update("phone", value)} />
        <label className="block text-sm font-semibold text-[#163a9a]" htmlFor="topic">
          About
          <select id="topic" name="topic" value={topic} onChange={(event) => setTopic(event.target.value)} className="mt-2 w-full border-b border-slate-300 bg-transparent px-0 py-3 font-semibold text-[#12141a] outline-none focus:border-[#1d4ed8]">
            {topics.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 block text-sm font-semibold text-[#163a9a]" htmlFor="message">
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
          placeholder="Tell us what you need, and add a booking reference if you have one."
          className="mt-2 w-full resize-y border-b border-slate-300 bg-transparent px-0 py-3 font-medium text-[#12141a] outline-none placeholder:text-slate-400 focus:border-[#1d4ed8]"
        />
      </label>
      {errors.message ? <p id="message-error" className="mt-2 text-sm font-semibold text-rose-700">{errors.message}</p> : null}

      <button type="submit" className="mt-8 w-full bg-[#1d4ed8] py-3.5 text-sm font-semibold text-white hover:bg-[#1e40af] sm:w-auto sm:px-10">
        Send message
      </button>
    </form>
  );
}

function Field({ id, label, value, error, onChange, type = "text", autoComplete, placeholder }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void; type?: string; autoComplete: string; placeholder: string }) {
  return (
    <label className="block text-sm font-semibold text-[#163a9a]" htmlFor={id}>
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
        className="mt-2 w-full border-b border-slate-300 bg-transparent px-0 py-3 font-medium text-[#12141a] outline-none placeholder:text-slate-400 focus:border-[#1d4ed8]"
      />
      {error ? <span id={`${id}-error`} className="mt-2 block text-sm font-semibold text-rose-700">{error}</span> : null}
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
  if (message.length < 20) errors.message = "Write at least a short note, about 20 characters.";
  return errors;
}
