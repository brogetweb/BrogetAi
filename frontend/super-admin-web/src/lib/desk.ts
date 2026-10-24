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

export const flights: Row[] = [
  { cells: ["Amit Singh", "DEL → BOM", "Air India", "₹8,420", "Confirmed", "14 Oct"], tone: "ok" },
  { cells: ["Neha Dubey", "BLR → GOI", "IndiGo", "₹6,150", "Ticketed", "16 Oct"], tone: "info" },
  { cells: ["Vikram Reddy", "HYD → DEL", "Air India", "₹11,900", "Pending", "12 Oct"], tone: "wait" },
  { cells: ["Pooja Kumari", "PAT → DEL", "IndiGo", "₹7,240", "Confirmed", "18 Oct"], tone: "ok" },
  { cells: ["Rahul Kumar", "JAI → BOM", "SpiceJet", "₹5,480", "Pending", "11 Oct"], tone: "wait" },
];

export const hotels: Row[] = [
  { cells: ["Amit Singh", "Seaface Suites", "Mumbai", "₹14,200", "Confirmed", "14 Oct"], tone: "ok" },
  { cells: ["Pooja Kumari", "Lake House", "Udaipur", "₹9,800", "Pending", "18 Oct"], tone: "wait" },
  { cells: ["Rahul Kumar", "Fort View", "Jaipur", "₹7,450", "Confirmed", "11 Oct"], tone: "ok" },
  { cells: ["Neha Dubey", "River Inn", "Goa", "₹12,600", "Ticketed", "16 Oct"], tone: "info" },
  { cells: ["Vikram Reddy", "Park Square", "Hyderabad", "₹8,100", "Pending", "12 Oct"], tone: "wait" },
];

export const sections: Section[] = [
  {
    slug: "flights",
    label: "Flights",
    group: "Travel",
    title: "Flights",
    blurb: "Flight bookings from the public site. TripJack stays on the server.",
    columns: ["Customer", "Route", "Airline", "Amount", "Status", "Date"],
    rows: flights,
  },
  {
    slug: "hotels",
    label: "Hotels",
    group: "Travel",
    title: "Hotels",
    blurb: "Hotel bookings from the public site. Provider keys stay on the server.",
    columns: ["Customer", "Hotel", "Location", "Amount", "Status", "Date"],
    rows: hotels,
  },
  {
    slug: "users",
    label: "Active users",
    group: "Travel",
    title: "Active users",
    blurb: "Accounts created on the public website for travel and booking. These rows are samples until the API is connected.",
    columns: ["Name", "Email", "City", "Bookings", "Status"],
    rows: [],
  },
  {
    slug: "cibil",
    label: "Check CIBIL Report",
    group: "CIBIL",
    title: "Check CIBIL Report",
    blurb: "Agents request a credit report after the customer accepts consent and shares the OTP. The fee comes from the agent's Broget Pay wallet. This desk lists every report. PAN stays masked.",
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

export const travelUsers: TravelUser[] = [
  { id: "U1", name: "Amit Singh", email: "amit.singh@email.com", city: "Delhi", joined: "2 Oct 2026", bookings: 2, status: "active" },
  { id: "U2", name: "Neha Dubey", email: "neha.dubey@email.com", city: "Bengaluru", joined: "4 Oct 2026", bookings: 2, status: "active" },
  { id: "U3", name: "Pooja Kumari", email: "pooja.kumari@email.com", city: "Patna", joined: "6 Oct 2026", bookings: 2, status: "active" },
  { id: "U4", name: "Meera Joshi", email: "meera.joshi@email.com", city: "Mumbai", joined: "8 Oct 2026", bookings: 0, status: "active" },
  { id: "U5", name: "Rahul Kumar", email: "rahul.kumar@email.com", city: "Jaipur", joined: "28 Sep 2026", bookings: 2, status: "inactive" },
  { id: "U6", name: "Vikram Reddy", email: "vikram.reddy@email.com", city: "Hyderabad", joined: "21 Sep 2026", bookings: 2, status: "inactive" },
];

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
