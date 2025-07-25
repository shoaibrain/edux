import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { TenantSignupDto } from '@/lib/dto/tenant';
import { createNeonProject } from '@/lib/neon/api';
import { mainDb, getTenantDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { encrypt } from '@/lib/crypto';
import { runTenantMigrations } from '@/lib/db/migrate';
import { seedTenantData } from '@/scripts/seed-tenant-data'; // Import the new seeding script
import log from '@/lib/logger';
import z from 'zod';
import { eq } from 'drizzle-orm';

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

    // 4. Seed default roles and permissions in the new tenant database
    const tenantDb = await getTenantDb(tenantId);
    await seedTenantData(tenantDb);
    log.info({ tenantId }, '[API] Default tenant data seeded.');

    // 5. Create the tenant's first admin user in their new database
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const [newAdminUser] = await tenantDb.insert(tenantSchema.users).values({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
    }).returning({ id: tenantSchema.users.id });
    log.info({ tenantId, adminEmail, userId: newAdminUser.id }, '[API] Admin user created in tenant DB.');

    // 6. Assign TENANT_ADMIN role to the newly created admin user
    const [tenantAdminRole] = await tenantDb.select()
      .from(tenantSchema.roles)
      .where(eq(tenantSchema.roles.name, 'TENANT_ADMIN'));

    if (tenantAdminRole) {
      await tenantDb.insert(tenantSchema.usersToRoles).values({
        userId: newAdminUser.id,
        roleId: tenantAdminRole.id,
      });
      log.info({ tenantId, userId: newAdminUser.id, role: 'TENANT_ADMIN' }, '[API] Assigned TENANT_ADMIN role to new admin user.');
    } else {
      log.error({ tenantId }, '[API] TENANT_ADMIN role not found during user assignment. This indicates a seeding issue.');
    }

    // 7. Done!
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
    
    // In a real production system, you might want to implement a rollback mechanism
    // for Neon project creation if subsequent steps fail.
    // For this exercise, we'll just log and return the error.

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err }, { status: 400 });
    }
    console.log(`ERRROR:${JSON.stringify(err)}`)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
