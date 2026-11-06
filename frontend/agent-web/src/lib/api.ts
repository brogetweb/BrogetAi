const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";
const accessKey = "broget-agent-access";
const refreshKey = "broget-agent-refresh";
const userKey = "broget-agent-user";

export type AgentAccount = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  city?: string;
  role: "agent";
};

export type AgentSession = {
  accessToken: string;
  refreshToken: string;
  user: AgentAccount;
};

export type Customer = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  pan: string;
  dateOfBirth: string;
  cibil: string;
  score: number | null;
};

export type CreditCheck = {
  id: string;
  name: string;
  mobile: string;
  pan?: string;
  status: string;
  score: number | null;
  message?: string;
  createdAt: string;
};

export type WalletSnapshot = {
  balance: number;
  added: number;
  spent: number;
  charge: number;
  fee: number;
  gst: number;
  lowBalance: boolean;
  entries: { id: string; kind: string; amount: number; status: string; note?: string; utr?: string; fee?: number; gst?: number; createdAt: string }[];
};

type ErrorBody = { message?: string | string[]; code?: string };

function errorMessage(body: ErrorBody | null, fallback: string) {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message[0] : body.message;
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ErrorBody | null;
  return errorMessage(body, fallback);
}

export function saveSession(session: AgentSession) {
  sessionStorage.setItem(accessKey, session.accessToken);
  sessionStorage.setItem(refreshKey, session.refreshToken);
  sessionStorage.setItem(userKey, JSON.stringify(session.user));
}

export function clearSession() {
  sessionStorage.removeItem(accessKey);
  sessionStorage.removeItem(refreshKey);
  sessionStorage.removeItem(userKey);
}

export function readStoredUser(): AgentAccount | null {
  try {
    const raw = sessionStorage.getItem(userKey);
    return raw ? (JSON.parse(raw) as AgentAccount) : null;
  } catch {
    return null;
  }
}

export async function loginAgent(email: string, password: string): Promise<AgentSession> {
  let response: Response;
  try {
    response = await fetch(`${base}/auth/agent/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("API not reachable.");
  }
  if (!response.ok) throw new Error(await readError(response, "Email or password does not match."));
  const body = (await response.json()) as AgentSession;
  if (!body.accessToken || !body.refreshToken || !body.user?.email) throw new Error("Login failed.");
  return body;
}

export async function restoreSession(): Promise<AgentAccount | null> {
  const access = sessionStorage.getItem(accessKey);
  const refresh = sessionStorage.getItem(refreshKey);
  const user = readStoredUser();
  if (!access || !refresh) return null;
  if (user?.email) return user;
  try {
    const renewed = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!renewed.ok) {
      clearSession();
      return null;
    }
    const body = (await renewed.json()) as AgentSession;
    if (!body.accessToken || !body.refreshToken || !body.user?.email) {
      clearSession();
      return null;
    }
    saveSession(body);
    return body.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function logout() {
  const refresh = sessionStorage.getItem(refreshKey);
  clearSession();
  if (!refresh) return;
  await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  }).catch(() => undefined);
}

async function authorized(path: string, init: RequestInit = {}) {
  let access = sessionStorage.getItem(accessKey) || "";
  const refresh = sessionStorage.getItem(refreshKey) || "";
  const run = (token: string) =>
    fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

  const response = await run(access);
  if (response.status !== 401 || !refresh) return response;
  const renewed = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!renewed.ok) {
    clearSession();
    return response;
  }
  const body = (await renewed.json()) as AgentSession;
  saveSession(body);
  access = body.accessToken;
  return run(access);
}

export async function walletSnapshot() {
  const response = await authorized("/wallet");
  if (!response.ok) throw new Error(await readError(response, "Could not load wallet."));
  return (await response.json()) as WalletSnapshot;
}

export type TopupResult = {
  requestId: string;
  paymentUrl: string;
  checkoutUrl?: string;
  upiUrl?: string;
  status?: string;
};

/** Same rules the backend DTO and the agent mobile app enforce. */
export function validateTopup(amount: number, mobile: string): string | null {
  if (!Number.isFinite(amount) || amount < 300) return "Broget Pay accepts ₹300 or more.";
  if (amount > 500000) return "The most you can add in one payment is ₹5,00,000.";
  if (Math.round(amount * 100) !== amount * 100) return "Use at most 2 decimal places.";
  if (!/^[6-9]\d{9}$/.test(mobile)) return "Enter a 10-digit mobile number.";
  return null;
}

/** POST /wallet/topups - identical call to the agent mobile app (createWalletTopup). */
export async function createTopup(amount: number, mobile: string) {
  const invalid = validateTopup(amount, mobile);
  if (invalid) throw new Error(invalid);
  let response: Response;
  try {
    response = await authorized("/wallet/topups", {
      method: "POST",
      body: JSON.stringify({ amount, mobile }),
      signal: AbortSignal.timeout(35_000),
    });
  } catch (error) {
    if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) {
      throw new Error("Broget Pay is taking too long. Check the wallet ledger before trying again.");
    }
    throw new Error("API not reachable. Check your connection and try again.");
  }
  if (response.status === 401) throw new Error("Your session expired. Sign in again.");
  if (!response.ok) throw new Error(await readError(response, "Could not start top-up."));
  const body = (await response.json()) as TopupResult;
  if (!body.paymentUrl) throw new Error("Broget Pay did not return a payment link.");
  return body;
}

export async function listCustomers() {
  const response = await authorized("/customers/mine");
  if (!response.ok) throw new Error(await readError(response, "Could not load customers."));
  return (await response.json()) as Customer[];
}

export async function createCustomer(input: {
  firstName: string;
  lastName: string;
  mobile: string;
  dateOfBirth: string;
  email: string;
  pan: string;
}) {
  const response = await authorized("/customers", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await readError(response, "Could not save customer."));
  return (await response.json()) as Customer;
}

export async function listCreditChecks() {
  const response = await authorized("/credit-reports/mine");
  if (!response.ok) throw new Error(await readError(response, "Could not load checks."));
  return (await response.json()) as CreditCheck[];
}

export async function requestCreditReport(input: {
  firstName: string;
  lastName: string;
  mobile: string;
  dateOfBirth: string;
  email: string;
  pan: string;
  otp: string;
}) {
  const response = await authorized("/credit-reports", {
    method: "POST",
    body: JSON.stringify({ ...input, consentAcceptance: "Yes" }),
  });
  if (!response.ok) throw new Error(await readError(response, "CIBIL check failed."));
  return (await response.json()) as { id: string; name: string; message: string; score: number | null };
}

export async function fetchCreditPdf(id: string) {
  const response = await authorized(`/credit-reports/mine/${encodeURIComponent(id)}/download`);
  if (!response.ok) throw new Error(await readError(response, "Could not load PDF."));
  const blob = await response.blob();
  const named = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "");
  const filename = named?.[1] || "credit-report.pdf";
  const url = URL.createObjectURL(blob);
  return { blob, url, filename };
}

export async function downloadCreditPdf(id: string) {
  const file = await fetchCreditPdf(id);
  const a = document.createElement("a");
  a.href = file.url;
  a.download = file.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(file.url);
}

export async function viewCreditPdf(id: string) {
  const file = await fetchCreditPdf(id);
  window.open(file.url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(file.url), 60_000);
  return file;
}
