// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gte } from 'drizzle-orm';
import { getTenantDb } from '@/lib/db';
import { users, verificationTokens } from '@/lib/db/schema/tenant';
import log from '@/lib/logger';


export async function POST(request: NextRequest) {
  try {
    const { email, token, tenantId } = await request.json();

    if (!email || !token || !tenantId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const db = await getTenantDb(tenantId);
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }
    
    if (user.emailVerified) {
        return NextResponse.json({ message: 'Email already verified.' });
    }

    const verificationToken = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.userId, user.id), 
        eq(verificationTokens.token, token),
        gte(verificationTokens.expiresAt, new Date()) // Check if token is not expired
      ),
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired verification token.' }, { status: 400 });
    }

    // Mark user as verified and delete the token in a transaction
    await db.transaction(async (tx) => {
        await tx.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
        await tx.delete(verificationTokens).where(eq(verificationTokens.id, verificationToken.id));
    });

    log.info({ userId: user.id, tenantId }, 'Email verified successfully.');
    return NextResponse.json({ message: 'Email verified successfully.' });

  } catch (error) {
    log.error({ error }, 'Verification API error');
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
