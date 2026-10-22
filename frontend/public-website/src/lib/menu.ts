export type MenuItem = {
  href: string;
  label: string;
  text: string;
  image: string;
  slug?: string;
  soon?: boolean;
};

export type MenuGroup = {
  id: string;
  label: string;
  headline: string;
  lede: string;
  items: MenuItem[];
};

export const menuGroups: MenuGroup[] = [
  {
    id: "travel",
    label: "Travel",
    headline: "Book the journey in real time.",
    lede: "Flights, trains, buses, and hotels. Fares and seats update as you search.",
    items: [
      { slug: "flight-booking", href: "/services/flight-booking", label: "Flight Booking", text: "Search live fares and book the flight in real time.", image: "/images/home/home-flight.jpg", soon: true },
      { slug: "train-booking", href: "/services/train-booking", label: "Train Booking", text: "See live seats and book the train in real time.", image: "/images/home/home-train.jpg", soon: true },
      { slug: "bus-booking", href: "/services/bus-booking", label: "Bus Booking", text: "Check live coaches and book the bus in real time.", image: "/images/home/home-bus.jpg", soon: true },
      { slug: "hotel-booking", href: "/services/hotel-booking", label: "Hotel Booking", text: "See live rooms and book the stay in real time.", image: "/images/home/home-hotel.jpg", soon: true },
    ],
  },
  {
    id: "banking",
    label: "Banking",
    headline: "Credit, savings, and deposits in one place.",
    lede: "CIBIL, a monthly SIP, and fixed or recurring deposits.",
    items: [
      { href: "/cibil", label: "CIBIL", text: "Access CIBIL credit reports instantly.", image: "/images/home/home-cibil.jpg", soon: true },
      { href: "/sip", label: "SIP", text: "Start a monthly savings plan beside the rest of the desk.", image: "/images/home/home-sip.jpg", soon: true },
      { slug: "fd-rd", href: "/services/fd-rd", label: "FD & RD", text: "Enable fixed and recurring deposit services.", image: "/images/home/home-deposit.jpg", soon: true },
    ],
  },
  {
    id: "payment",
    label: "Payment",
    headline: "Take money in. Send money out.",
    lede: "A gateway, a payment link, and a payout rail for banks, wallets, and UPI.",
    items: [
      { href: "https://gateway.brogetpay.com/", label: "Payment Gateway", text: "Accept secure online payments for purchases, subscriptions, and more.", image: "/images/home/home-gateway.jpg" },
      { slug: "payment-link", href: "/services/payment-link", label: "Payment Link", text: "Send a link and collect the payment without a checkout page.", image: "/images/home/home-payment-link.jpg", soon: true },
      { slug: "payout", href: "/services/payout", label: "PayOut", text: "Disburse payments to bank accounts, wallets, UPI, and cards.", image: "/images/home/home-payout.jpg", soon: true },
    ],
  },
  {
    id: "products",
    label: "Our Services",
    headline: "The desks beside travel and money.",
    lede: "Education, health, agriculture, and builder work.",
    items: [
      { slug: "education", href: "/services/education", label: "Education Ecosystem", text: "Learning, campuses, and student services in one place.", image: "/images/home/home-education.jpg", soon: true },
      { slug: "health-care", href: "/services/health-care", label: "Health Care", text: "Clinics, care, and health services for families.", image: "/images/home/home-health.jpg", soon: true },
      { slug: "agriculture", href: "/services/agriculture", label: "Agriculture", text: "Farm inputs, markets, and grower services.", image: "/images/home/home-agriculture.jpg", soon: true },
      { href: "https://www.builderbroget.com/", label: "Builder Ships", text: "Construction, sites, and builder projects in one place.", image: "/images/home/home-builder.jpg" },
    ],
  },
];

export const plainLinks = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

export function findService(slug: string) {
  for (const group of menuGroups) {
    const item = group.items.find((entry) => entry.slug === slug);
    if (item) return { group, item };
  }
  return null;
}

export const serviceSlugs = menuGroups.flatMap((group) => group.items.flatMap((item) => (item.slug ? [item.slug] : [])));

export function pageLabel(pathname: string) {
  const plain = plainLinks.find((link) => link.href === pathname);
  if (plain) return plain.label;
  for (const group of menuGroups) {
    const item = group.items.find((entry) => entry.href === pathname);
    if (item) return item.label;
  }
  if (pathname === "/") return "Home";
  if (pathname === "/flights") return "Flights";
  if (pathname === "/hotels") return "Hotels";
  if (pathname === "/privacy") return "Privacy";
  if (pathname === "/terms") return "Terms";
  return "Page";
}
