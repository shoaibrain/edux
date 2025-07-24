import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { TenantSignupDto } from '@/lib/dto/tenant';
import { createNeonProject } from '@/lib/neon/api';
import { mainDb, getTenantDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { encrypt } from '@/lib/crypto';
import { runTenantMigrations } from '@/lib/db/migrate';
import log from '@/lib/logger';
import z from 'zod';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let neonProjectId: string | null = null;
  try {
const body = await request.json();
    const data = TenantSignupDto.parse(body);
    const { tenantId, orgName, adminName, adminEmail, adminPassword } = data;

    log.info({ tenantId }, '[API] Tenant creation request received.');

    // 1. Create the new database project on Neon
    const neonProject = await createNeonProject(tenantId);
    if (!neonProject || !neonProject.projectId || !neonProject.connectionString) {
      throw new Error("Invalid response from Neon API during project creation.");
    }
    const { projectId: _neonProjectId, connectionString } = neonProject;
    neonProjectId = _neonProjectId; // Assign to the outer scope variable for the catch block
    console.log(`neonProject: ${JSON.stringify(neonProject)}`);
    // 2. Store the new tenant's metadata in your main database
    const encryptedConnectionString = encrypt(connectionString);

    await mainDb.insert(tenants).values({
      tenantId,
      name: orgName,
      neonProjectId: _neonProjectId,
      connectionString: encryptedConnectionString,
    });
    log.info({ tenantId, neonProjectId }, '[API] Tenant metadata stored.');

    // 3. Run the migrations on the newly created tenant database
    await runTenantMigrations(connectionString);

    // 4. Create the tenant's first admin user in their new database
    const tenantDb = await getTenantDb(tenantId);
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await tenantDb.insert(tenantSchema.users).values({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
    });
    log.info({ tenantId, adminEmail }, '[API] Admin user created in tenant DB.');

    // 5. Done!
    return NextResponse.json({ message: 'Tenant created successfully', tenantId });

  } catch (err) {
    let errorDetails = {};
    if (err instanceof Error) {
        errorDetails = {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
    } else {
        errorDetails = { error: 'An unknown error occurred' };
    }
    
    log.error({ ...errorDetails, neonProjectId }, '[API] Tenant creation failed.');
    

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.log(`ERRROR:${JSON.stringify(err)}`)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}