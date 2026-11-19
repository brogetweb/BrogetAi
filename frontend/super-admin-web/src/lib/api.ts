const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1").replace(/\/+$/, "");
const accessKey = "berogetai-access";
const refreshKey = "berogetai-refresh";

export type AdminAccount = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  user: AdminAccount;
};

type ErrorBody = { message?: string | string[] };

function errorMessage(body: ErrorBody | null, fallback: string) {
  if (!body?.message) return fallback;
  return Array.isArray(body.message) ? body.message[0] : body.message;
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => null)) as ErrorBody | null;
  return errorMessage(body, fallback);
}

export function saveSession(session: AdminSession) {
  window.sessionStorage.setItem(accessKey, session.accessToken);
  window.sessionStorage.setItem(refreshKey, session.refreshToken);
  window.sessionStorage.removeItem("berogetai-super-admin");
}

export function clearSession() {
  window.sessionStorage.removeItem(accessKey);
  window.sessionStorage.removeItem(refreshKey);
  window.sessionStorage.removeItem("berogetai-super-admin");
}

export async function login(email: string, password: string): Promise<AdminSession> {
  let response: Response;
  try {
    response = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("The API is not reachable. Start the backend and MongoDB.");
  }
  if (!response.ok) throw new Error(await readError(response, "That email or password does not match."));
  const body = (await response.json()) as AdminSession;
  if (!body.accessToken || !body.refreshToken || !body.user?.email) throw new Error("The API did not return a session.");
  return { accessToken: body.accessToken, refreshToken: body.refreshToken, user: body.user };
}

async function accountFrom(access: string) {
  const me = await fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${access}` } });
  if (!me.ok) return null;
  return (await me.json()) as AdminAccount;
}

export async function restoreSession() {
  const access = window.sessionStorage.getItem(accessKey);
  const refresh = window.sessionStorage.getItem(refreshKey);
  if (!access || !refresh) return null;
  try {
    const current = await accountFrom(access);
    if (current?.email) return current;
    const renewed = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    if (!renewed.ok) {
      clearSession();
      return null;
    }
    const body = (await renewed.json()) as AdminSession;
    if (!body.accessToken || !body.refreshToken) {
      clearSession();
      return null;
    }
    saveSession(body);
    if (body.user?.email) return body.user;
    return accountFrom(body.accessToken);
  } catch {
    return null;
  }
}

export type AgentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: "active" | "inactive";
  createdAt?: string | null;
  lastLoginAt?: string | null;
  passwordChangedAt?: string | null;
  mustChangePassword?: boolean;
};

export type AdminProfile = AdminAccount & {
  memberSince: string | null;
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
};

/** PATCH /agents/:id - name, login email, mobile, city. A new email signs the agent out everywhere. */
export async function updateAgent(id: string, input: { name: string; email: string; phone: string; city: string }) {
  const response = await authorized(`/agents/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await readError(response, "Could not save the agent."));
  return (await response.json()) as AgentProfile;
}

/** POST /agents/:id/reset-password - signs the agent out everywhere and asks them to pick their own password. */
export async function resetAgentPassword(id: string, newPassword: string) {
  const response = await authorized(`/agents/${encodeURIComponent(id)}/reset-password`, { method: "POST", body: JSON.stringify({ newPassword }) });
  if (!response.ok) throw new Error(await readError(response, "Could not reset the password."));
  return (await response.json()) as AgentProfile & { signedOut: number };
}

/** POST /agents/:id/logout-all */
export async function logoutAgentEverywhere(id: string) {
  const response = await authorized(`/agents/${encodeURIComponent(id)}/logout-all`, { method: "POST" });
  if (!response.ok) throw new Error(await readError(response, "Could not sign the agent out."));
  return (await response.json()) as { id: string; signedOut: number };
}

/** GET /auth/admin/me */
export async function fetchAdminProfile() {
  const response = await authorized("/auth/admin/me");
  if (!response.ok) throw new Error(await readError(response, "Could not load your account."));
  return (await response.json()) as AdminProfile;
}

/** PATCH /auth/admin/me */
export async function updateAdminProfile(name: string) {
  const response = await authorized("/auth/admin/me", { method: "PATCH", body: JSON.stringify({ name }) });
  if (!response.ok) throw new Error(await readError(response, "Could not save your name."));
  return (await response.json()) as AdminProfile;
}

/** POST /auth/admin/change-password - other admin sessions end; this tab gets a fresh session. */
export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const response = await authorized("/auth/admin/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) });
  if (!response.ok) throw new Error(await readError(response, "Could not change your password."));
  const body = (await response.json()) as AdminSession & { profile: AdminProfile };
  if (body.accessToken && body.refreshToken) saveSession(body);
  return body.profile;
}

export type WalletOverview = {
  aopay: { configured: boolean; ok: boolean; balance: number | null; message: string; checkedAt: string };
  chargePerCheck: number;
  totals: { recharged: number; topups: number; testRecharged: number; used: number; checks: number; agentBalances: number; agentsWithRecharge: number };
  agents: {
    agentId: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    balance: number;
    recharged: number;
    topups: number;
    testRecharged: number;
    used: number;
    checks: number;
    pendingTopups: number;
    lastTopupAt: string | null;
    lastCheckAt: string | null;
  }[];
  recentTopups: { id: string; agentId: string; agentName: string; amount: number; status: string; note: string; utr: string; testMode: boolean; createdAt: string }[];
};

/** GET /wallet/admin/overview - AO Pay balance, per-agent recharge/usage and latest top-ups. */
export async function walletOverview() {
  const response = await authorized("/wallet/admin/overview");
  if (!response.ok) throw new Error(await readError(response, "Could not load the wallet overview."));
  return (await response.json()) as WalletOverview;
}

/** Strong random password for a reset: 12 chars, letters + digits, no look-alike characters. */
export function generatePassword() {
  const letters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const all = letters + digits;
  const pick = (set: string) => set[crypto.getRandomValues(new Uint32Array(1))[0] % set.length];
  const chars = [pick(letters), pick(digits), ...Array.from({ length: 10 }, () => pick(all))];
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

async function authorized(path: string, init: RequestInit = {}) {
  const access = window.sessionStorage.getItem(accessKey);
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error("The API is not reachable.");
  }
  return response;
}

export type TravelUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  gender: string;
  status: "active" | "inactive";
  bookings: number;
  createdAt: string;
};

export async function listTravelUsers() {
  const response = await authorized("/book/travellers");
  if (!response.ok) throw new Error(await readError(response, "Could not load travel users."));
  return (await response.json()) as TravelUserRow[];
}

export type FlightOrderRow = {
  requestId: string;
  status: string;
  sector: string;
  markupPercent: number;
  netFare: number;
  markup: number;
  gst: number;
  total: number;
  moneyTo?: {
    aoPayWallet: number;
    brogetFee: number;
    gst: number;
    customerPaid: number;
  };
  pnr: string;
  travellerName: string;
  travellerEmail: string;
  travellerPhone: string;
  route: string;
  airline: string;
  flightCode: string;
  date: string;
  paymentMode: string;
  createdAt: string;
};

export async function listFlightOrders() {
  const response = await authorized("/book/flights/orders");
  if (!response.ok) throw new Error(await readError(response, "Could not load flight orders."));
  return (await response.json()) as FlightOrderRow[];
}

export async function setTravelUserStatus(id: string, status: TravelUserRow["status"]) {
  const response = await authorized(`/book/travellers/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await readError(response, "Could not update the user."));
  return (await response.json()) as TravelUserRow;
}

export async function listAgents() {
  const response = await authorized("/agents");
  if (!response.ok) throw new Error(await readError(response, "Could not load agents."));
  return (await response.json()) as AgentProfile[];
}

export async function createAgent(input: { name: string; email: string; phone: string; city: string; password: string }) {
  const response = await authorized("/agents", { method: "POST", body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await readError(response, "Could not create the agent."));
  return (await response.json()) as AgentProfile;
}

export async function deleteAgent(id: string) {
  const response = await authorized(`/agents/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readError(response, "Could not delete the agent."));
  return (await response.json()) as { id: string };
}

export async function setAgentStatus(id: string, status: AgentProfile["status"]) {
  const response = await authorized(`/agents/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await readError(response, "Could not update the agent."));
  return (await response.json()) as AgentProfile;
}

export type CreditReportRow = {
  id: string;
  agentId: string;
  agentName: string;
  name: string;
  mobile: string;
  email: string;
  pan: string;
  dateOfBirth: string;
  status: "ready" | "failed";
  score: number | null;
  message: string;
  createdAt: string;
};

export async function houseWallet() {
  const response = await authorized("/wallet/house");
  if (!response.ok) throw new Error(await readError(response, "Could not load the Broget wallet."));
  return (await response.json()) as { balance: number; charge: number };
}

export type CibilAgentRevenue = {
  agentId: string;
  agentMongoId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  status: string;
  walletBalance: number;
  checks: number;
  amount: number;
  fee: number;
  gst: number;
  lastCheckAt: string | null;
  hasActivity: boolean;
};

export type CibilRevenueSnapshot = {
  chargePerCheck: number;
  feePerCheck: number;
  gstPerCheck: number;
  totalChecks: number;
  totalAmount: number;
  activeAgents: number;
  silentAgents: number;
  agents: CibilAgentRevenue[];
};

export async function cibilRevenue() {
  const response = await authorized("/wallet/cibil-revenue");
  if (!response.ok) throw new Error(await readError(response, "Could not load CIBIL revenue."));
  return (await response.json()) as CibilRevenueSnapshot;
}

export async function listCreditReports() {
  const response = await authorized("/credit-reports");
  if (!response.ok) throw new Error(await readError(response, "Could not load credit reports."));
  return (await response.json()) as CreditReportRow[];
}

export async function deleteCreditReport(id: string) {
  const response = await authorized(`/credit-reports/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readError(response, "Could not delete the credit report."));
  return (await response.json()) as { id: string; customer: CustomerRow | null };
}

export async function downloadCreditReport(id: string) {
  const response = await authorized(`/credit-reports/${encodeURIComponent(id)}/download`);
  if (!response.ok) throw new Error(await readError(response, "Could not download the report."));
  const blob = await response.blob();
  const named = /filename="([^"]+)"/.exec(response.headers.get("Content-Disposition") ?? "");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = named?.[1] || "credit-report.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type CustomerRow = {
  id: string;
  agentId: string;
  agentName: string;
  name: string;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  pan: string;
  dateOfBirth: string;
  kyc: string;
  cibil: string;
  score: number | null;
  createdAt: string;
};

export type KycDocumentRow = {
  id: string;
  agentId: string;
  agentName: string;
  kind: string;
  fileName: string;
  status: string;
  stored: boolean;
  createdAt: string;
};

export async function listCustomers() {
  const response = await authorized("/customers");
  if (!response.ok) throw new Error(await readError(response, "Could not load customers."));
  return (await response.json()) as CustomerRow[];
}

export async function deleteCustomer(id: string) {
  const response = await authorized(`/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readError(response, "Could not delete the customer."));
  return (await response.json()) as { id: string };
}

export async function listKycDocuments() {
  const response = await authorized("/kyc-documents");
  if (!response.ok) throw new Error(await readError(response, "Could not load KYC documents."));
  return (await response.json()) as KycDocumentRow[];
}

export async function deleteKycDocument(id: string) {
  const response = await authorized(`/kyc-documents/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await readError(response, "Could not delete the document."));
  return (await response.json()) as { id: string };
}

export async function logout() {
  const refresh = window.sessionStorage.getItem(refreshKey);
  clearSession();
  if (!refresh) return;
  await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  }).catch(() => undefined);
}
