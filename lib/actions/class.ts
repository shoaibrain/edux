// /lib/actions/class.ts

'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { and, eq, asc } from 'drizzle-orm';
import { enforcePermission, getSession } from '../session';
import { schools, academicTerms, academicYears, subjects, people, gradeLevels, locations, classPeriods, departments } from '../db/schema/tenant';
import { ClassFormSchema, type ClassFormInput, type Prerequisites } from '@/lib/dto/class';
import log from '../logger';

// Action to get all data needed for the class form dropdowns
export async function getPrerequisitesForClassForm(schoolId: number): Promise<Prerequisites> {
    await enforcePermission('class:manage');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const [terms, subs, teachers, grades, locs, depts] = await Promise.all([
        db.select({
            id: academicTerms.id,
            termName: academicTerms.termName,
            yearName: academicYears.yearName,
            startDate: academicYears.startDate,
        }).from(academicTerms).innerJoin(academicYears, eq(academicTerms.academicYearId, academicYears.id)).where(eq(academicYears.schoolId, schoolId)),
        db.select().from(subjects).where(eq(subjects.schoolId, schoolId)),
        db.select({id: people.id, firstName: people.firstName, lastName: people.lastName}).from(people).where(and(eq(people.schoolId, schoolId), eq(people.personType, 'staff'))),
        db.select().from(gradeLevels).where(eq(gradeLevels.schoolId, schoolId)).orderBy(asc(gradeLevels.levelOrder)),
        db.select().from(locations).where(eq(locations.schoolId, schoolId)),
        db.select().from(departments).where(eq(departments.schoolId, schoolId)),
    ]);

    return { academicTerms: terms, subjects: subs, teachers, gradeLevels: grades, locations: locs, departments: depts };
}


// Action to upsert a class period
export async function upsertClassPeriod(data: ClassFormInput) {
    const session = await getSession();
    await enforcePermission('class:manage');
    const db = await getTenantDb(session.tenantId);

    const validatedFields = ClassFormSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data provided.', errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { id, ...classData } = validatedFields.data;
    
    try {
        if (id) {
            // Update logic here
            await db.update(classPeriods).set({ ...classData, updatedAt: new Date() }).where(eq(classPeriods.id, id));
            log.info({ classId: id, tenantId: session.tenantId }, 'Class period updated.');
        } else {
            // Create logic
            await db.insert(classPeriods).values(classData);
            log.info({ name: classData.name, tenantId: session.tenantId }, 'New class period created.');
        }
        revalidatePath(`/dashboard/schools/${data.schoolId}/classes`);
        return { success: true, message: `Class period successfully ${id ? 'updated' : 'created'}.` };
    } catch (error) {
        log.error({ error, data }, 'Failed to upsert class period.');
        return { success: false, message: 'An unexpected database error occurred.' };
    }
}