# Transactional Email: Resend

> **Status: Confirmed Architecture**
>
> Email delivery architecture, transactional templates, attachment handling, and local development mocking.

---

## 1. Role & Technology Overview

**Resend** handles transactional email delivery across the system. It is utilized for:
- Delivering password reset magic links.
- Sending accepted quotation summaries.
- Delivering monthly invoice notifications with attached PDF files.
- Sending payment receipt confirmations.
- Notifying customers of overdue invoices.

---

## 2. Decoupled Service Interface

In accordance with our architecture guidelines, Resend is hidden behind a generic `EmailService` interface in `packages/domain`:

```typescript
export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface IEmailService {
  send(options: SendEmailOptions): Promise<{ id: string }>;
}
```

---

## 3. Local Development Mocking (Mailpit)

In local development and automated testing environments, emails are redirected to a local **Mailpit** container rather than calling the external Resend API:
- **SMTP Server**: Listens on `localhost:1025`.
- **Web UI**: Inspect sent emails at `http://localhost:8025`.
- Set `EMAIL_PROVIDER=mailpit` in `.env.local` to route SMTP messages through Mailpit.
