const paths: Record<string, string> = {
  "flight-booking": "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  "train-booking": "M8 3h8a4 4 0 0 1 4 4v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z M4 11h16 M12 3v8 M8 15h.01 M16 15h.01 M8 22l2-4 M16 22l-2-4",
  "bus-booking": "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M3 11h18 M7 18v2 M17 18v2 M7 14.5h.01 M17 14.5h.01",
  "hotel-booking": "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8 M2 16h20 M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3",
  cibil: "M12 14l4-4 M3.3 18a9 9 0 1 1 17.4 0 M12 14h.01",
  sip: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  "fd-rd": "M3 21h18 M5 21V10 M19 21V10 M9 21V10 M15 21V10 M2 10l10-6 10 6z",
  "payment-gateway": "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M2 10h20 M6 15h4",
  "pay-in": "M12 3v12 M7 10l5 5 5-5 M4 21h16",
  payout: "M12 21V9 M7 14l5-5 5 5 M4 3h16",
  "builder-ships": "M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16 M16 9h2a2 2 0 0 1 2 2v10 M2 21h20 M8 7h4 M8 11h4 M8 15h4",
  education: "M22 9 12 4 2 9l10 5 10-5z M6 11v5c3 2 9 2 12 0v-5",
  "health-care": "M12 21s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z M12 9v5 M9.5 11.5h5",
  agriculture: "M12 21v-9 M12 12C12 7 8 4 3 4c0 5 4 8 9 8z M12 14c0-4 3-7 9-7 0 4-3 7-9 7z",
  travel: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  banking: "M3 21h18 M5 21V10 M19 21V10 M9 21V10 M15 21V10 M2 10l10-6 10 6z",
  payment: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M2 10h20 M6 15h4",
  products: "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  support: "M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z",
  check: "M20 6 9 17l-5-5",
  arrow: "M5 12h14 M13 6l6 6-6 6",
  external: "M7 17 17 7 M8 7h9v9",
};

export function ServiceIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={paths[name] ?? paths.products} />
    </svg>
  );
}
