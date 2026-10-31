# PDF Generation Engine: PDFKit

> **Status: Confirmed Architecture**
>
> Server-side document rendering for invoices and quotations using lightweight PDFKit.

---

## 1. Role & Technology Overview

**PDFKit** is the designated engine for generating downloadable and printable invoice and quotation PDF documents.

### Why PDFKit over Headless Chromium / Puppeteer?
- **Resource Footprint**: Puppeteer requires bundling a full Chromium browser (~500MB to 1GB container bloat) and consumes 300MB+ RAM per render instance.
- **Speed**: PDFKit generates vector PDF documents in under 50ms with minimal CPU and under 25MB RAM.
- **Ponytail Alignment**: Direct Node.js stream generation without heavyweight external browser runtimes.

---

## 2. Rendering Workflow & Host Drive Mounts

1. When an invoice transitions to `CONFIRMED` or a quotation is finalized, a BullMQ job `pdf.generate_invoice` is enqueued.
2. The worker extracts the immutable invoice snapshot from PostgreSQL.
3. PDFKit renders the invoice:
   - Header with Brightloop Software branding.
   - Customer billing details.
   - Subscription terms and billing period.
   - Line items table (product name, variant description, quantity, unit price, tax rate, amount).
   - Summary totals (subtotal, discounts applied, taxes, total amount, amount paid, balance due).
4. The generated PDF is streamed directly to the persistent host drive mount:
   ```text
   /app/media/invoices/{invoiceId}.pdf
   ```
5. The relative URL path (`/media/invoices/{invoiceId}.pdf`) is saved on the invoice record in PostgreSQL.
