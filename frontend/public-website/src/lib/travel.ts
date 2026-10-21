export const destinations = [
  {
    city: "Dubai",
    country: "United Arab Emirates",
    image: "/images/dubai.jpg",
    note: "Skyline weekends",
    blurb: "Glass, desert light, and a city that stays awake.",
  },
  {
    city: "Bali",
    country: "Indonesia",
    image: "/images/bali.jpg",
    note: "Island mornings",
    blurb: "Rice terraces, warm mist, and a slower pace.",
  },
  {
    city: "Singapore",
    country: "Singapore",
    image: "/images/singapore.jpg",
    note: "City nights",
    blurb: "Gardens, harbour lights, and an easy long weekend.",
  },
  {
    city: "Maldives",
    country: "Maldives",
    image: "/images/maldives.jpg",
    note: "Lagoon stays",
    blurb: "Clear water and a deck that feels far from everything.",
  },
  {
    city: "Goa",
    country: "India",
    image: "/images/goa.jpg",
    note: "Coastal evenings",
    blurb: "Palms, a long beach, and sunset over the water.",
  },
] as const;

export const routes = [
  { from: "Delhi", to: "Dubai", image: "/images/dubai.jpg", note: "A favourite city break" },
  { from: "Mumbai", to: "Singapore", image: "/images/singapore.jpg", note: "Harbour lights, one flight away" },
  { from: "Bengaluru", to: "Bali", image: "/images/bali.jpg", note: "Leave the week behind" },
  { from: "Delhi", to: "Goa", image: "/images/goa.jpg", note: "A short hop to the coast" },
] as const;

export function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
