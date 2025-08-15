'use server';

import { subjects } from '../db/schema/tenant';
import { SubjectFormSchema, type SubjectFormInput } from '@/lib/dto/subject';
import log from '../logger';
import { getTenantDb } from '../db';
import { eq } from 'drizzle-orm';
import { enforcePermission, getSession } from '../session';


export async function upsertSubjectAction(data: SubjectFormInput) {
    const session = await getSession();
    await enforcePermission('class:manage'); 
    
    const validatedFields = SubjectFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data provided.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const db = await getTenantDb(session.tenantId);
    const { id, ...subjectData } = validatedFields.data;

    try {
        if (id) {
            const [updatedSubject] = await db.update(subjects).set({ ...subjectData, updatedAt: new Date() }).where(eq(subjects.id, id)).returning();
            log.info({ subjectId: id, tenantId: session.tenantId }, 'Subject updated.');
            return { success: true, message: 'Subject updated successfully.', subject: updatedSubject };
        } else {
            const [newSubject] = await db.insert(subjects).values(subjectData).returning();
            log.info({ subjectId: newSubject.id, tenantId: session.tenantId }, 'New subject created.');
            return { success: true, message: 'Subject created successfully.', subject: newSubject };
        }
    } catch (error) {
        log.error({ error, data }, 'Failed to upsert subject.');
        return { success: false, message: 'An unexpected database error occurred.' };
    }
}

