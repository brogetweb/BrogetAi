import PDFDocument from 'pdfkit';

export type FlightTicketPdfInput = {
  bookingId: string;
  pnr: string;
  airline: string;
  flightCode: string;
  fromCode: string;
  toCode: string;
  date: string;
  depart: string;
  arrive: string;
  duration: string;
  travellerName: string;
  email?: string;
  phone?: string;
  total: number;
  cabin?: string;
};

const navy = '#0B1F3A';
const blue = '#0066FF';
const muted = '#6B7A90';
const line = '#E6ECF5';
const pageWidth = 595.28;

export function buildFlightTicketPdf(input: FlightTicketPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: { Title: `E-Ticket ${input.pnr}`, Author: 'Book by Broget AI' },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 48;
    const width = pageWidth - left * 2;

    doc.rect(0, 0, pageWidth, 92).fill(navy);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(11).text('BOOK BY', left, 28, { characterSpacing: 2 });
    doc.font('Helvetica-Bold').fontSize(22).text('Broget AI', left, 44);
    doc.fillColor('#FF7A00').font('Helvetica-Bold').fontSize(22).text('AI', left + doc.widthOfString('Broget '), 44, { lineBreak: false });
    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(10).text('E-Ticket / Itinerary', left, 36, { width, align: 'right' });
    doc.font('Helvetica-Bold').fontSize(12).text(`PNR  ${input.pnr}`, left, 54, { width, align: 'right' });

    let y = 118;
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(16).text(`${input.fromCode}  →  ${input.toCode}`, left, y);
    y += 28;
    doc.fillColor(muted).font('Helvetica').fontSize(11).text(`${input.airline}  ·  ${input.flightCode}`, left, y);
    y += 36;

    box(doc, left, y, width, 88);
    field(doc, left + 16, y + 16, 'Departure', `${input.depart}  ·  ${input.fromCode}`);
    field(doc, left + width / 2, y + 16, 'Arrival', `${input.arrive}  ·  ${input.toCode}`);
    field(doc, left + 16, y + 52, 'Date', input.date);
    field(doc, left + width / 2, y + 52, 'Duration', input.duration || '—');
    y += 110;

    box(doc, left, y, width, 108);
    field(doc, left + 16, y + 16, 'Passenger', input.travellerName);
    field(doc, left + width / 2, y + 16, 'Cabin', input.cabin || 'Economy');
    field(doc, left + 16, y + 52, 'Email', input.email || '—');
    field(doc, left + width / 2, y + 52, 'Mobile', input.phone || '—');
    y += 130;

    box(doc, left, y, width, 72);
    field(doc, left + 16, y + 16, 'Booking ID', input.bookingId);
    field(doc, left + width / 2, y + 16, 'Amount paid', `INR ${formatInr(input.total)}`);
    y += 96;

    doc.fillColor(muted).font('Helvetica').fontSize(9).text(
      'This is a Broget AI e-ticket copy. Live AO Pay / BOS tickets are issued after AirTicketing + AirReprint on UAT/production. Carry a valid photo ID matching the passenger name.',
      left,
      y,
      { width, lineGap: 3 },
    );
    y += 48;
    doc.fillColor(blue).font('Helvetica-Bold').fontSize(10).text('support@brogetai.com', left, y);

    doc.end();
  });
}

function box(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number) {
  doc.roundedRect(x, y, w, h, 10).lineWidth(1).strokeColor(line).stroke();
}

function field(doc: PDFKit.PDFDocument, x: number, y: number, label: string, value: string) {
  doc.fillColor(muted).font('Helvetica').fontSize(9).text(label.toUpperCase(), x, y, { characterSpacing: 0.5 });
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(12).text(value || '—', x, y + 14, { width: 220 });
}

function formatInr(value: number) {
  const s = Math.round(value).toString();
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts: string[] = [];
  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) parts.unshift(rest);
  return `${parts.join(',')},${last3}`;
}
