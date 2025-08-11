import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { TenantSignupDto } from '@/lib/dto/tenant';
import { createNeonProject } from '@/lib/neon/api';
import { mainDb, getTenantDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { encrypt } from '@/lib/crypto';
import { runTenantMigrations } from '@/lib/db/migrate';
import { seedTenantData } from '@/scripts/seed-tenant-data';
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

    // Check if tenantId already exists
    const existingTenant = await mainDb.query.tenants.findFirst({
      where: eq(tenants.tenantId, tenantId),
    });

    if (existingTenant) {
      log.warn({ tenantId }, '[API] Tenant creation failed: Tenant ID already exists.');
      return NextResponse.json({ error: 'This subdomain is already taken. Please choose another.' }, { status: 409 });
    }

    // 1. Create the new database project on Neon
    const neonProject = await createNeonProject(tenantId);
    if (!neonProject || !neonProject.projectId || !neonProject.connectionString) {
      throw new Error("Invalid response from Neon API during project creation.");
    }
    const { projectId: _neonProjectId, connectionString } = neonProject;
    neonProjectId = _neonProjectId;
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

    // 5. Create the tenant's first admin PERSON in their new database
    const [newAdminPerson] = await tenantDb.insert(tenantSchema.people).values({
      schoolId: null,
      firstName: adminName.split(' ')[0] || adminName,
      lastName: adminName.split(' ')[1] || '',
      contactEmail: adminEmail,
      personType: 'staff',
    }).returning({ id: tenantSchema.people.id });
    log.info({ tenantId, adminEmail, personId: newAdminPerson.id }, '[API] Admin person created in tenant DB.');


    // 6. Create the tenant's first admin USER in their new database, linked to the person
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const [newAdminUser] = await tenantDb.insert(tenantSchema.users).values({
      personId: newAdminPerson.id,
      email: adminEmail,
      password: hashedPassword,
    }).returning({ id: tenantSchema.users.id });
    log.info({ tenantId, adminEmail, userId: newAdminUser.id }, '[API] Admin user created in tenant DB.');

    // 7. Assign TENANT_ADMIN role to the newly created admin user
    const [tenantAdminRole] = await tenantDb.select()
      .from(tenantSchema.roles)
      .where(eq(tenantSchema.roles.name, 'TENANT_ADMIN'));

    if (tenantAdminRole) {
      await tenantDb.insert(tenantSchema.usersToRoles).values({
        userId: newAdminUser.id,
        roleId: tenantAdminRole.id,
        schoolId: null,
      });
      log.info({ tenantId, userId: newAdminUser.id, role: 'TENANT_ADMIN' }, '[API] Assigned TENANT_ADMIN role to new admin user.');
    } else {
      log.error({ tenantId }, '[API] TENANT_ADMIN role not found during user assignment. This indicates a seeding issue.');
    }

    // 8. Done!
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
