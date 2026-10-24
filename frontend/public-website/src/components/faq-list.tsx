"use client";

import { useState } from "react";

const items = [
  {
    q: "Can I book a flight or hotel here today?",
    a: "You can shape a search and see where it would go. Live fares and room availability are not connected yet, so nothing on this site is a confirmed booking or price.",
  },
  {
    q: "What about CIBIL and SIP?",
    a: "Both are coming soon. Credit-score checks stay off until access and compliance are approved. SIP is not an active feature in this release.",
  },
  {
    q: "Where do my travel details go?",
    a: "Provider access stays on the server. The website only sends your search to the Broget AI API, and it never holds airline or hotel secrets in the browser.",
  },
];

export function FaqList() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-slate-200 rounded-[28px] border border-slate-200 bg-white">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? -1 : index)}
            >
              <span className="font-extrabold tracking-tight">{item.q}</span>
              <span className="text-xl text-indigo-600" aria-hidden="true">{expanded ? "–" : "+"}</span>
            </button>
            {expanded ? <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{item.a}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
