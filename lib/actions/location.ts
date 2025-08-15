'use server';

import { getTenantDb } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { enforcePermission, getSession } from '../session';
import { locations } from '../db/schema/tenant';
import { LocationFormSchema, type LocationFormInput } from '@/lib/dto/location';
import log from '../logger';

export async function upsertLocationAction(data: LocationFormInput) {
    const session = await getSession();
    await enforcePermission('class:manage'); 
    
    const validatedFields = LocationFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data provided.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const db = await getTenantDb(session.tenantId);
    const { id, ...locationData } = validatedFields.data;

    try {
        if (id) {
            const [updatedLocation] = await db.update(locations).set({ ...locationData, updatedAt: new Date() }).where(eq(locations.id, id)).returning();
            log.info({ locationId: id, tenantId: session.tenantId }, 'Location updated.');
            return { success: true, message: 'Location updated successfully.', location: updatedLocation };
        } else {
            const [newLocation] = await db.insert(locations).values(locationData).returning();
            log.info({ locationId: newLocation.id, tenantId: session.tenantId }, 'New location created.');
            return { success: true, message: 'Location created successfully.', location: newLocation };
        }
    } catch (error) {
        log.error({ error, data }, 'Failed to upsert location.');
        return { success: false, message: 'An unexpected database error occurred.' };
    }
}