export const places = [
  { city: "Delhi", code: "DEL", airport: "Indira Gandhi International" },
  { city: "Mumbai", code: "BOM", airport: "Chhatrapati Shivaji" },
  { city: "Bengaluru", code: "BLR", airport: "Kempegowda" },
  { city: "Hyderabad", code: "HYD", airport: "Rajiv Gandhi" },
  { city: "Chennai", code: "MAA", airport: "Chennai International" },
  { city: "Goa", code: "GOI", airport: "Manohar International" },
  { city: "Jaipur", code: "JAI", airport: "Jaipur International" },
  { city: "Dubai", code: "DXB", airport: "Dubai International" },
  { city: "Abu Dhabi", code: "AUH", airport: "Zayed International" },
  { city: "Singapore", code: "SIN", airport: "Changi" },
  { city: "Bali", code: "DPS", airport: "Ngurah Rai" },
  { city: "Bangkok", code: "BKK", airport: "Suvarnabhumi" },
  { city: "Malé", code: "MLE", airport: "Velana" },
  { city: "London", code: "LHR", airport: "Heathrow" },
  { city: "Paris", code: "CDG", airport: "Charles de Gaulle" },
] as const;

export function placeLabel(city: string, code: string) {
  return `${city} (${code})`;
}

export function parsePlace(value: string) {
  const match = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (match) return { city: match[1].trim(), code: match[2].trim().toUpperCase() };
  const known = places.find(
    (place) => place.city.toLowerCase() === value.trim().toLowerCase() || place.code.toLowerCase() === value.trim().toLowerCase(),
  );
  if (known) return { city: known.city, code: known.code };
  const city = value.trim() || "Delhi";
  return { city, code: city.slice(0, 3).toUpperCase() };
}

export function inr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, "0")}m`;
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const airlines = ["IndiGo", "Air India", "Akasa Air", "Emirates", "Singapore Airlines", "Vistara"] as const;

export type FlightOffer = {
  id: string;
  airline: (typeof airlines)[number];
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  depart: string;
  arrive: string;
  nextDay: boolean;
  durationMin: number;
  stops: 0 | 1;
  price: number;
  seats: number;
};

export function buildFlights(fromRaw: string, toRaw: string): FlightOffer[] {
  const from = parsePlace(fromRaw || "Delhi (DEL)");
  const to = parsePlace(toRaw || "Dubai (DXB)");
  return Array.from({ length: 6 }, (_, index) => {
    const seed = hash(`${from.code}-${to.code}-${index}`);
    const stops = (seed % 4 === 0 ? 1 : 0) as 0 | 1;
    const hour = 5 + (seed % 16);
    const minute = (seed % 4) * 15;
    const durationMin = 125 + (seed % 180) + stops * 95;
    const departMinutes = hour * 60 + minute;
    const arriveMinutes = departMinutes + durationMin;
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      id: `${from.code}${to.code}${index}${seed % 97}`,
      airline: airlines[seed % airlines.length],
      from: from.city,
      to: to.city,
      fromCode: from.code,
      toCode: to.code,
      depart: `${pad(hour)}:${pad(minute)}`,
      arrive: `${pad(Math.floor(arriveMinutes / 60) % 24)}:${pad(arriveMinutes % 60)}`,
      nextDay: arriveMinutes >= 24 * 60,
      durationMin,
      stops,
      price: 5400 + (seed % 24000) + (stops ? 0 : 1800),
      seats: 2 + (seed % 8),
    };
  });
}

const hotelNames = ["Harbour House", "Palm & Stone", "Azure Court", "Lumen Suites", "Cove Retreat", "Northline"];
const hotelImages = ["/images/hotel-suite.jpg", "/images/hotel-pool.jpg", "/images/hotel-room.jpg", "/images/hotel-exterior.jpg"];
const cityImage: Record<string, string> = {
  Dubai: "/images/dubai.jpg",
  Bali: "/images/bali.jpg",
  Singapore: "/images/singapore.jpg",
  Malé: "/images/maldives.jpg",
  Maldives: "/images/maldives.jpg",
  Goa: "/images/goa.jpg",
};

export type StayOffer = {
  id: string;
  name: string;
  city: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  area: string;
  perks: string[];
};

export function buildStays(cityRaw: string): StayOffer[] {
  const place = parsePlace(cityRaw || "Dubai");
  const areas = ["City centre", "Waterfront", "Old quarter", "Airport road"];
  const perkSets = [
    ["Breakfast", "Pool", "Free cancellation"],
    ["Sea view", "Late checkout", "Wifi"],
    ["Spa", "Airport pickup", "Breakfast"],
    ["Rooftop", "Gym", "Wifi"],
  ];
  return Array.from({ length: 4 }, (_, index) => {
    const seed = hash(`${place.city}-stay-${index}`);
    const hero = index === 0 ? cityImage[place.city] : undefined;
    return {
      id: `${place.code}-stay-${index}`,
      name: `${hotelNames[index]} ${place.city}`,
      city: place.city,
      image: hero ?? hotelImages[seed % hotelImages.length],
      rating: Math.round((8 + (seed % 18) / 10) * 10) / 10,
      reviews: 120 + (seed % 1800),
      price: 3800 + (seed % 14000),
      area: areas[index % areas.length],
      perks: perkSets[index % perkSets.length],
    };
  });
}

export const collection = [
  { city: "Dubai", country: "United Arab Emirates", image: "/images/dubai.jpg", tag: "City", price: 18420, note: "Weekends that run late" },
  { city: "Bali", country: "Indonesia", image: "/images/bali.jpg", tag: "Island", price: 22150, note: "Mornings in the terraces" },
  { city: "Singapore", country: "Singapore", image: "/images/singapore.jpg", tag: "City", price: 16890, note: "One clean long weekend" },
  { city: "Malé", country: "Maldives", image: "/images/maldives.jpg", tag: "Beach", price: 31200, note: "A deck over clear water" },
  { city: "Goa", country: "India", image: "/images/goa.jpg", tag: "Beach", price: 6240, note: "Sunset, then dinner" },
] as const;

export const fareDeals = [
  { from: "Delhi", fromCode: "DEL", to: "Dubai", toCode: "DXB", image: "/images/dubai.jpg", price: 18420, cabin: "Economy" },
  { from: "Mumbai", fromCode: "BOM", to: "Singapore", toCode: "SIN", image: "/images/singapore.jpg", price: 21480, cabin: "Economy" },
  { from: "Bengaluru", fromCode: "BLR", to: "Bali", toCode: "DPS", image: "/images/bali.jpg", price: 24860, cabin: "Economy" },
  { from: "Delhi", fromCode: "DEL", to: "Goa", toCode: "GOI", image: "/images/goa.jpg", price: 6240, cabin: "Economy" },
] as const;

export function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function referenceFor(seed: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = hash(seed);
  let code = "BG";
  for (let i = 0; i < 5; i += 1) {
    code += alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length) || hash(code);
  }
  return code;
}
