/** Broget markup on AO Pay / BOS net fare. GST on Broget fee only. */

export const DOMESTIC_MARKUP_PCT = 4;
export const INTERNATIONAL_MARKUP_PCT = 7;
export const MARKUP_GST_PCT = 18;

export type FlightSector = 'domestic' | 'international';

export type FlightPriceQuote = {
  sector: FlightSector;
  markupPercent: number;
  netFarePaise: number;
  markupPaise: number;
  gstPaise: number;
  totalPaise: number;
  netFare: number;
  markup: number;
  gst: number;
  total: number;
  moneyTo: {
    aoPayWalletPaise: number;
    brogetFeePaise: number;
    gstPaise: number;
    customerPaysPaise: number;
  };
};

export function rupeesToPaise(rupees: number) {
  return Math.round(Number(rupees) * 100);
}

export function paiseToRupees(paise: number) {
  return Math.round(paise) / 100;
}

export function quoteFlightPrice(input: { netFareRupees: number; sector: FlightSector }): FlightPriceQuote {
  const netFarePaise = rupeesToPaise(input.netFareRupees);
  const markupPercent = input.sector === 'international' ? INTERNATIONAL_MARKUP_PCT : DOMESTIC_MARKUP_PCT;
  const markupPaise = Math.round((netFarePaise * markupPercent) / 100);
  const gstPaise = Math.round((markupPaise * MARKUP_GST_PCT) / 100);
  const totalPaise = netFarePaise + markupPaise + gstPaise;
  return {
    sector: input.sector,
    markupPercent,
    netFarePaise,
    markupPaise,
    gstPaise,
    totalPaise,
    netFare: paiseToRupees(netFarePaise),
    markup: paiseToRupees(markupPaise),
    gst: paiseToRupees(gstPaise),
    total: paiseToRupees(totalPaise),
    moneyTo: {
      aoPayWalletPaise: netFarePaise,
      brogetFeePaise: markupPaise,
      gstPaise,
      customerPaysPaise: totalPaise,
    },
  };
}
