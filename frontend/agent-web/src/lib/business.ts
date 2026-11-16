/**
 * Business details shown on the policy and contact pages (Razorpay checks these during website review).
 * Fill `registeredAddress` and `phone` with the exact values from the company's KYC documents.
 */
export const business = {
  brand: "Broget AI",
  legalName: "Broget AI Private Limited",
  website: "https://cibil.brogetai.com",
  supportEmail: "support@brogetai.com",
  supportHours: "Monday to Saturday, 10:00 to 18:00 IST",
  phone: "" as string,
  registeredAddress: "" as string,
  policiesUpdated: "16 November 2026",
} as const;

/** Prices charged on this website. Keep in sync with backend/api/src/modules/wallet/wallet.money.ts. */
export const pricing = {
  cibilFee: 52,
  cibilGst: 9.36,
  cibilTotal: 61.36,
  minTopup: 300,
  maxTopup: 500000,
} as const;
