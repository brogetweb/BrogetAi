import { LegalPage } from "@/components/legal-page";

const sections = [
  {
    id: "agreement",
    title: "These terms",
    clauses: [
      "These terms apply when you browse BerogetAI, search a fare or a stay, hold a trip, open an account, or write to the trip desk.",
      "They describe how the public website works today. A photo, a sample fare, or a city idea is not a confirmed ticket or a hotel voucher.",
      "Read them with the Privacy policy. Both pages apply to the same website.",
    ],
  },
  {
    id: "service",
    title: "The service",
    clauses: [
      "BerogetAI is a booking desk for flights and hotel stays. You can compare options and hold one while you decide.",
      "Credit score and SIP are marked coming soon. Those pages do not run a credit check and do not take a savings payment.",
      "Airline and hotel connections, when they are used, run from the server. Provider credentials are not placed in the browser.",
    ],
  },
  {
    id: "use",
    title: "Using the website",
    clauses: [
      "Use the site for your own trip search. Do not misuse a form, a hold, or an account to impersonate another traveller.",
      "Search fields stay in the page address so you can return to the same route, dates, and traveller count.",
      "City and hotel pictures are for browsing. They are not offers, fares, or room rates.",
    ],
  },
  {
    id: "fares",
    title: "Fares and stays",
    clauses: [
      "A price shown after a search is the fare or nightly rate for the cities, dates, and cabin you picked.",
      "That price can change when you change the route, the dates, the cabin, or the number of travellers.",
      "A listed stay is a room option for those dates. It is not a confirmed reservation until payment completes it.",
    ],
  },
  {
    id: "holds",
    title: "Holds",
    clauses: [
      "A hold keeps the fare or the room you selected, with a reference shown on screen.",
      "Payment is what tickets the fare or confirms the room. A hold by itself is not a completed booking.",
      "If you write about a hold, include that reference and the email used on the passenger or guest form.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    clauses: [
      "Log in and Register ask for the name, email, and password you choose for this site.",
      "Keep that password to yourself. Use the same email on a hold and on a note to the trip desk, so the desk can match them.",
      "You can close the account panel at any time. Opening it does not by itself create a booking.",
    ],
  },
  {
    id: "later",
    title: "Credit score and SIP",
    clauses: [
      "The credit-score page stays closed until consent and access are in place. This website does not ask for a PAN or a credit report.",
      "The SIP page stays closed until it opens. It does not show a fund list and does not take an investment payment.",
      "When either service opens, that page will say what it collects before you continue.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    clauses: [
      "These terms can be updated when the website changes. The date at the top of this page is the date of the current version.",
      "Continuing to search, hold a trip, or write to the desk after that date means you are using the current version.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    clauses: [
      "Questions about these terms go to the trip desk through the contact page.",
      "Name the topic, and include a hold reference when the question is about a fare or a room.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      lede="These terms set out how you search, compare, hold, and ask about a trip on BerogetAI."
      related={{ href: "/privacy", label: "Privacy policy" }}
      sections={sections}
    />
  );
}
