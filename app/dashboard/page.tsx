// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getTenantDb } from '@/lib/db';

import { eq } from 'drizzle-orm';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';  // Node runtime

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('authToken')?.value;
  if (!token) {
    return <div>Unauthorized</div>;
  }

  let decoded;
  try {
    decoded = verify(token, env.JWT_SECRET) as { tenantId: string; userId: number };

    // Validate tenant
    // await validateTenant(decoded.tenantId);

    const { db: tenantDb, schema } = await getTenantDb(decoded.tenantId);
    const user = await tenantDb.select().from(schema.users).where(eq(schema.users.id, decoded.userId)).limit(1);

    return (
      <div className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl">Welcome to {decoded.tenantId} Dashboard</h1>
        <p>Email: {user[0]?.email}</p>
      </div>
    );
  } catch (err) {
    if (err === 'Tenant not found') {
      return <div>Tenant not found</div>;
    }
    return <div>Invalid token</div>;
  }
}