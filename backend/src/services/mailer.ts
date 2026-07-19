import nodemailer, { Transporter } from 'nodemailer';
import { env, isProd } from '../config/env';
import { logger } from '../config/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (env.SMTP_HOST && env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email. In development without SMTP configured, the message is
 * logged to the console so flows (verify/reset) remain testable end-to-end.
 */
export async function sendMail({ to, subject, html, text }: MailOptions) {
  const tx = getTransporter();
  if (!tx) {
    logger.info(`📧 [dev-mail] To: ${to} | Subject: ${subject}`);
    if (!isProd) logger.debug(text ?? html);
    return;
  }
  await tx.sendMail({ from: env.MAIL_FROM, to, subject, html, text });
  logger.info(`📧 Email sent to ${to} — ${subject}`);
}

const wrap = (title: string, body: string) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#0b0f1c;color:#e6e9f2;border-radius:16px">
    <h1 style="font-size:20px;margin:0 0 8px">${title}</h1>
    ${body}
    <p style="color:#8b93a7;font-size:12px;margin-top:32px">© ${new Date().getFullYear()} DigiLog · Smart Digital Logbook</p>
  </div>`;

const btn = (href: string, label: string) => `
  <a href="${href}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:linear-gradient(135deg,#4f46e5,#a21caf);color:#fff;text-decoration:none;border-radius:10px;font-weight:600">${label}</a>`;

export function verificationEmail(name: string, link: string): string {
  return wrap(
    'Verify your email',
    `<p style="color:#c3c9d8;line-height:1.6">Hi ${name}, welcome to DigiLog. Confirm your email to activate your account.</p>
     ${btn(link, 'Verify email')}
     <p style="color:#8b93a7;font-size:13px">This link expires in 24 hours.</p>`
  );
}

export function resetPasswordEmail(name: string, link: string): string {
  return wrap(
    'Reset your password',
    `<p style="color:#c3c9d8;line-height:1.6">Hi ${name}, we received a request to reset your DigiLog password.</p>
     ${btn(link, 'Reset password')}
     <p style="color:#8b93a7;font-size:13px">If you didn't request this, you can safely ignore this email. The link expires in 1 hour.</p>`
  );
}

export function incidentEscalationEmail(
  name: string,
  incidentTitle: string,
  severity: string,
  link: string
): string {
  return wrap(
    `Incident escalated — ${severity}`,
    `<p style="color:#c3c9d8;line-height:1.6">Hi ${name}, an incident has been escalated and needs your attention:</p>
     <p style="color:#e6e9f2;font-weight:600;margin:12px 0">${incidentTitle}</p>
     ${btn(link, 'View incident')}`
  );
}
