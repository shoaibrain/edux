// lib/email.ts
import { Resend } from 'resend';
import { env } from '@/env.mjs';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}
// TODO: BUG Email is not being sent. To be implemented later
export const sendEmail = async ({ to, subject, html }: EmailOptions) => {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your verified domain
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email.');
  }
};
