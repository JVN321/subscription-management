import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface InvoicePDFData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  billingAddress?: any;
  lines: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  subtotal: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  status: string;
}

export function generateInvoicePDFBuffer(data: InvoicePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header Branding
    doc
      .fillColor('#1e293b')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('BRIGHTLOOP SOFTWARE', 50, 50);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('Subscription Billing & Digital Platform', 50, 75)
      .text('billing@brightloop.com | www.brightloop.com', 50, 90);

    // Invoice Title & Meta
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text(`INVOICE: ${data.invoiceNumber}`, 350, 50, { align: 'right' });

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#64748b')
      .text(`Issue Date: ${data.issueDate}`, 350, 75, { align: 'right' })
      .text(`Due Date: ${data.dueDate}`, 350, 90, { align: 'right' })
      .text(`Status: ${data.status.toUpperCase()}`, 350, 105, { align: 'right' });

    doc.moveDown(3);

    // Bill To Section
    const yBillTo = 140;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#1e293b')
      .text('BILL TO:', 50, yBillTo);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#334155')
      .text(data.customerName, 50, yBillTo + 15)
      .text(data.customerEmail, 50, yBillTo + 30);

    if (data.billingAddress && typeof data.billingAddress === 'object') {
      const addr = data.billingAddress;
      const addrLine = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
        .filter(Boolean)
        .join(', ');
      if (addrLine) {
        doc.text(addrLine, 50, yBillTo + 45);
      }
    }

    // Line Items Table Header
    const tableTop = 220;
    doc
      .rect(50, tableTop, 500, 24)
      .fill('#f1f5f9');

    doc
      .fillColor('#0f172a')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DESCRIPTION', 60, tableTop + 7)
      .text('QTY', 320, tableTop + 7, { width: 40, align: 'center' })
      .text('UNIT PRICE', 380, tableTop + 7, { width: 70, align: 'right' })
      .text('AMOUNT', 460, tableTop + 7, { width: 80, align: 'right' });

    // Table Rows
    let y = tableTop + 30;
    doc.font('Helvetica').fontSize(9).fillColor('#334155');

    for (const item of data.lines) {
      const desc = item.variantName ? `${item.productName} (${item.variantName})` : item.productName;
      doc
        .text(desc, 60, y)
        .text(item.quantity.toString(), 320, y, { width: 40, align: 'center' })
        .text(`$${parseFloat(item.unitPrice).toFixed(2)}`, 380, y, { width: 70, align: 'right' })
        .text(`$${parseFloat(item.lineTotal).toFixed(2)}`, 460, y, { width: 80, align: 'right' });

      y += 20;
    }

    doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor('#cbd5e1').stroke();

    // Summary Totals
    const yTotals = y + 15;
    const totalsLeft = 360;
    const totalsWidth = 90;
    const valuesLeft = 460;
    const valuesWidth = 80;

    doc
      .fontSize(9)
      .fillColor('#64748b')
      .text('Subtotal:', totalsLeft, yTotals, { align: 'right', width: totalsWidth })
      .text(`$${parseFloat(data.subtotal).toFixed(2)}`, valuesLeft, yTotals, { align: 'right', width: valuesWidth })
      .text('Discounts:', totalsLeft, yTotals + 15, { align: 'right', width: totalsWidth })
      .text(`-$${parseFloat(data.discountAmount).toFixed(2)}`, valuesLeft, yTotals + 15, { align: 'right', width: valuesWidth })
      .text('Tax:', totalsLeft, yTotals + 30, { align: 'right', width: totalsWidth })
      .text(`$${parseFloat(data.taxAmount).toFixed(2)}`, valuesLeft, yTotals + 30, { align: 'right', width: valuesWidth });

    // Grand Total & Balance
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#0f172a')
      .text('Total Amount:', totalsLeft, yTotals + 50, { align: 'right', width: totalsWidth })
      .text(`$${parseFloat(data.totalAmount).toFixed(2)}`, valuesLeft, yTotals + 50, { align: 'right', width: valuesWidth })
      .text('Amount Paid:', totalsLeft, yTotals + 68, { align: 'right', width: totalsWidth })
      .text(`$${parseFloat(data.amountPaid).toFixed(2)}`, valuesLeft, yTotals + 68, { align: 'right', width: valuesWidth });

    const outstanding = Math.max(0, parseFloat(data.totalAmount) - parseFloat(data.amountPaid));
    doc
      .fillColor(outstanding > 0 ? '#dc2626' : '#16a34a')
      .text('Balance Due:', totalsLeft, yTotals + 86, { align: 'right', width: totalsWidth })
      .text(`$${outstanding.toFixed(2)}`, valuesLeft, yTotals + 86, { align: 'right', width: valuesWidth });

    // Footer
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#94a3b8')
      .text('Thank you for choosing Brightloop Software. Payment terms apply from issue date.', 50, 720, {
        align: 'center',
        width: 500
      });

    doc.end();
  });
}
