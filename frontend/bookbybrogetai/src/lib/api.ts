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
export type Order = Quote & { requestId: string; status: string; paymentUrl?: string; checkoutUrl?: string; demo?: boolean; message?: string; flight?: Record<string, string>; createdAt?: string };

const safe = <T,>(fn: () => T, fallback: T) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const session = {
  token: () => safe(() => localStorage.getItem(tokenKey) || "", ""),
  user: () => safe(() => JSON.parse(localStorage.getItem(userKey) || "null") as Traveller | null, null),
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

async function call<T>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (init.auth) headers.Authorization = `Bearer ${session.token()}`;
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
  } catch {
    throw new Error("Can't reach the server. Check your internet and try again.");
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && init.auth) session.clear();
  if (!res.ok) {
    const msg = (body as { message?: string | string[] }).message;
    throw new Error(Array.isArray(msg) ? msg[0] : msg || "Something went wrong. Try again.");
  }
  return body as T;
}

type AuthResponse = { accessToken: string; user: Traveller };

export async function register(input: { fullName: string; email: string; phone: string; password: string; city?: string; gender?: string }) {
  const res = await call<AuthResponse>("/book/auth/register", { method: "POST", body: JSON.stringify(input) });
  session.save(res.accessToken, res.user);
  return res.user;
}

export async function login(emailOrPhone: string, password: string) {
  const res = await call<AuthResponse>("/book/auth/login", { method: "POST", body: JSON.stringify({ emailOrPhone, password }) });
  session.save(res.accessToken, res.user);
  return res.user;
}

export async function me() {
  const user = await call<Traveller>("/book/auth/me", { auth: true });
  session.save(session.token(), user);
  return user;
}

export async function updateMe(input: { fullName?: string; phone?: string; city?: string; gender?: string }) {
  const user = await call<Traveller>("/book/auth/me", { method: "PATCH", auth: true, body: JSON.stringify(input) });
  session.save(session.token(), user);
  return user;
}

export async function searchFlights(input: SearchInput) {
  const signedIn = Boolean(session.token());
  const res = await call<{ flights: Flight[]; mock: boolean }>(signedIn ? "/book/flights/search" : "/book/flights/search/guest", {
    method: "POST",
    auth: signedIn,
    body: JSON.stringify(input),
  });
  return res;
}

export const quote = (netFare: number, sector: string) => call<Quote>("/book/flights/quote", { method: "POST", body: JSON.stringify({ netFare, sector }) });

export const checkout = (body: unknown) => call<Order>("/book/flights/checkout", { method: "POST", auth: true, body: JSON.stringify(body) });

export const getOrder = (id: string) => call<Order>(`/book/flights/orders/${encodeURIComponent(id)}`, { auth: true });

export const demoPay = (id: string) => call<Order>(`/book/flights/orders/${encodeURIComponent(id)}/demo-pay`, { method: "POST", auth: true });

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
export const inr = (n: number) => `₹${Math.round(Number(n || 0)).toLocaleString("en-IN")}`;
