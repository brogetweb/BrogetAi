export const API_FEE_PAISE = 5200;
export const API_GST_PAISE = 936;
export const API_CHARGE_PAISE = API_FEE_PAISE + API_GST_PAISE;
export const TEST_CREDIT_PAISE = 50000;

export function rupeesToPaise(amount: number) {
  return Math.round(amount * 100);
}

export function paiseToRupees(paise: number) {
  return Math.round(paise) / 100;
}
