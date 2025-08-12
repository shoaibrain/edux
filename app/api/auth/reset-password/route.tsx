// app/api/auth/reset-password/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { passwordResetTokens, users } from '@/lib/db/schema/tenant';
import { eq, and, gte } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '@/lib/logger';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  token: z.string().min(1, 'Token is required.'),
  tenantId: z.string().min(1, 'Tenant ID is required.'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { password, token, tenantId } = validation.data;
    
    const db = await getTenantDb(tenantId);

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        gte(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired password reset token.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, resetToken.userId));
      
      await tx.delete(passwordResetTokens)
        .where(eq(passwordResetTokens.userId, resetToken.userId));
    });
    
    log.info({ userId: resetToken.userId, tenantId }, 'Password reset successfully.');
    return NextResponse.json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    log.error({ error }, 'Reset password API error');
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
