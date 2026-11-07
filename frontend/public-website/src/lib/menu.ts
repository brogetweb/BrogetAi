export type MenuItem = {
  href: string;
  label: string;
  text: string;
  image: string;
  slug: string;
  soon?: boolean;
  site?: { url: string; name: string };
};

export type MenuGroup = {
  id: string;
  label: string;
  headline: string;
  lede: string;
  items: MenuItem[];
};

const brogetPay = { url: "https://brogetpay.com/", name: "brogetpay.com" };

function item(slug: string, rest: Omit<MenuItem, "slug" | "href">): MenuItem {
  return { slug, href: `/services/${slug}`, ...rest };
}

export const menuGroups: MenuGroup[] = [
  {
    id: "travel",
    label: "Travel",
    headline: "Book the journey in real time.",
    lede: "Flights, trains, buses, and hotels. Fares and seats update as you search.",
    items: [
      item("flight-booking", { label: "Flight Booking", text: "Search live fares and book the flight in real time.", image: "/images/home/home-flight.jpg", soon: true }),
      item("train-booking", { label: "Train Booking", text: "See live seats and book the train in real time.", image: "/images/home/home-train.jpg", soon: true }),
      item("bus-booking", { label: "Bus Booking", text: "Check live coaches and book the bus in real time.", image: "/images/home/home-bus.jpg", soon: true }),
      item("hotel-booking", { label: "Hotel Booking", text: "See live rooms and book the stay in real time.", image: "/images/home/home-hotel.jpg", soon: true }),
    ],
  },
  {
    id: "banking",
    label: "Banking",
    headline: "Credit, savings, and deposits in one place.",
    lede: "CIBIL, a monthly SIP, and fixed or recurring deposits.",
    items: [
      item("cibil", { label: "CIBIL", text: "Access CIBIL credit reports instantly.", image: "/images/home/home-cibil.jpg", site: { url: "https://cibil.brogetai.com/", name: "cibil.brogetai.com" } }),
      item("sip", { label: "SIP", text: "Start a monthly savings plan beside the rest of the desk.", image: "/images/home/home-sip.jpg", soon: true }),
      item("fd-rd", { label: "FD & RD", text: "Enable fixed and recurring deposit services.", image: "/images/home/home-deposit.jpg", soon: true }),
    ],
  },
  {
    id: "payment",
    label: "Payment",
    headline: "Take money in. Send money out.",
    lede: "A gateway, pay-in collections, and a payout rail for banks, wallets, and UPI. Powered by BroGetPay.",
    items: [
      item("payment-gateway", { label: "Payment Gateway", text: "Accept secure online payments for purchases, subscriptions, and more.", image: "/images/home/home-gateway.jpg", site: brogetPay }),
      item("pay-in", { label: "Pay In", text: "Collect payments by UPI QR, payment link, and bank transfer.", image: "/images/home/home-payment-link.jpg", site: brogetPay }),
      item("payout", { label: "PayOut", text: "Disburse payments to bank accounts, wallets, UPI, and cards.", image: "/images/home/home-payout.jpg", site: brogetPay }),
    ],
  },
  {
    id: "products",
    label: "Our Services",
    headline: "The desks beside travel and money.",
    lede: "Builder work, education, health, and agriculture.",
    items: [
      item("builder-ships", { label: "Builder Ships", text: "Construction, sites, and builder projects in one place.", image: "/images/home/home-builder.jpg", site: { url: "https://www.builderbroget.com/", name: "builderbroget.com" } }),
      item("education", { label: "Education Ecosystem", text: "Learning, campuses, and student services in one place.", image: "/images/home/home-education.jpg", soon: true }),
      item("health-care", { label: "Health Care", text: "Clinics, care, and health services for families.", image: "/images/home/home-health.jpg", soon: true }),
      item("agriculture", { label: "Agriculture", text: "Farm inputs, markets, and grower services.", image: "/images/home/home-agriculture.jpg", soon: true }),
    ],
  },
];

export const allServices = menuGroups.flatMap((group) => group.items.map((entry) => ({ group, item: entry })));

export const liveServices = allServices.filter(({ item: entry }) => !entry.soon);

export const plainLinks = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

export function findService(slug: string) {
  return allServices.find(({ item: entry }) => entry.slug === slug) ?? null;
}

export const serviceSlugs = allServices.map(({ item: entry }) => entry.slug);

export function pageLabel(pathname: string) {
  const plain = plainLinks.find((link) => link.href === pathname);
  if (plain) return plain.label;
  const found = allServices.find(({ item: entry }) => entry.href === pathname);
  if (found) return found.item.label;
  if (pathname === "/") return "Home";
  if (pathname === "/flights") return "Flights";
  if (pathname === "/hotels") return "Hotels";
  if (pathname === "/privacy") return "Privacy";
  if (pathname === "/terms") return "Terms";
  return "Page";
}
