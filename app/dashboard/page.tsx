import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { getTenantDb } from '@/lib/db';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { eq } from 'drizzle-orm';
import { env } from '@/env.mjs';
import { redirect } from 'next/navigation';
import log from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface UserSession {
  tenantId: string;
  userId: number;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    log.warn(' No auth token found, redirecting to login.');
    redirect('/login');
  }

  try {
    const decoded = verify(token, env.JWT_SECRET) as UserSession;
    log.info({ session: decoded }, ' User session decoded.');

    const tenantDb = await getTenantDb(decoded.tenantId);
    const userResult = await tenantDb.query.users.findFirst({
      where: eq(tenantSchema.users.id, decoded.userId),
    });

    if (!userResult) {
      log.error({ session: decoded }, ' User not found in tenant DB.');
      cookieStore.delete('authToken');
      redirect('/login');
    }

    return (
      <div className="min-h-screen p-8 bg-gray-100 text-gray-900">
        <h1 className="text-4xl font-bold">Welcome to Tenant: <span className="text-blue-600">{decoded.tenantId}</span> Dashboard</h1>
        <p className="text-xl mt-4">Logged in as: {userResult.name}</p>
        <p className="text-xl mt-4">User email in as: {userResult.email}</p>
        
      </div>
    );
  } catch (err) {
    log.error({ error: err }, ' Authorization failed.');
    cookieStore.delete('authToken');
    redirect('/login');
  }
}