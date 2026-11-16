import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/lib/business";

export const metadata: Metadata = { title: "Privacy Policy", description: `How ${business.brand} handles agent and customer data on cibil.brogetai.com.` };

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope",
    clauses: [
      `This policy explains how ${business.legalName} collects and uses personal data on ${business.website} and the ${business.brand} agent mobile app.`,
    ],
  },
  {
    id: "collect",
    title: "Data we collect",
    clauses: [
      "Agent data: name, email, mobile number, city and login activity.",
      "Customer data entered by an agent for a credit check: name, mobile number, gender, date of birth, email and PAN, and the customer's consent.",
      "Credit report data returned by the credit bureau for a check, including the score and report link.",
      "Payment data: amount, status and payment reference from Razorpay. Card numbers, UPI PINs and bank passwords are handled by Razorpay and are never stored by us.",
    ],
  },
  {
    id: "use",
    title: "How we use it",
    clauses: [
      "To run credit checks requested by an agent with the customer's consent, and to show and store the resulting report for that agent.",
      "To credit the wallet, keep a transaction ledger, issue receipts and prevent fraud.",
      "To provide support and meet legal, tax and regulatory obligations.",
    ],
  },
  {
    id: "sharing",
    title: "Who we share it with",
    clauses: [
      "Our credit-information partner and TransUnion CIBIL, only to fetch the report you requested.",
      "Razorpay, to process payments.",
      "Hosting and infrastructure providers that store data on our behalf, and authorities where required by law.",
      "We do not sell personal data.",
    ],
  },
  {
    id: "security",
    title: "Security and retention",
    clauses: [
      "Data is sent over encrypted connections (HTTPS), access is limited to authorised accounts, and PAN numbers are masked in reports and logs.",
      "We keep data only as long as needed for the purposes above or as required by law, after which it is deleted or anonymised.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    clauses: [
      "You can ask to access, correct or delete your personal data, or withdraw consent for future processing, by writing to us. Some records must be kept for legal reasons.",
      `Grievances can be sent to ${business.supportEmail}. We aim to reply within 7 working days.`,
    ],
  },
  {
    id: "changes",
    title: "Changes",
    clauses: ["We may update this policy. The date at the top shows the current version."],
  },
];

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" lede={`What ${business.brand} collects on the agent panel, why, and who it is shared with.`} current="/privacy" sections={sections} />;
}
