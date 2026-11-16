import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";
import { business } from "@/lib/business";

export const metadata: Metadata = { title: "Refund & Cancellation Policy", description: `Refunds and cancellations for ${business.brand} wallet top-ups and credit checks.` };

const sections: LegalSection[] = [
  {
    id: "service",
    title: "What you pay for",
    clauses: [
      "Wallet top-ups are prepaid balance used to pay for credit (CIBIL) checks on this panel. No physical goods are shipped.",
      "A credit check is delivered digitally and instantly, so a completed check cannot be cancelled.",
    ],
  },
  {
    id: "failed-checks",
    title: "Failed credit checks",
    clauses: [
      "If a check fails or no report is returned, no fee is deducted from your wallet.",
      "If a fee was deducted for a check that did not deliver a report, write to us with the customer name and date; the fee is returned to your wallet within 2 working days after verification.",
    ],
  },
  {
    id: "payments",
    title: "Failed, duplicate or excess payments",
    clauses: [
      "If money was debited but the wallet was not credited, the payment is either credited to the wallet automatically or refunded to the original payment method within 5 to 7 working days.",
      "Duplicate payments or payments made in error are refunded in full to the original payment method within 5 to 7 working days of your request.",
    ],
  },
  {
    id: "wallet",
    title: "Unused wallet balance",
    clauses: [
      "You can request a refund of unused wallet balance by writing to us from your registered email. Approved refunds are made to the original payment method within 7 working days.",
      "Balance already used for completed credit checks is not refundable.",
    ],
  },
  {
    id: "how",
    title: "How to request",
    clauses: [
      `Email ${business.supportEmail} with your registered email, the payment reference (Razorpay payment or order ID) and the amount.`,
      "Refund timelines after approval depend on your bank or card issuer; UPI and wallet refunds are usually faster than card refunds.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      lede="When wallet top-ups and credit-check fees are refunded, and how to ask for a refund."
      current="/refund-policy"
      sections={sections}
    />
  );
}
