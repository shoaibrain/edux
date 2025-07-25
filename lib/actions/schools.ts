'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import log from '../logger';
import { enforcePermission, getSession } from '../session';
import { schools } from '../db/schema/tenant'; // Import the schools schema
import { SchoolFormInput, SchoolFormSchema } from '../dto/school';

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export async function getSchools() {
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    try {
        const result = await db.query.schools.findMany();
        return result;
    } catch (error) {
        log.error({ error, tenantId: session.tenantId }, 'Failed to fetch schools.');
        throw new Error('Failed to retrieve schools.');
    }
}

export async function upsertSchoolAction(data: SchoolFormInput) {
    const session = await getSession();
    
    const validatedFields = SchoolFormSchema.safeParse(data);

    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), data }, 'Invalid school data provided for upsert.');
        return { success: false, message: 'Invalid school data.' };
    }

    const { id, name, address, phone, email, website, logoUrl, brandingJson } = validatedFields.data;
    
    const requiredPermission = id ? 'school:update' : 'school:create';
    await enforcePermission(requiredPermission);

    const db = await getTenantDb(session.tenantId);

    try {
        if (id) { // Update existing school
            await db.update(schools).set({
                name,
                address,
                phone,
                email,
                website,
                logoUrl,
                brandingJson,
                updatedAt: new Date(),
            }).where(eq(schools.id, id));
            log.info({ schoolId: id, name, tenantId: session.tenantId }, 'School updated.');
        } else { // Create new school
            await db.insert(schools).values({
                name,
                address,
                phone,
                email,
                website,
                logoUrl,
                brandingJson,
            });
            log.info({ name, tenantId: session.tenantId }, 'School created.');
        }
    } catch (error: unknown) {
        log.error({ error, tenantId: session.tenantId, userId: session.userId, data }, 'Failed to upsert school');
        if (isDatabaseError(error) && error.code === '23505') { // Unique constraint violation
            return { 
                success: false, 
                message: "A school with this name already exists.",
                errors: { name: ["This school name is already in use."] }
            };
        }
        return { success: false, message: "An unexpected error occurred while saving school." };
    }

    revalidatePath('/dashboard/schools');
    return { success: true, message: `School successfully ${id ? 'updated' : 'created'}.` };
}

export async function deleteSchoolAction(schoolId: number) {
    await enforcePermission('school:delete');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        await db.delete(schools).where(eq(schools.id, schoolId));
        log.info({ schoolId, tenantId: session.tenantId }, 'School deleted.');
        revalidatePath('/dashboard/schools');
        return { success: true, message: "School deleted successfully." };
    } catch (error) {
        log.error({ error, schoolId, tenantId: session.tenantId }, 'Failed to delete school');
        return { success: false, message: "Failed to delete school." };
    }
}
