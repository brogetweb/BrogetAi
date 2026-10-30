export type Row = {
  cells: string[];
  tone?: "ok" | "wait" | "bad" | "info";
};

export type Section = {
  slug: string;
  label: string;
  group: string;
  title: string;
  blurb: string;
  columns: string[];
  rows: Row[];
};

export const flights: Row[] = [];

export const hotels: Row[] = [];

export const sections: Section[] = [
  {
    slug: "flights",
    label: "Flights",
    group: "Travel",
    title: "Flights",
    blurb: "Live Book payments only. Customer → Broget Pay; net fare → AO Pay; Broget fee 4% domestic / 7% intl + 18% GST.",
    columns: ["Customer", "Route", "Airline", "Amount", "Status", "Date"],
    rows: flights,
  },
  {
    slug: "hotels",
    label: "Hotels",
    group: "Travel",
    title: "Hotels",
    blurb: "Hotel bookings will show here when the Book hotel checkout is live. No sample rows.",
    columns: ["Customer", "Hotel", "Location", "Amount", "Status", "Date"],
    rows: hotels,
  },
  {
    slug: "users",
    label: "Active users",
    group: "Travel",
    title: "Active users",
    blurb: "Accounts created in Book by Broget AI (mobile). Live from MongoDB book_travellers.",
    columns: ["Name", "Email", "City", "Bookings", "Status"],
    rows: [],
  },
  {
    slug: "cibil",
    label: "Check CIBIL Report",
    group: "CIBIL",
    title: "Check CIBIL Report",
    blurb: "Per-agent CIBIL money from wallet usage: who paid how much, who has zero checks yet, plus every report. Fee comes from the agent wallet. PAN stays masked.",
    columns: ["Customer", "Agent", "PAN", "Score", "Band", "Status"],
    rows: [],
  },
  {
    slug: "customers",
    label: "Customer List",
    group: "CIBIL",
    title: "Customer List",
    blurb: "Customers appear here when an agent adds them or runs a credit check. The score from that check is on the row. PAN stays masked.",
    columns: ["Name", "Agent", "Mobile", "City", "CIBIL"],
    rows: [],
  },
  // KYC is paused. Restore this desk when document checks are needed again.
  // {
  //   slug: "kyc",
  //   label: "KYC & Documents",
  //   group: "CIBIL",
  //   title: "KYC & Documents",
  //   blurb: "KYC files an agent uploads show here: Aadhaar, PAN, selfie, and address proof.",
  //   columns: ["Customer", "Aadhaar", "PAN", "Selfie", "Address"],
  //   rows: [],
  // },
  {
    slug: "agents",
    label: "Agents",
    group: "Agents",
    title: "Agents",
    blurb: "Create an agent profile here. The agent uses this account in the agent app to add customers and run CIBIL checks.",
    columns: ["Agent", "ID", "City", "Customers"],
    rows: [],
  },
];

export const groups = ["Travel", "CIBIL", "Agents"];

export type TravelUser = {
  id: string;
  name: string;
  email: string;
  city: string;
  joined: string;
  bookings: number;
  status: "active" | "inactive";
};

export const travelUsers: TravelUser[] = [];

export type DeskCustomer = {
  id: string;
  name: string;
  phone: string;
  gender: string;
  dob: string;
  fatherName: string;
  motherName: string;
  pan: string;
  aadhaar: string;
  aadhaarName: string;
  aadhaarDob: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  kyc: string;
  cibil: string;
  score: string;
  agentId: string;
  added: string;
  consents: { purpose: string; at: string }[];
  documents: { name: string; kind: string; status: string; submitted: string }[];
};

export const agentCustomers: DeskCustomer[] = [];

export type DeskAgent = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: "active" | "inactive";
};

export const deskAgents: DeskAgent[] = [];

export function findAgent(id: string) {
  return deskAgents.find((agent) => agent.id === id);
}

export function agentLabel(id: string) {
  const agent = findAgent(id);
  return agent ? `${agent.name} · ${agent.id}` : id;
}

export function customersFor(agentId: string) {
  return agentCustomers.filter((customer) => customer.agentId === agentId);
}

export function scoreBand(score: string) {
  const value = Number(score);
  if (!Number.isFinite(value)) return "—";
  if (value >= 750) return "Excellent";
  if (value >= 700) return "Good";
  if (value >= 650) return "Fair";
  return "Poor";
}

export function phoneLabel(phone: string) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function maskPan(pan: string) {
  if (pan.length < 6) return pan;
  return `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
}

export function maskAadhaar(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return "—";
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function findCustomer(id: string) {
  return agentCustomers.find((customer) => customer.id === id);
}

export function findSection(slug: string) {
  return sections.find((section) => section.slug === slug);
}
