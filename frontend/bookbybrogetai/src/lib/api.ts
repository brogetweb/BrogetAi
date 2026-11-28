const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const tokenKey = "bbb-token";
const userKey = "bbb-user";
const tripsKey = "bbb-trips";
const pickKey = "bbb-pick";

export type Traveller = { id: string; name: string; email: string; phone: string; city: string; gender: string; createdAt: string };

export type Flight = {
  id: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  depart: string;
  arrive: string;
  duration: string;
  stops: number;
  refundable: boolean;
  cabinBaggage: string;
  checkInBaggage: string;
  baseFare: number;
  taxes: number;
  price: number;
};

export type SearchInput = { origin: string; destination: string; travelDate: string; adults: number; cabin: string };
export type Picked = { flight: Flight; search: SearchInput };
export type Quote = { netFare: number; markup: number; gst: number; total: number; sector: string };
export type Order = Quote & {
  requestId: string;
  status: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  demo?: boolean;
  message?: string;
  pnr?: string;
  travellerName?: string;
  travellerEmail?: string;
  travellerPhone?: string;
  flight?: Record<string, string>;
  createdAt?: string;
  paymentMode?: string;
  passengers?: { fullName?: string; title?: string }[];
  /** Set while a Razorpay order is unpaid: open Razorpay Checkout with it. */
  razorpay?: { keyId: string; orderId: string; amount: number; currency: string; testMode: boolean } | null;
};

export type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

/** Same as book-mobile digitsPhone(): keep the last 10 digits. */
export function digitsPhone(raw: string) {
  const d = String(raw || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : d;
}

const safe = <T,>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const session = {
  token: () => safe(() => localStorage.getItem(tokenKey) || "", ""),
  user: () => safe(() => {
    const raw = JSON.parse(localStorage.getItem(userKey) || "null") as RawTraveller | null;
    return raw ? toTraveller(raw) : null;
  }, null),
  save: (token: string, user: Traveller) => safe(() => {
    localStorage.setItem(tokenKey, token);
    localStorage.setItem(userKey, JSON.stringify(user));
    window.dispatchEvent(new Event("bbb-auth"));
  }, undefined),
  clear: () => safe(() => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    window.dispatchEvent(new Event("bbb-auth"));
  }, undefined),
};

export const picked = {
  set: (value: Picked) => safe(() => sessionStorage.setItem(pickKey, JSON.stringify(value)), undefined),
  get: () => safe(() => JSON.parse(sessionStorage.getItem(pickKey) || "null") as Picked | null, null),
};

export const trips = {
  list: () => safe(() => JSON.parse(localStorage.getItem(tripsKey) || "[]") as string[], []),
  add: (id: string) => safe(() => localStorage.setItem(tripsKey, JSON.stringify([id, ...trips.list().filter((x) => x !== id)].slice(0, 50))), undefined),
};

const TIMEOUT_MS = 25_000; // same as book-mobile

async function send(path: string, init: RequestInit & { auth?: boolean }) {
  const headers: Record<string, string> = { "Content-Type": "application/json", Accept: "application/json" };
  const token = session.token();
  if (init.auth && token) headers.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error("Server timed out. Check internet and try again.");
    }
    throw new Error("Cannot reach server. Check your internet and try again.");
  }
}

async function call<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const res = await send(path, init);
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && init.auth) session.clear();
  if (!res.ok) {
    const msg = (body as { message?: string | string[] }).message;
    const text = Array.isArray(msg) ? msg[0] : msg;
    throw Object.assign(new Error(text || `Request failed (HTTP ${res.status}). Please try again.`), { status: res.status });
  }
  return body as T;
}

type RawTraveller = Partial<Traveller> & { fullName?: string };
type AuthResponse = { accessToken: string; user: RawTraveller };

/** Backend sends `fullName` (same as book-mobile reads); the site uses `name`. */
function toTraveller(u: RawTraveller): Traveller {
  return { id: u.id || "", name: u.fullName || u.name || "", email: u.email || "", phone: u.phone || "", city: u.city || "", gender: u.gender || "Male", createdAt: u.createdAt || "" };
}

export async function register(input: { fullName: string; email: string; phone: string; password: string; city?: string; gender?: string }) {
  const body = { fullName: input.fullName, email: input.email, phone: digitsPhone(input.phone), password: input.password, city: input.city ?? "", gender: input.gender ?? "Male" };
  const res = await call<AuthResponse>("/book/auth/register", { method: "POST", body: JSON.stringify(body) });
  const user = toTraveller(res.user);
  session.save(res.accessToken, user);
  return user;
}

export async function login(emailOrPhone: string, password: string) {
  const key = emailOrPhone.trim();
  const normalized = /^\d/.test(key) || key.startsWith("+") ? digitsPhone(key) : key;
  const res = await call<AuthResponse>("/book/auth/login", { method: "POST", body: JSON.stringify({ emailOrPhone: normalized, password }) });
  const user = toTraveller(res.user);
  session.save(res.accessToken, user);
  return user;
}

export async function me() {
  const user = toTraveller(await call<RawTraveller>("/book/auth/me", { auth: true }));
  session.save(session.token(), user);
  return user;
}

export async function updateMe(input: { fullName?: string; phone?: string; city?: string; gender?: string }) {
  const user = toTraveller(await call<RawTraveller>("/book/auth/me", { method: "PATCH", auth: true, body: JSON.stringify(input) }));
  session.save(session.token(), user);
  return user;
}

export function verifyRazorpay(requestId: string, result: RazorpaySuccess) {
  return call<Order>(`/book/flights/orders/${encodeURIComponent(requestId)}/razorpay/verify`, { method: "POST", body: JSON.stringify(result) });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return call<{ ok: boolean; message: string }>("/book/auth/change-password", { method: "POST", auth: true, body: JSON.stringify({ currentPassword, newPassword }) });
}

export async function searchFlights(input: SearchInput) {
  const body = JSON.stringify({ origin: input.origin, destination: input.destination, travelDate: input.travelDate, adults: input.adults, cabin: input.cabin, bookingType: 0 });
  const guest = () => call<{ flights: Flight[]; mock: boolean }>("/book/flights/search/guest", { method: "POST", body });
  if (!session.token()) return guest();
  try {
    return await call<{ flights: Flight[]; mock: boolean }>("/book/flights/search", { method: "POST", auth: true, body });
  } catch (error) {
    // Expired session: show fares anyway (same results as a guest search).
    if ((error as { status?: number }).status === 401) return guest();
    throw error;
  }
}

export const quote = (netFare: number, sector: string) => call<Quote>("/book/flights/quote", { method: "POST", body: JSON.stringify({ netFare, sector }) });

export const checkout = (body: unknown) => call<Order>("/book/flights/checkout", { method: "POST", auth: true, body: JSON.stringify(body) });

export const getOrder = (id: string) => call<Order>(`/book/flights/orders/${encodeURIComponent(id)}`, { auth: true });

export const demoPay = (id: string) => call<Order>(`/book/flights/orders/${encodeURIComponent(id)}/demo-pay`, { method: "POST", auth: true, body: "{}" });

/** POST /book/flights/ticket-pdf - same fields as book-mobile downloadTicketPdf(). Saves the PDF. */
export async function downloadTicket(order: Order) {
  const f = order.flight || {};
  const res = await send("/book/flights/ticket-pdf", {
    method: "POST",
    body: JSON.stringify({
      bookingId: order.requestId,
      pnr: order.pnr || "",
      airline: f.airline || "",
      flightCode: f.flightCode || "",
      fromCode: f.fromCode || "",
      toCode: f.toCode || "",
      date: f.date || "",
      depart: f.depart || "",
      arrive: f.arrive || "",
      duration: f.duration || "",
      travellerName: order.travellerName || "",
      email: order.travellerEmail || "",
      phone: digitsPhone(order.travellerPhone || ""),
      total: order.total,
      cabin: f.cabin || "",
      airlineCode: f.airlineCode || "",
      fromCity: cityOf(f.fromCode || ""),
      toCity: cityOf(f.toCode || ""),
      passengers: (order.passengers ?? []).map((p) => [p.title, p.fullName].filter(Boolean).join(" ")).filter(Boolean),
      netFare: order.netFare,
      convenienceFee: order.markup,
      gst: order.gst,
    }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const detail = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    throw new Error(`Could not download the e-ticket${detail ? `: ${detail}` : ` (HTTP ${res.status})`}.`);
  }
  const name = /filename="?([^";]+)"?/.exec(res.headers.get("Content-Disposition") || "")?.[1] || `eticket-${order.requestId}.pdf`;
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const airports: [string, string][] = [
  ["DEL", "Delhi"],
  ["BOM", "Mumbai"],
  ["BLR", "Bengaluru"],
  ["MAA", "Chennai"],
  ["CCU", "Kolkata"],
  ["HYD", "Hyderabad"],
  ["PNQ", "Pune"],
  ["GOI", "Goa"],
  ["AMD", "Ahmedabad"],
  ["JAI", "Jaipur"],
  ["COK", "Kochi"],
  ["LKO", "Lucknow"],
  ["IXC", "Chandigarh"],
  ["ATQ", "Amritsar"],
  ["PAT", "Patna"],
  ["DXB", "Dubai"],
  ["SIN", "Singapore"],
  ["BKK", "Bangkok"],
];
const international = new Set(["DXB", "SIN", "BKK"]);
export const sectorOf = (from: string, to: string) => (international.has(from) || international.has(to) ? "international" : "domestic");
export const cityOf = (code: string) => airports.find(([c]) => c === code)?.[1] ?? code;
/** Exact rupees: whole amounts without decimals, otherwise 2 decimals (e.g. ₹6,890.58). */
export const inr = (n: number) => {
  const v = Number(n || 0);
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
};
