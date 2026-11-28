"use client";

import { verifyRazorpay, type Order, type RazorpaySuccess, type Traveller } from "@/lib/api";

type RazorpayInstance = { open: () => void; on: (event: string, cb: (e: unknown) => void) => void };
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;

let loading: Promise<RazorpayCtor> | null = null;

/** Loads Razorpay Standard Checkout once per page. */
function loadCheckout(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay did not load.")));
    s.onerror = () => {
      loading = null;
      reject(new Error("Could not load Razorpay. Check your internet connection."));
    };
    document.body.appendChild(s);
  });
  return loading;
}

export type PayOutcome = { kind: "paid"; order: Order } | { kind: "dismissed" } | { kind: "pending" };

/**
 * Opens the Razorpay window for a flight order and resolves once the payer finishes or closes it.
 * Success is confirmed on our server (signature + captured payment) before it counts as paid.
 */
export async function payWithRazorpay(order: Order, user: Traveller): Promise<PayOutcome> {
  const rzp = order.razorpay;
  if (!rzp) throw new Error("Online payment is not available for this booking.");
  const Razorpay = await loadCheckout();
  const f = order.flight ?? {};
  return new Promise<PayOutcome>((resolve) => {
    const instance = new Razorpay({
      key: rzp.keyId,
      order_id: rzp.orderId,
      amount: rzp.amount,
      currency: rzp.currency,
      name: "Book by Broget AI",
      description: `Flight ${f.fromCode ?? ""} to ${f.toCode ?? ""}`.trim(),
      prefill: { name: user.name, email: user.email, contact: user.phone },
      notes: { requestId: order.requestId },
      theme: { color: "#1d5bff" },
      handler: (result: RazorpaySuccess) => {
        verifyRazorpay(order.requestId, result)
          .then((o) => resolve(o.status === "paid" || o.status === "ticketed" ? { kind: "paid", order: o } : { kind: "pending" }))
          .catch(() => resolve({ kind: "pending" }));
      },
      modal: { ondismiss: () => resolve({ kind: "dismissed" }) },
    });
    instance.open();
  });
}
