'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq, inArray } from 'drizzle-orm';
import log from '../logger';
import { enforcePermission, getSession } from '../session';
import {
    schools,
    academicYears,
    academicTerms,
    departments,
    gradeLevels,
} from '../db/schema/tenant';
import {
    AcademicTermSchema,
    AcademicYearSchema,
    BasicInfoSchema,
    DepartmentSchema,
    GradeLevelSchema,
} from '@/lib/dto/school';
import { SchoolFormData } from '@/app/(dashboard)/dashboard/(schools)/schools/_components/types/school-forms';
import z from 'zod';

// Define a reusable type for action results
type ActionResult = {
    success: boolean;
    message: string;
    errors?: Record<string, string[] | undefined>;
};

type BasicInfoActionResult = {
    success: boolean;
    message: string;
    errors?: Record<string, string[] | undefined>;
    school?: typeof schools.$inferSelect;
}

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

// RE-ADD `getSchools` for the main data table
export async function getSchools() {
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    return db.query.schools.findMany();
}

export async function getSchoolById(id: number): Promise<SchoolFormData | null> {
    // ... (implementation remains the same, but let's fix the type mappings)
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const school = await db.query.schools.findFirst({
        where: eq(schools.id, id),
        with: {
            academicYears: { with: { academicTerms: true } },
            departments: true,
            gradeLevels: true,
        },
    });

    if (!school) return null;

    return {
        ...school,
        email: school.email || '',
        academicYears: school.academicYears.map(ay => ({
            ...ay,
            id: ay.id.toString(),
            startDate: ay.startDate || '',
            endDate: ay.endDate || '',
            terms: ay.academicTerms.map(at => ({
                ...at,
                id: at.id.toString(),
                startDate: at.startDate || '',
                endDate: at.endDate || '',
            })),
        })),
        // FIX type mismatch by handling null
        departments: school.departments.map(d => ({ ...d, id: d.id.toString(), description: d.description || undefined })),
        gradeLevels: school.gradeLevels.map(gl => ({...gl, id: gl.id.toString(), description: gl.description || undefined })),
        // Make branding optional
        branding: school.brandingJson ? JSON.parse(school.brandingJson as string) : undefined,
    };
}
export async function upsertSchoolBasicInfo(data: z.infer<typeof BasicInfoSchema>): Promise<BasicInfoActionResult> {
    const session = await getSession();
    const validatedFields = BasicInfoSchema.safeParse(data);

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid data provided.', errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...schoolData } = validatedFields.data;
    const requiredPermission = id ? 'school:update' : 'school:create';
    await enforcePermission(requiredPermission);
    const db = await getTenantDb(session.tenantId);

    try {
        if (id) {
            const [updatedSchool] = await db.update(schools).set({ ...schoolData, updatedAt: new Date() }).where(eq(schools.id, id)).returning();
            revalidatePath(`/dashboard/schools`);
            return { success: true, message: 'Basic information updated.', school: updatedSchool };
        } else {
            const [newSchool] = await db.insert(schools).values(schoolData).returning();
            revalidatePath('/dashboard/schools');
            return { success: true, message: 'School created successfully.', school: newSchool };
        }
    } catch (error) {
        log.error({ error, data }, 'Failed to upsert school basic info.');
        if (isDatabaseError(error) && error.code === '23505') {
            return { success: false, message: "A school with this name already exists.", errors: { name: ["This name is already in use."] } };
        }
        return { success: false, message: "An unexpected server error occurred." };
    }
}
const formatZodArrayErrors = (error: z.ZodError): Record<string, string[] | undefined> => {
    const formattedErrors: Record<string, string[] | undefined> = {};
    error.issues.forEach(issue => {
        const path = issue.path.join('.'); // e.g., "0.name" or "2.terms.0.startDate"
        if (!formattedErrors[path]) {
            formattedErrors[path] = [];
        }
        formattedErrors[path]?.push(issue.message);
    });
    return formattedErrors;
};

export async function upsertAcademicYears(schoolId: number, academicYearsData: z.infer<typeof AcademicYearSchema>[]): Promise<ActionResult> {
    const session = await getSession();
    await enforcePermission('school:update');
    const db = await getTenantDb(session.tenantId);

    const validation = z.array(AcademicYearSchema).safeParse(academicYearsData);
     if (!validation.success) {
        return { success: false, message: 'Invalid academic year data.', errors: formatZodArrayErrors(validation.error) };
    }

    try {
        await db.transaction(async (tx) => {
            const existingYears = await tx.query.academicYears.findMany({ where: eq(academicYears.schoolId, schoolId), columns: { id: true } });
            if (existingYears.length > 0) {
                await tx.delete(academicTerms).where(inArray(academicTerms.academicYearId, existingYears.map(y => y.id)));
            }
            await tx.delete(academicYears).where(eq(academicYears.schoolId, schoolId));

            for (const yearData of validation.data) {
                const [newYear] = await tx.insert(academicYears).values({
                    schoolId,
                    yearName: yearData.yearName,
                    startDate: yearData.startDate,
                    endDate: yearData.endDate,
                    isCurrent: yearData.isCurrent,
                }).returning({ id: academicYears.id });

                if (yearData.terms?.length) {
                    await tx.insert(academicTerms).values(yearData.terms.map((term: z.infer<typeof AcademicTermSchema>) => ({
                        academicYearId: newYear.id,
                        termName: term.termName,
                        startDate: term.startDate,
                        endDate: term.endDate,
                        isCurrent: term.isCurrent,
                    })));
                }
            }
        });
        revalidatePath(`/dashboard/schools/onboard/${schoolId}`);
        return { success: true, message: 'Academic information saved.' };
    } catch (error) {
        log.error({ error, schoolId }, 'Failed to upsert academic years.');
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}

export async function upsertDepartments(schoolId: number, departmentsData: z.infer<typeof DepartmentSchema>[]): Promise<ActionResult> {
    const session = await getSession();
    await enforcePermission('school:update');
    const db = await getTenantDb(session.tenantId);

    const validation = z.array(DepartmentSchema).safeParse(departmentsData);
    if (!validation.success) {
        // FIX: Use the new error formatter
        return { success: false, message: 'Invalid department data.', errors: formatZodArrayErrors(validation.error) };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.delete(departments).where(eq(departments.schoolId, schoolId));
            if (validation.data.length > 0) {
                await tx.insert(departments).values(validation.data.map(dept => ({
                    schoolId,
                    name: dept.name,
                    description: dept.description,
                })));
            }
        });
        revalidatePath(`/dashboard/schools/onboard/${schoolId}`);
        return { success: true, message: 'Departments saved.' };
    } catch (error) {
        log.error({ error, schoolId }, 'Failed to upsert departments.');
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}

export async function upsertGradeLevels(schoolId: number, gradeLevelsData: z.infer<typeof GradeLevelSchema>[]): Promise<ActionResult> {
    const session = await getSession();
    await enforcePermission('school:update');
    const db = await getTenantDb(session.tenantId);

    const validation = z.array(GradeLevelSchema).safeParse(gradeLevelsData);
    if (!validation.success) {
        // FIX: Use the new error formatter
        return { success: false, message: 'Invalid grade level data.', errors: formatZodArrayErrors(validation.error) };
    }

    try {
        await db.transaction(async (tx) => {
            await tx.delete(gradeLevels).where(eq(gradeLevels.schoolId, schoolId));
            if (validation.data.length > 0) {
                await tx.insert(gradeLevels).values(validation.data.map(grade => ({
                    schoolId,
                    name: grade.name,
                    levelOrder: grade.levelOrder,
                    description: grade.description,
                })));
            }
        });
        revalidatePath(`/dashboard/schools/onboard/${schoolId}`);
        return { success: true, message: 'Grade levels saved.' };
    } catch (error) {
        log.error({ error, schoolId }, 'Failed to upsert grade levels.');
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}


// RE-ADD `deleteSchoolAction` for the data table
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
