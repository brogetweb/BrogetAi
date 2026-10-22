import { LegalPage } from "@/components/legal-page";

const sections = [
  {
    id: "policy",
    title: "This policy",
    clauses: [
      "This policy explains what the public BerogetAI website keeps when you search, hold a trip, open an account, or write to the trip desk.",
      "It covers this website only. It does not cover a credit check or a savings payment, because those flows are not open here.",
      "Read it with the Terms and conditions. Both pages apply to the same website.",
    ],
  },
  {
    id: "you",
    title: "Information you provide",
    clauses: [
      "A hold form takes the passenger or guest name and email, together with the reference shown on screen.",
      "Log in and Register take the name, email, and password you choose for an account.",
      "The contact form takes your name, email, phone, topic, and message so the desk can read the note.",
    ],
  },
  {
    id: "search",
    title: "Information from a search",
    clauses: [
      "Cities, dates, cabin, and traveller counts stay in the page address so you can return to the same search.",
      "Those details are not stored as a customer profile.",
      "Returning to a link brings back the search you built. It does not reopen a private account by itself.",
    ],
  },
  {
    id: "use",
    title: "How it is used",
    clauses: [
      "Search details are used to show fares and stays for the trip you asked for.",
      "A name and email on a hold are used to keep that selection with its reference.",
      "A contact message is used so the trip desk can reply about a fare, a room, an account, or something else you named.",
    ],
  },
  {
    id: "not",
    title: "What is not collected",
    clauses: [
      "CIBIL data is not collected. The credit-score page does not ask for a PAN or a credit report.",
      "SIP does not take a payment, a fund choice, or a bank detail on this website.",
      "Airline, hotel, and credit-bureau credentials are not placed in the browser.",
    ],
  },
  {
    id: "sharing",
    title: "Who can see it",
    clauses: [
      "The trip desk can see a message you send, including the name, email, topic, and hold reference you include.",
      "When airline or hotel connections exist, those calls run from the server, not from this page.",
      "This website does not sell search details, hold details, or contact messages.",
    ],
  },
  {
    id: "choices",
    title: "Your choices",
    clauses: [
      "You can leave a search without creating an account. The address keeps the search only while you use that link.",
      "You can write again from the contact page, or close the account panel without sending a note.",
      "To ask what a hold or a message contains, write to the trip desk and include the reference.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    clauses: [
      "This policy can be updated when the website changes. The date at the top of this page is the date of the current version.",
      "If a new flow starts to collect something this page does not list, that page will say so before you continue.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    clauses: [
      "Questions about this policy go to the trip desk through the contact page.",
      "Use the email on the hold or the account, and include the reference when you have one.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      lede="This policy sets out what BerogetAI keeps, what it does not collect, and who can see a note you send."
      related={{ href: "/terms", label: "Terms and conditions" }}
      sections={sections}
    />
  );
}
