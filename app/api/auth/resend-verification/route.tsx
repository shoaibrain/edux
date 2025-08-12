// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema/tenant';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { render } from '@react-email/render';
import log from '@/lib/logger';
import { VerificationEmail } from '@/components/VerificationEmail';


export async function POST(request: NextRequest) {
  try {
    const { email, tenantId } = await request.json();

    if (!email || !tenantId) {
      return NextResponse.json({ error: 'Email and Tenant ID are required.' }, { status: 400 });
    }

    const db = await getTenantDb(tenantId);
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      // Still return a success message to prevent user enumeration
      return NextResponse.json({ message: 'If your account exists, a new verification code has been sent.' });
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ message: 'This email has already been verified.' });
    }

    // Generate and store a new verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Use a transaction to delete old tokens and insert the new one
    await db.transaction(async (tx) => {
        await tx.delete(verificationTokens).where(eq(verificationTokens.userId, user.id));
        await tx.insert(verificationTokens).values({
            userId: user.id,
            token: verificationToken,
            expiresAt,
        });
    });

    // Send verification email
    const emailHtml = await render(<VerificationEmail verificationCode={verificationToken} />);
    await sendEmail({
      to: email,
      subject: 'Your New eduX Verification Code',
      html: emailHtml,
    });

    log.info({ userId: user.id, tenantId }, 'Resent verification email.');
    return NextResponse.json({ message: 'A new verification code has been sent to your email.' });

  } catch (error) {
    log.error({ error }, 'Resend verification API error');
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
