import PDFDocument from 'pdfkit';
import { CreditReportDocument } from './schemas/credit-report.schema';

const navy = '#12182b';
const blue = '#2f6bff';
const muted = '#667085';
const line = '#e6ebf2';
const pageWidth = 595.28;

export function buildCreditReportPdf(row: CreditReportDocument): Promise<Buffer> {
  const name = `${row.firstName} ${row.lastName}`.trim();
  const score = row.score ?? null;
  const band = scoreBand(score);
  const checked = row.get('createdAt') instanceof Date
    ? (row.get('createdAt') as Date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not recorded';

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: { Title: `Broget CIBIL - ${name}`, Author: 'Broget AI' },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const left = 48;
    const width = pageWidth - left * 2;
    doc.rect(0, 0, pageWidth, 8).fill(blue);
    drawCibilMark(doc, left, 28, 46);
    const brandX = left + 58;
    doc.fillColor(navy).font('Helvetica-Bold').fontSize(16).text('Broget AI', brandX, 32, { lineBreak: false });
    doc.fillColor(blue).font('Helvetica-Bold').fontSize(12).text('Broget CIBIL', brandX, 54, { lineBreak: false });
    doc.fillColor(navy).font('Helvetica').fontSize(10).text(checked, left, 36, { width, align: 'right' });
    doc.fillColor(muted).fontSize(9).text('Credit report', left, 52, { width, align: 'right' });

    doc.moveTo(left, 96).lineTo(left + width, 96).lineWidth(1).strokeColor(line).stroke();

    doc.fillColor(navy).font('Helvetica').fontSize(12).text('Broget CIBIL, prepared by Broget AI.', left, 112, { width });

    const ratio = score == null ? 0 : Math.min(1, Math.max(0, (score - 300) / 600));
    const gaugeX = pageWidth / 2;
    const gaugeY = 236;
    const gaugeRadius = 78;
    drawGauge(doc, gaugeX, gaugeY, gaugeRadius, ratio);
    doc.fillColor(muted).font('Helvetica').fontSize(9);
    doc.text('300', gaugeX - gaugeRadius - 56, gaugeY + 10, { lineBreak: false, width: 24, align: 'right' });
    doc.text('900', gaugeX + gaugeRadius + 32, gaugeY + 10, { lineBreak: false });

    const scoreText = score == null ? '--' : String(score);
    doc.font('Helvetica-Bold').fontSize(28).fillColor(navy);
    const scoreWidth = doc.widthOfString(scoreText);
    doc.text(scoreText, gaugeX - scoreWidth / 2, gaugeY + 12, { lineBreak: false });
    doc.font('Helvetica-Bold').fontSize(11).fillColor(band.color);
    const bandLabelWidth = doc.widthOfString(band.label);
    doc.text(band.label, gaugeX - bandLabelWidth / 2, gaugeY + 44, { lineBreak: false });

    doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text('Customer', left, 314);
    const fields: [string, string][] = [
      ['Full name', name],
      ['Mobile', phone(row.mobile)],
      ['Email', row.email],
      ['Date of birth', row.dateOfBirth],
      ['PAN', row.panMasked.replace(/•/g, '*')],
      ['Agent', `${row.agentName}  ·  ${row.agentId}`],
      ['Check status', row.status === 'ready' ? 'Ready' : 'Failed'],
      ['Checked on', checked],
    ];
    fields.forEach((field, index) => {
      const column = index % 2;
      const rowIndex = Math.floor(index / 2);
      const x = left + column * (width / 2);
      const y = 342 + rowIndex * 52;
      doc.fillColor(muted).font('Helvetica').fontSize(9).text(field[0].toUpperCase(), x, y, { characterSpacing: 0.6, width: width / 2 - 16 });
      doc.fillColor(navy).font('Helvetica').fontSize(12).text(field[1] || '-', x, y + 16, { width: width / 2 - 16 });
    });

    doc.y = 342 + Math.ceil(fields.length / 2) * 52 + 8;
    writeBureau(doc, row.report, row.message, left, width);
    paintFooter(doc, left, width);
    doc.end();
  });
}

const gaugeBands = [
  { start: 0, end: 250 / 600, color: '#ef4444' },
  { start: 250 / 600, end: 350 / 600, color: '#f97316' },
  { start: 350 / 600, end: 400 / 600, color: '#eab308' },
  { start: 400 / 600, end: 450 / 600, color: '#22c55e' },
  { start: 450 / 600, end: 1, color: '#15803d' },
];

function drawGauge(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, ratio: number) {
  const gap = 0.012;
  gaugeBands.forEach((band, index) => {
    const from = index === 0 ? band.start : band.start + gap;
    const to = index === gaugeBands.length - 1 ? band.end : band.end - gap;
    strokeArc(doc, cx, cy, radius, from, to, band.color);
  });
  if (ratio <= 0) return;
  const angle = Math.PI * (1 - ratio);
  const x1 = cx + 12 * Math.cos(angle);
  const y1 = cy - 12 * Math.sin(angle);
  const x2 = cx + (radius - 18) * Math.cos(angle);
  const y2 = cy - (radius - 18) * Math.sin(angle);
  doc.save();
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(2.4).lineCap('round').strokeColor(navy).stroke();
  doc.circle(cx, cy, 5.5).fill(navy);
  doc.circle(cx, cy, 2.4).fill('#ffffff');
  doc.restore();
}

function drawCibilMark(doc: PDFKit.PDFDocument, x: number, y: number, size: number) {
  doc.save();
  doc.roundedRect(x, y, size, size, 12).fill('#eef4ff');
  const cx = x + size / 2;
  const cy = y + size * 0.7;
  const radius = size * 0.3;
  const gap = 0.02;
  gaugeBands.forEach((band, index) => {
    const from = index === 0 ? band.start : band.start + gap;
    const to = index === gaugeBands.length - 1 ? band.end : band.end - gap;
    strokeArc(doc, cx, cy, radius, from, to, band.color, 4.5);
  });
  doc.circle(cx, cy, 2.2).fill(navy);
  doc.restore();
}

function strokeArc(doc: PDFKit.PDFDocument, cx: number, cy: number, radius: number, from: number, to: number, color: string, width = 16) {
  const steps = Math.max(8, Math.round(48 * (to - from)));
  doc.save();
  doc.lineWidth(width).lineCap('butt').strokeColor(color);
  for (let step = 0; step <= steps; step += 1) {
    const t = from + ((to - from) * step) / steps;
    const angle = Math.PI * (1 - t);
    const x = cx + radius * Math.cos(angle);
    const y = cy - radius * Math.sin(angle);
    if (step === 0) doc.moveTo(x, y);
    else doc.lineTo(x, y);
  }
  doc.stroke();
  doc.restore();
}

const pageBottom = 770;

function paintFooter(doc: PDFKit.PDFDocument, left: number, width: number) {
  doc.moveTo(left, 790).lineTo(left + width, 790).lineWidth(1).strokeColor(line).stroke();
  doc.fillColor(muted).font('Helvetica').fontSize(8).text('Confidential. PAN is masked.', left, 800, { width, align: 'left', lineBreak: false });
  doc.text('Broget AI', left, 800, { width, align: 'right', lineBreak: false });
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number, left: number, width: number) {
  if (doc.y + needed <= pageBottom) return;
  paintFooter(doc, left, width);
  doc.addPage({ size: 'A4', margin: 0 });
  doc.rect(0, 0, pageWidth, 8).fill(blue);
  doc.y = 36;
}

function writeBureau(doc: PDFKit.PDFDocument, report: unknown, message: string, left: number, width: number) {
  ensureSpace(doc, 48, left, width);
  doc.moveTo(left, doc.y).lineTo(left + width, doc.y).lineWidth(1).strokeColor(line).stroke();
  doc.y += 16;
  if (!report || typeof report !== 'object') {
    sectionTitle(doc, 'Bureau response', left, width);
    doc.fillColor(navy).font('Helvetica').fontSize(12).text(message || 'The full bureau response was not stored for this check.', left, doc.y, { width });
    doc.moveDown(0.6);
    return;
  }
  writeNode(doc, report, 'Bureau response', left, width, 0);
}

function writeNode(doc: PDFKit.PDFDocument, value: unknown, title: string, left: number, width: number, depth: number) {
  if (depth > 12) return;
  if (Array.isArray(value)) {
    const items = value.filter((item) => item != null && item !== '');
    if (!items.length) return;
    items.forEach((item, index) => {
      if (item && typeof item === 'object') writeNode(doc, item, `${title} ${index + 1}`, left, width, depth + 1);
      else facts(doc, [[title, displayValue(title, item)]], left, width);
    });
    return;
  }
  if (!value || typeof value !== 'object') return;
  const leaves: [string, string][] = [];
  const children: [string, unknown][] = [];
  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    if (child == null || child === '') return;
    if (typeof child === 'object') children.push([key, child]);
    else leaves.push([fieldLabel(key), displayValue(key, child)]);
  });
  if (!leaves.length && !children.length) return;
  sectionTitle(doc, fieldLabel(title), left, width);
  if (leaves.length) facts(doc, leaves, left, width);
  children.forEach(([key, child]) => writeNode(doc, child, key, left, width, depth + 1));
}

function fieldLabel(key: string) {
  const words = key.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function displayValue(key: string, value: unknown) {
  const text = plain(value);
  if (/pan/i.test(key)) return maskPan(text);
  if (/account.?number|telephone/i.test(key)) return maskAccount(text);
  if ((/date/i.test(key) || key === 'Open_Date') && /^\d{8}$/.test(text)) return bureauDate(text);
  if (/time/i.test(key) && /^\d{6}$/.test(text)) return bureauTime(text);
  return text;
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, left: number, width: number) {
  ensureSpace(doc, 96, left, width);
  doc.fillColor(navy).font('Helvetica-Bold').fontSize(13).text(title, left, doc.y, { width });
  doc.moveDown(0.35);
}

function valueHeight(doc: PDFKit.PDFDocument, value: string, width: number) {
  doc.font('Helvetica').fontSize(11);
  return 16 + doc.heightOfString(value, { width });
}

function facts(doc: PDFKit.PDFDocument, pairs: [string, string][], left: number, width: number) {
  const usable = pairs.filter((pair) => pair[1]);
  const col = width / 2 - 16;
  for (let index = 0; index < usable.length; index += 2) {
    const right = usable[index + 1];
    const rowHeight = Math.max(valueHeight(doc, usable[index][1], col), right ? valueHeight(doc, right[1], col) : 0, 32);
    ensureSpace(doc, rowHeight, left, width);
    const y = doc.y;
    writeFact(doc, usable[index], left, y, col);
    if (right) writeFact(doc, right, left + width / 2, y, col);
    doc.y = y + rowHeight;
  }
}

function writeFact(doc: PDFKit.PDFDocument, pair: [string, string], x: number, y: number, width: number) {
  doc.fillColor(muted).font('Helvetica').fontSize(8).text(pair[0].toUpperCase(), x, y, { width, lineBreak: false });
  doc.fillColor(navy).font('Helvetica').fontSize(11).text(pair[1], x, y + 12, { width });
}

function plain(value: unknown) {
  if (value == null) return '';
  const text = String(value).trim();
  return text === 'null' || text === 'undefined' ? '' : text;
}

function maskPan(value: string) {
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(value)) return value;
  return `${value.slice(0, 5)}****${value.slice(-1)}`;
}

function maskAccount(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 6 || value.includes('X')) return value;
  return `${'X'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function bureauDate(value: unknown) {
  const raw = plain(value);
  if (!/^\d{8}$/.test(raw)) return raw;
  const month = Number(raw.slice(4, 6));
  if (month < 1 || month > 12) return raw;
  return `${raw.slice(6)} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]} ${raw.slice(0, 4)}`;
}

function bureauTime(value: unknown) {
  const raw = plain(value);
  if (!/^\d{6}$/.test(raw)) return raw;
  return `${raw.slice(0, 2)}:${raw.slice(2, 4)}`;
}

function scoreBand(score: number | null) {
  if (score == null) return { label: 'Not returned', color: '#667085' };
  if (score >= 750) return { label: 'Excellent', color: '#15803d' };
  if (score >= 700) return { label: 'Good', color: '#15803d' };
  if (score >= 650) return { label: 'Fair', color: '#b45309' };
  return { label: 'Poor', color: '#b91c1c' };
}

function phone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 10) return value;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}
