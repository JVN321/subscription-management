import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static resendClient: Resend | null = null;

  private static getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey.startsWith('re_') && apiKey !== 're_placeholder') {
      if (!this.resendClient) {
        this.resendClient = new Resend(apiKey);
      }
      return this.resendClient;
    }
    return null;
  }

  public static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; mode: 'live' | 'simulated' }> {
    const client = this.getClient();
    const from = process.env.RESEND_FROM_EMAIL || 'Brightloop <onboarding@resend.dev>';

    if (client) {
      try {
        const { data, error } = await client.emails.send({
          from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text || payload.subject
        });

        if (error) {
          console.error('[EmailService: Resend Error]', error);
          return { success: false, mode: 'live' };
        }

        console.log(`[EmailService: Resend Live] Sent to: ${payload.to} | Subject: "${payload.subject}" | ID: ${data?.id}`);
        return { success: true, id: data?.id, mode: 'live' };
      } catch (err) {
        console.error('[EmailService: Exception during Resend dispatch]', err);
        return { success: false, mode: 'live' };
      }
    }

    // Fallback: Structured simulation logging when RESEND_API_KEY is not set
    console.log(`[EmailService: Simulated Resend] To: ${payload.to} | From: ${from} | Subject: "${payload.subject}"`);
    return { success: true, id: `sim_${Date.now()}`, mode: 'simulated' };
  }

  public static async sendWelcomeEmail(to: string, name: string) {
    const subject = 'Welcome to Brightloop Software';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 6px;">
        <h2 style="color: #09090b; margin-top: 0;">Welcome to Brightloop, ${name}</h2>
        <p style="color: #52525b; line-height: 1.5;">Your account has been provisioned successfully on the Brightloop Subscription Management Platform.</p>
        <div style="background-color: #f8f8f9; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #09090b;"><strong>Registered Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #09090b;"><strong>Portal URL:</strong> <a href="http://localhost:3000">http://localhost:3000</a></p>
        </div>
        <p style="color: #71717a; font-size: 13px;">Manage your subscription plans, inspect real-time billing cycles, and download PDF invoices directly from your self-service portal.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }

  public static async sendPasswordResetEmail(to: string, resetLink: string) {
    const subject = 'Reset Your Brightloop Password';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 6px;">
        <h2 style="color: #09090b; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #52525b; line-height: 1.5;">We received a request to reset the password for your Brightloop account (${to}).</p>
        <p style="margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #ff6b00; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 14px;">Reset Password</a>
        </p>
        <p style="color: #a1a1aa; font-size: 12px;">If you did not request this change, you can safely ignore this notification. The link will expire in 24 hours.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }

  public static async sendInvoiceEmail(to: string, invoiceNumber: string, amount: string, dueDate: string) {
    const subject = `Invoice ${invoiceNumber} from Brightloop Software`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 6px;">
        <h2 style="color: #09090b; margin-top: 0;">Invoice ${invoiceNumber}</h2>
        <p style="color: #52525b; line-height: 1.5;">Your recurring subscription invoice is now available.</p>
        <div style="background-color: #f8f8f9; padding: 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #09090b;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #09090b;"><strong>Total Amount:</strong> $${amount}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #09090b;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p style="color: #52525b; font-size: 14px;">You can view and settle this invoice directly via your Customer Self-Service Portal at <a href="http://localhost:3000">http://localhost:3000</a>.</p>
      </div>
    `;
    return this.sendEmail({ to, subject, html });
  }
}
