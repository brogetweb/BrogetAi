import PDFDocument from 'pdfkit';

export type FlightTicketPdfInput = {
  bookingId: string;
  pnr: string;
  airline: string;
  airlineCode?: string;
  flightCode: string;
  fromCode: string;
  toCode: string;
  fromCity?: string;
  toCity?: string;
  date: string;
  depart: string;
  arrive: string;
  duration: string;
  travellerName: string;
  /** Every traveller on the booking, "Mr Rohit Kumar" style. Falls back to travellerName. */
  passengers?: string[];
  email?: string;
  phone?: string;
  total: number;
  /** Optional fare breakup (rupees). When missing only the total is printed. */
  netFare?: number;
  convenienceFee?: number;
  gst?: number;
  cabin?: string;
};

const C = {
  ink: '#0B1630',
  navy: '#123A8F',
  brand: '#1D5BFF',
  sun: '#FF8A3D',
  green: '#059669',
  greenBg: '#ECFDF5',
  muted: '#5B6B85',
  subtle: '#8A97AD',
  line: '#E3E9F3',
  soft: '#F4F7FC',
  white: '#FFFFFF',
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const L = 40;
const W = PAGE_W - L * 2;

/** Lucide-style plane outline (24x24 viewBox), the same icon the website uses. */
const PLANE =
  'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z';

const CITY: Record<string, string> = {
  DEL: 'New Delhi', BOM: 'Mumbai', BLR: 'Bengaluru', HYD: 'Hyderabad', MAA: 'Chennai', CCU: 'Kolkata', GOI: 'Goa',
  PNQ: 'Pune', AMD: 'Ahmedabad', JAI: 'Jaipur', LKO: 'Lucknow', COK: 'Kochi', TRV: 'Thiruvananthapuram', GAU: 'Guwahati',
  PAT: 'Patna', IXC: 'Chandigarh', SXR: 'Srinagar', VNS: 'Varanasi', BBI: 'Bhubaneswar', NAG: 'Nagpur', IDR: 'Indore',
  DXB: 'Dubai', SIN: 'Singapore', BKK: 'Bangkok', LHR: 'London', DOH: 'Doha', AUH: 'Abu Dhabi',
};

export function buildFlightTicketPdf(input: FlightTicketPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: { Title: `E-Ticket ${input.pnr} | ${input.fromCode} to ${input.toCode}`, Author: 'Book by Broget AI', Subject: 'Flight e-ticket' },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pax = input.passengers?.filter((p) => p.trim()).length ? input.passengers.filter((p) => p.trim()) : [input.travellerName];
    const fromCity = input.fromCity || CITY[input.fromCode] || input.fromCode;
    const toCity = input.toCity || CITY[input.toCode] || input.toCode;
    const date = formatDate(input.date);
    const cabin = cabinLabel(input.cabin);

    header(doc, input);

    // Title
    let y = 108;
    doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(19).text('Your flight is confirmed', L, y);
    pill(doc, PAGE_W - L, y + 3, 'CONFIRMED', C.green, C.greenBg, 'right');
    doc.fillColor(C.muted).font('Helvetica').fontSize(10).text(
      `${fromCity} to ${toCity}  ·  ${date}  ·  ${pax.length} traveller${pax.length > 1 ? 's' : ''}  ·  ${cabin}`,
      L,
      y + 26,
    );

    // Boarding pass on a soft band
    y = 156;
    doc.rect(0, y, PAGE_W, 248).fill(C.soft);
    boardingPass(doc, input, { y: y + 15, fromCity, toCity, date, cabin, lead: pax[0], more: pax.length - 1 });

    // Passengers
    y = 424;
    sectionTitle(doc, 'Travellers', y);
    y += 22;
    const cols = [L, L + 34, L + 300, L + 400];
    doc.roundedRect(L, y, W, 24, 6).fill(C.soft);
    doc.fillColor(C.subtle).font('Helvetica-Bold').fontSize(8);
    ['#', 'PASSENGER NAME', 'TYPE', 'STATUS'].forEach((h, i) => doc.text(h, cols[i] + 12, y + 8.5, { characterSpacing: 0.8, lineBreak: false }));
    y += 24;
    pax.forEach((name, i) => {
      if (y > PAGE_H - 90) y = newPage(doc);
      doc.fillColor(C.ink).font('Helvetica').fontSize(10).text(String(i + 1), cols[0] + 12, y + 8, { lineBreak: false });
      doc.font('Helvetica-Bold').text(name, cols[1] + 12, y + 8, { width: 250, lineBreak: false, ellipsis: true });
      doc.font('Helvetica').fillColor(C.muted).text('Adult', cols[2] + 12, y + 8, { lineBreak: false });
      doc.font('Helvetica-Bold').fillColor(C.green).text('Confirmed', cols[3] + 12, y + 8, { lineBreak: false });
      y += 24;
      doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.6).strokeColor(C.line).stroke();
    });

    // Fare summary + booking details side by side
    y += 16;
    const half = (W - 16) / 2;
    const fareRows: [string, string][] = [];
    if (input.netFare != null) fareRows.push(['Airfare', inr(input.netFare)]);
    if (input.convenienceFee != null) fareRows.push(['Convenience fee', inr(input.convenienceFee)]);
    if (input.gst != null) fareRows.push(['GST', inr(input.gst)]);
    const boxH = Math.max(104, 36 + fareRows.length * 16 + 40);
    if (y + boxH > PAGE_H - 60) y = newPage(doc);

    panel(doc, L, y, half, boxH, 'Fare summary');
    let fy = y + 36;
    fareRows.forEach(([k, v]) => {
      doc.fillColor(C.muted).font('Helvetica').fontSize(10).text(k, L + 16, fy, { lineBreak: false });
      doc.fillColor(C.ink).font('Helvetica-Bold').text(v, L + 16, fy, { width: half - 32, align: 'right', lineBreak: false });
      fy += 16;
    });
    if (!fareRows.length) {
      doc.fillColor(C.muted).font('Helvetica').fontSize(9.5).text('Includes airfare, convenience fee and GST. Paid online in full.', L + 16, fy, { width: half - 32, lineGap: 2 });
    }
    fy = y + boxH - 34;
    doc.moveTo(L + 16, fy - 6).lineTo(L + half - 16, fy - 6).dash(3, { space: 3 }).lineWidth(0.8).strokeColor(C.line).stroke().undash();
    doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(11).text('Total paid', L + 16, fy + 4, { lineBreak: false });
    doc.fontSize(15).text(inr(input.total), L + 16, fy + 1, { width: half - 32, align: 'right', lineBreak: false });

    const bx = L + half + 16;
    panel(doc, bx, y, half, boxH, 'Booking details');
    const rows: [string, string][] = [
      ['Booking ID', input.bookingId],
      ['PNR', input.pnr],
      ['Email', input.email || 'Not given'],
      ['Mobile', input.phone ? `+91 ${input.phone}` : 'Not given'],
    ];
    let by = y + 36;
    rows.forEach(([k, v]) => {
      doc.fillColor(C.muted).font('Helvetica').fontSize(10).text(k, bx + 16, by, { lineBreak: false });
      fitText(doc, v, bx + 84, by, half - 100, 10, 'right');
      by += 16;
    });

    // Important information
    y += boxH + 18;
    if (y > PAGE_H - 150) y = newPage(doc);
    sectionTitle(doc, 'Before you fly', y);
    y += 22;
    const notes = [
      'Carry a valid government photo ID (Aadhaar, passport, driving licence or voter ID) that matches the passenger name.',
      'Reach the airport at least 2 hours before departure. Check-in counters close 45 minutes before departure for domestic flights.',
      `Baggage: cabin bag up to 7 kg. Check-in baggage as per ${input.airline || 'airline'} fare rules.`,
      'Web check-in opens on the airline website 48 hours before departure. Seats are assigned at check-in.',
    ];
    notes.forEach((n) => {
      doc.circle(L + 4, y + 5, 2).fill(C.brand);
      doc.fillColor(C.muted).font('Helvetica').fontSize(9).text(n, L + 14, y, { width: W - 14, lineGap: 1.5 });
      y = doc.y + 4;
    });

    footer(doc);
    doc.end();
  });
}

function header(doc: PDFKit.PDFDocument, input: FlightTicketPdfInput) {
  const g = doc.linearGradient(0, 0, PAGE_W, 86);
  g.stop(0, C.ink).stop(0.6, C.navy).stop(1, C.brand);
  doc.rect(0, 0, PAGE_W, 86).fill(g);

  // Logo mark
  doc.roundedRect(L, 25, 36, 36, 9).fill(C.brand);
  planeIcon(doc, L + 7, 32, 22, C.white);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(16).text('Book by Broget ', L + 48, 28, { continued: true, lineBreak: false }).fillColor('#9DB8FF').text('AI');
  doc.fillColor('#C9D6F5').font('Helvetica').fontSize(9).text('Flight e-ticket and itinerary', L + 48, 48);

  doc.fillColor('#C9D6F5').font('Helvetica').fontSize(8).text('BOOKING ID', L, 28, { width: W, align: 'right', characterSpacing: 1 });
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(12).text(input.bookingId, L, 40, { width: W, align: 'right' });
  doc.fillColor('#C9D6F5').font('Helvetica').fontSize(8).text(`Issued ${formatDate(new Date().toISOString().slice(0, 10))}`, L, 57, { width: W, align: 'right' });
}

function boardingPass(
  doc: PDFKit.PDFDocument,
  input: FlightTicketPdfInput,
  o: { y: number; fromCity: string; toCity: string; date: string; cabin: string; lead: string; more: number },
) {
  const x = L;
  const y = o.y;
  const w = W;
  const h = 218;
  const stubW = 158;
  const cut = x + w - stubW; // perforation x
  const band = 42;

  // Ticket body with band, clipped to rounded corners
  doc.save();
  doc.roundedRect(x, y, w, h, 14).clip();
  doc.rect(x, y, w, h).fill(C.white);
  const g = doc.linearGradient(x, y, x + w, y + band);
  g.stop(0, C.ink).stop(0.65, C.navy).stop(1, C.brand);
  doc.rect(x, y, w, band).fill(g);
  doc.restore();
  doc.roundedRect(x, y, w, h, 14).lineWidth(0.8).strokeColor(C.line).stroke();

  // Band: airline + label, stub band: PNR label
  const code = (input.airlineCode || input.flightCode.split(/[\s-]/)[0] || '').slice(0, 3);
  doc.save().fillOpacity(0.15).roundedRect(x + 18, y + 10, 24, 22, 5).fill(C.white).restore();
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(9).text(code, x + 18, y + 17, { width: 24, align: 'center', lineBreak: false });
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(11).text(input.airline || 'Flight', x + 50, y + 10, { lineBreak: false });
  doc.fillColor('#C9D6F5').font('Helvetica-Bold').fontSize(7).text('BOARDING PASS  ·  E-TICKET', x + 50, y + 25, { characterSpacing: 1.2, lineBreak: false });
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8).text(o.cabin.toUpperCase(), x, y + 17, { width: cut - x - 18, align: 'right', characterSpacing: 1, lineBreak: false });
  doc.fillColor('#C9D6F5').font('Helvetica-Bold').fontSize(7).text('PASSENGER COPY', cut + 18, y + 17, { characterSpacing: 1.2, lineBreak: false });

  // Route
  const mainL = x + 22;
  const mainR = cut - 22;
  const ry = y + band + 16;
  label(doc, 'FROM', mainL, ry);
  label(doc, 'TO', mainL, ry, mainR - mainL, 'right');
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(36).text(input.fromCode, mainL, ry + 10, { lineBreak: false });
  doc.text(input.toCode, mainL, ry + 10, { width: mainR - mainL, align: 'right', lineBreak: false });
  doc.fillColor(C.muted).font('Helvetica').fontSize(9).text(o.fromCity, mainL, ry + 50, { lineBreak: false });
  doc.text(o.toCity, mainL, ry + 50, { width: mainR - mainL, align: 'right', lineBreak: false });

  // Flight path between the codes
  const px1 = mainL + 108;
  const px2 = mainR - 108;
  const py = ry + 30;
  const mid = (px1 + px2) / 2;
  doc.fillColor(C.muted).font('Helvetica').fontSize(8.5).text(input.duration || '', px1, py - 18, { width: px2 - px1, align: 'center', lineBreak: false });
  doc.circle(px1, py, 2.5).fill(C.brand);
  doc.circle(px2, py, 2.5).fill(C.brand);
  doc.moveTo(px1 + 6, py).lineTo(mid - 13, py).moveTo(mid + 13, py).lineTo(px2 - 6, py).dash(1.5, { space: 2.5 }).lineWidth(1.2).strokeColor('#9DB8FF').stroke().undash();
  planeIcon(doc, mid - 9, py - 9, 18, C.brand, 45);

  // Divider + fields
  const fy = ry + 70;
  doc.moveTo(mainL, fy).lineTo(mainR, fy).lineWidth(0.6).strokeColor(C.line).stroke();
  const cw = (mainR - mainL) / 4;
  field(doc, 'PASSENGER', o.more > 0 ? `${o.lead} +${o.more}` : o.lead, mainL, fy + 12, cw * 2 - 8);
  field(doc, 'DATE', shortDate(input.date), mainL + cw * 2, fy + 12, cw - 6);
  field(doc, 'FLIGHT', input.flightCode, mainL + cw * 3, fy + 12, cw - 6);
  field(doc, 'DEPARTS', input.depart, mainL, fy + 46, cw - 6);
  field(doc, 'ARRIVES', input.arrive, mainL + cw, fy + 46, cw - 6);
  field(doc, 'CLASS', o.cabin, mainL + cw * 2, fy + 46, cw - 6);
  field(doc, 'SEAT', 'At check-in', mainL + cw * 3, fy + 46, cw - 6);

  // Perforation with notches cut out of the top and bottom edge
  doc.moveTo(cut, y + 14).lineTo(cut, y + h - 14).dash(4, { space: 4 }).lineWidth(1).strokeColor('#CBD5E6').stroke().undash();
  doc.circle(cut, y, 10).fill(C.soft);
  doc.circle(cut, y + h, 10).fill(C.soft);

  // Stub
  const sL = cut + 18;
  const sW = stubW - 36;
  label(doc, 'PNR', sL, y + band + 16);
  doc.fillColor(C.ink).font('Courier-Bold').fontSize(20).text(input.pnr, sL, y + band + 27, { width: sW, lineBreak: false });
  doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(9).text(`${input.fromCode}  to  ${input.toCode}`, sL, y + band + 52, { lineBreak: false });
  doc.font('Helvetica').text(shortDate(input.date), sL, y + band + 65, { width: sW, lineBreak: false });
  barcode(doc, input.pnr || input.bookingId, sL, y + band + 86, sW, 40);
  doc.fillColor(C.subtle).font('Courier').fontSize(7).text(input.bookingId, sL, y + band + 130, { width: sW, align: 'center', characterSpacing: 1, lineBreak: false });
  label(doc, 'TOTAL PAID', sL, y + h - 34);
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(12).text(inr(input.total), sL, y + h - 23, { width: sW, lineBreak: false });
}

function footer(doc: PDFKit.PDFDocument) {
  const y = PAGE_H - 46;
  doc.moveTo(L, y).lineTo(L + W, y).lineWidth(0.6).strokeColor(C.line).stroke();
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(9).text('Book by Broget AI', L, y + 12, { continued: true, lineBreak: false })
    .fillColor(C.muted).font('Helvetica').text('   ·   Help: support@brogetai.com');
  doc.fillColor(C.subtle).fontSize(8).text('Computer generated e-ticket. No signature required.', L, y + 13, { width: W, align: 'right', lineBreak: false });
}

function panel(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, title: string) {
  doc.roundedRect(x, y, w, h, 10).lineWidth(0.8).strokeColor(C.line).stroke();
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(11).text(title, x + 16, y + 14, { lineBreak: false });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, y: number) {
  doc.rect(L, y + 1, 3, 12).fill(C.brand);
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(12).text(title, L + 10, y, { lineBreak: false });
}

function label(doc: PDFKit.PDFDocument, text: string, x: number, y: number, width?: number, align: 'left' | 'right' = 'left') {
  doc.fillColor(C.subtle).font('Helvetica-Bold').fontSize(7).text(text, x, y, { width, align, characterSpacing: 1.2, lineBreak: false });
}

function field(doc: PDFKit.PDFDocument, name: string, value: string, x: number, y: number, width: number) {
  label(doc, name, x, y);
  doc.fillColor(C.ink);
  fitText(doc, value || 'Not given', x, y + 10, width, 10.5, 'left');
}

function pill(doc: PDFKit.PDFDocument, x: number, y: number, text: string, fg: string, bg: string, anchor: 'left' | 'right') {
  doc.font('Helvetica-Bold').fontSize(8);
  const w = doc.widthOfString(text, { characterSpacing: 1 }) + 20;
  const left = anchor === 'right' ? x - w : x;
  doc.roundedRect(left, y, w, 18, 9).fill(bg);
  doc.fillColor(fg).text(text, left, y + 5.5, { width: w, align: 'center', characterSpacing: 1, lineBreak: false });
}

function planeIcon(doc: PDFKit.PDFDocument, x: number, y: number, size: number, color: string, rotate = 0) {
  doc.save();
  doc.translate(x, y);
  if (rotate) doc.rotate(rotate, { origin: [size / 2, size / 2] });
  doc.scale(size / 24);
  doc.path(PLANE).lineWidth(2).lineJoin('round').lineCap('round').strokeColor(color).stroke();
  doc.restore();
}

/** Decorative barcode, stable per PNR. */
function barcode(doc: PDFKit.PDFDocument, seed: string, x: number, y: number, w: number, h: number) {
  let hash = 2166136261;
  let cx = x;
  let i = 0;
  while (cx < x + w - 3) {
    hash ^= seed.charCodeAt(i % seed.length) + i;
    hash = Math.imul(hash, 16777619) >>> 0;
    const bw = 0.8 + (hash % 3) * 0.8;
    if (i % 2 === 0) doc.rect(cx, y, bw, h).fill(C.ink);
    cx += bw + (i % 2 ? 0.6 : 1.4);
    i++;
  }
}

/** Bold text on one line; shrinks the font (down to 7pt) until it fits the width. */
function fitText(doc: PDFKit.PDFDocument, text: string, x: number, y: number, width: number, size: number, align: 'left' | 'right') {
  doc.font('Helvetica-Bold');
  let s = size;
  while (s > 7 && doc.fontSize(s).widthOfString(text) > width) s -= 0.5;
  doc.fillColor(C.ink).fontSize(s).text(text, x, y + (size - s) / 2, { width, align, lineBreak: false });
}

function newPage(doc: PDFKit.PDFDocument) {
  doc.addPage({ size: 'A4', margin: 0 });
  return 48;
}

/** "2026-11-26" -> "26 Nov 2026" for tight ticket fields. */
function shortDate(date: string) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Apps send the BOS cabin code ("0", "1"...); older callers may already send a name. */
function cabinLabel(cabin?: string) {
  const names: Record<string, string> = { '0': 'Economy', '1': 'Business', '2': 'First', '3': 'Premium economy' };
  const value = (cabin ?? '').trim();
  return names[value] ?? (value || 'Economy');
}

/** "2026-11-26" -> "Thu, 26 Nov 2026"; anything else is printed as given. */
function formatDate(date: string) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** Built-in PDF fonts have no rupee glyph, so amounts print as "INR 6,890.58". */
function inr(value: number) {
  return `INR ${formatInr(value)}`;
}

/** Indian grouping with exact paise when there are any: 6890.58 -> "6,890.58", 3499 -> "3,499". */
function formatInr(value: number) {
  const paise = Math.round(value * 100);
  const s = Math.floor(paise / 100).toString();
  const decimals = paise % 100 ? `.${String(paise % 100).padStart(2, '0')}` : '';
  if (s.length <= 3) return s + decimals;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(',')},${last3}${decimals}`;
}
