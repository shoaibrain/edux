// app/api/tenants/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { TenantSignupDto } from '@/lib/dto/tenant';
import { createNeonProject, deleteNeonProject } from '@/lib/neon/api';
import { mainDb, getTenantDb } from '@/lib/db';
import { tenants } from '@/lib/db/schema/shared';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { encrypt } from '@/lib/crypto';
import { runTenantMigrations } from '@/lib/db/migrate';
import { seedTenantData } from '@/scripts/seed-tenant-data';
import log from '@/lib/logger';
import z, { ZodError } from 'zod';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';
import { VerificationEmail } from '@/components/VerificationEmail';
import { render } from '@react-email/render';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    let neonProjectId: string | null = null;
    const { tenantId: tenantIdFromBody } = await request.clone().json();

    try {
        const body = await request.json();
        const data = TenantSignupDto.parse(body);
        const { tenantId, orgName, adminName, adminEmail, adminPassword } = data;

        log.info({ tenantId }, '[API] Tenant creation request received.');

        const existingTenant = await mainDb.query.tenants.findFirst({
            where: eq(tenants.tenantId, tenantId),
        });

        if (existingTenant) {
            log.warn({ tenantId }, '[API] Tenant creation failed: Tenant ID already exists.');
            return NextResponse.json({ error: 'This subdomain is already taken. Please choose another.' }, { status: 409 });
        }

        const neonProject = await createNeonProject(tenantId);
        if (!neonProject || !neonProject.projectId || !neonProject.connectionString) {
            throw new Error("Invalid response from Neon API during project creation.");
        }
        const { projectId: _neonProjectId, connectionString } = neonProject;
        neonProjectId = _neonProjectId;

        const encryptedConnectionString = encrypt(connectionString);

        await mainDb.insert(tenants).values({
            tenantId,
            name: orgName,
            neonProjectId: _neonProjectId,
            connectionString: encryptedConnectionString,
        });
        log.info({ tenantId, neonProjectId }, '[API] Tenant metadata stored.');

        await runTenantMigrations(connectionString);

        const tenantDb = await getTenantDb(tenantId);
        await seedTenantData(tenantDb);
        log.info({ tenantId }, '[API] Default tenant data seeded.');

        const [newAdminPerson] = await tenantDb.insert(tenantSchema.people).values({
            schoolId: null,
            firstName: adminName.split(' ')[0] || adminName,
            lastName: adminName.split(' ')[1] || '',
            contactEmail: adminEmail,
            personType: 'staff',
        }).returning({ id: tenantSchema.people.id });
        log.info({ tenantId, adminEmail, personId: newAdminPerson.id }, '[API] Admin person created in tenant DB.');

        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        const [newAdminUser] = await tenantDb.insert(tenantSchema.users).values({
            personId: newAdminPerson.id,
            email: adminEmail,
            password: hashedPassword,
        }).returning({ id: tenantSchema.users.id });
        log.info({ tenantId, adminEmail, userId: newAdminUser.id }, '[API] Admin user created in tenant DB.');
        
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

        await tenantDb.insert(tenantSchema.verificationTokens).values({
            userId: newAdminUser.id,
            token: verificationToken,
            expiresAt,
        });

        // CORRECTED: Await the async render function
        const emailHtml = await render(<VerificationEmail verificationCode={verificationToken} />);

        // TODO: BUG: Email not sending
        await sendEmail({
            to: adminEmail,
            subject: 'Verify Your eduX Account',
            html: emailHtml,
        });
        log.info({ tenantId, adminEmail }, '[API] Verification email sent.');

        const [tenantAdminRole] = await tenantDb.select().from(tenantSchema.roles).where(eq(tenantSchema.roles.name, 'TENANT_ADMIN'));

        if (tenantAdminRole) {
            await tenantDb.insert(tenantSchema.usersToRoles).values({
                userId: newAdminUser.id,
                roleId: tenantAdminRole.id,
                schoolId: null,
            });
            log.info({ tenantId, userId: newAdminUser.id, role: 'TENANT_ADMIN' }, '[API] Assigned TENANT_ADMIN role to new admin user.');
        } else {
            log.error({ tenantId }, '[API] TENANT_ADMIN role not found during user assignment.');
        }

        return NextResponse.json({ message: 'Tenant created successfully', tenantId, email: adminEmail });

    } catch (err) {
        let errorMessage = 'Internal server error';
        // CORRECTED: Replaced 'any' with a more specific type for better type safety.
        let errorDetails: Record<string, unknown> = { error: 'An unknown error occurred' };

        if (err instanceof z.ZodError) {
            errorMessage = 'Invalid input';
            errorDetails = err.flatten();
            return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 400 });
        }
        
        if (err instanceof Error) {
            errorMessage = err.message;
            errorDetails = { name: err.name, message: err.message, stack: err.stack };
        }

        log.error({ ...errorDetails, tenantId: tenantIdFromBody, neonProjectId }, '[API] Tenant creation failed.');

        if (neonProjectId) {
            await deleteNeonProject(neonProjectId);
        }
        
        return NextResponse.json({ error: 'Failed to create tenant. Please try again.' }, { status: 500 });
    }
}
