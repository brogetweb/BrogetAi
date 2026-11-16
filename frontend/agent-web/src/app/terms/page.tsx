import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business, pricing } from "@/lib/business";

export const metadata: Metadata = { title: "Terms & Conditions", description: `Terms for using the ${business.brand} agent panel at cibil.brogetai.com.` };

const inr = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About this website",
    clauses: [
      `${business.website} is operated by ${business.legalName} ("${business.brand}", "we"). It is the panel for registered ${business.brand} agents to manage customers, keep a prepaid wallet and run consent-based credit (CIBIL) checks.`,
      "By signing in or using the panel you agree to these Terms, the Privacy Policy and the Refund & Cancellation Policy.",
    ],
  },
  {
    id: "accounts",
    title: "Agent accounts",
    clauses: [
      `Accounts are created by a ${business.brand} administrator for approved agents only. Public sign-up is not available.`,
      "You are responsible for keeping your password confidential and for all activity under your account. Tell us immediately if you suspect misuse.",
      "We may suspend an account that breaks these Terms, misuses customer data or is used for fraud.",
    ],
  },
  {
    id: "service",
    title: "Credit checks",
    clauses: [
      "A credit check fetches a TransUnion CIBIL report through our authorised partner for the customer you select.",
      "You must obtain the customer's informed consent before every check, and you may use a report only to assess or serve that customer. Running a check without consent is prohibited.",
      "Reports are provided as received from the credit bureau. We do not change bureau data and are not responsible for its accuracy; customers can raise disputes directly with the bureau.",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    clauses: [
      `Each successful credit check costs ${inr(pricing.cibilFee)} + GST ${inr(pricing.cibilGst)} = ${inr(pricing.cibilTotal)}, deducted from your wallet. The amount is shown before you run a check.`,
      "A check is charged only when a report is delivered. If the bureau or our partner returns an error, no fee is deducted.",
      "All prices are in Indian Rupees (INR) and include applicable GST. We will show any change in price on this website before it applies.",
    ],
  },
  {
    id: "wallet",
    title: "Wallet and payments",
    clauses: [
      `The wallet is a prepaid balance used only to pay for services on this panel. Top-ups start at ${inr(pricing.minTopup)} and can be up to ${inr(pricing.maxTopup)} per payment.`,
      "Payments are processed by Razorpay using UPI, debit/credit cards, net banking and supported wallets. We do not store your card or bank credentials.",
      "Your wallet is credited only after the payment gateway confirms the payment. Wallet balance is not interest-bearing, cannot be transferred to another agent and cannot be withdrawn as cash except as set out in the Refund & Cancellation Policy.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    clauses: [
      "Do not upload false identity details, attempt to access another agent's data, interfere with the website, or use the panel for any unlawful purpose.",
      "Customer data and reports must be handled confidentially and in line with applicable Indian law, including the Credit Information Companies (Regulation) Act, 2005 and the Digital Personal Data Protection Act, 2023.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    clauses: [
      "The service is provided on an \"as available\" basis. We are not liable for indirect or consequential loss, or for delays caused by banks, payment gateways or credit bureaus.",
      "Our total liability for any claim is limited to the amount you paid for the specific service that the claim relates to.",
    ],
  },
  {
    id: "law",
    title: "Governing law",
    clauses: [
      "These Terms are governed by the laws of India. Courts at the place of our registered office have jurisdiction.",
      "We may update these Terms. The date at the top shows the current version; continuing to use the panel means you accept it.",
    ],
  },
];

export default function TermsPage() {
  return <LegalPage title="Terms & Conditions" lede={`The rules for using the ${business.brand} agent panel, its wallet and credit checks.`} current="/terms" sections={sections} />;
}
