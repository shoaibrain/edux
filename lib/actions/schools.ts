'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import log from '../logger';
import { enforcePermission, getSession } from '../session';
import {
    schools,    
    academicYears,
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

export async function getSchools() {
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    return db.query.schools.findMany();
}

export async function getSchoolById(id: number): Promise<SchoolFormData | null> {
    if (!id) return null;
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const school = await db.query.schools.findFirst({
        where: eq(schools.id, id),
        with: {
            academicYears: { with: { academicTerms: true } }, // ✅ Fetch academic years
            departments: true,
            gradeLevels: true,
        },
    });

    if (!school) return null;

    // ✅ Map academic years properly
    const mappedAcademicYears = school.academicYears.map(ay => ({
        id: ay.id.toString(),
        yearName: ay.yearName,
        startDate: new Date(ay.startDate || ''),
        endDate: new Date(ay.endDate || ''),
        isCurrent: ay.isCurrent ?? false,
        schoolId: ay.schoolId.toString(),
        terms: ay.academicTerms.map(at => ({
            id: at.id.toString(),
            termName: at.termName,
            startDate: new Date(at.startDate || ''),
            endDate: new Date(at.endDate || ''),
            academicYearId: at.academicYearId.toString(),
            gradeLevels: [], // ✅ Empty array since grade levels are school-wide, not term-specific
            isActive: at.isActive ?? true,
            isCurrent: false, // ✅ Add missing isCurrent property with default value
            createdAt: at.createdAt,
            updatedAt: at.updatedAt,
        })),
        createdAt: ay.createdAt,
        updatedAt: ay.updatedAt,
    }));

    // ✅ Return properly typed data without spreading the database type
    return {
        id: school.id,
        name: school.name,
        email: school.email || '',
        address: school.address || '', // ✅ Convert null to empty string
        phone: school.phone || '',     // ✅ Convert null to empty string
        academicYears: mappedAcademicYears, // ✅ Use properly mapped data
        departments: school.departments.map(d => ({ 
            ...d, 
            id: d.id.toString(), 
            description: d.description || undefined 
        })),
        gradeLevels: school.gradeLevels.map(gl => ({
            ...gl, 
            id: gl.id.toString(), 
            description: gl.description || undefined 
        })),
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
            console.log('Updating school with ID:', id);
            const [updatedSchool] = await db.update(schools).set({ ...schoolData, updatedAt: new Date() }).where(eq(schools.id, id)).returning();
            revalidatePath(`/dashboard/schools`);
            return { success: true, message: 'Basic information updated.', school: updatedSchool };
        } else {
            console.log('Creating new school with data:', schoolData);
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
        const path = issue.path.join('.');
        if (!formattedErrors[path]) {
            formattedErrors[path] = [];
        }
        formattedErrors[path]?.push(issue.message);
    });
    return formattedErrors;
};

// ✅ Updated to use new academic scheduler service
export async function upsertAcademicYears(schoolId: number, academicYearsData: z.infer<typeof AcademicYearSchema>[]): Promise<ActionResult> {
    const session = await getSession();
    await enforcePermission('school:update');
    
    try {
        // Import the academic scheduler service
        const { AcademicSchedulerService } = await import('@/lib/services/scheduler/academic-scheduler.service');
        const academicScheduler = new AcademicSchedulerService(schoolId.toString()); // ✅ Pass schoolId

        // Process each academic year
        for (const yearData of academicYearsData) {
            // Check if this is an update or create
            if (yearData.id) {
                // Update existing academic year
                // You might want to implement update logic here
                console.log('Updating academic year:', yearData.id);
            } else {
                // Create new academic year using the scheduler service
                const createOptions = {
                    yearName: yearData.yearName,
                    startDate: new Date(yearData.startDate),
                    endDate: new Date(yearData.endDate),
                    isCurrent: yearData.isCurrent,
                    schoolId: schoolId.toString(),
                    terms: yearData.terms?.map(term => ({
                        termName: term.termName,
                        startDate: new Date(term.startDate),
                        endDate: new Date(term.endDate),
                        gradeLevels:[], // Type assertion for missing field
                    })) || [],
                };

                await academicScheduler.createAcademicYear(createOptions);
            }
        }

        revalidatePath(`/dashboard/schools/${schoolId}`);
        return { success: true, message: 'Academic information saved using scheduler service.' };
    } catch (error) {
        log.error({ error, schoolId }, 'Failed to upsert academic years using scheduler service.');
        return { success: false, message: 'An unexpected server error occurred.' };
    }
}

export async function upsertDepartments(schoolId: number, departmentsData: z.infer<typeof DepartmentSchema>[]): Promise<ActionResult> {
    const session = await getSession();
    await enforcePermission('school:update');
    const db = await getTenantDb(session.tenantId);

    const validation = z.array(DepartmentSchema).safeParse(departmentsData);
    if (!validation.success) {
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
        revalidatePath(`/dashboard/schools/${schoolId}`);
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
        revalidatePath(`/dashboard/schools/${schoolId}`);
        return { success: true, message: 'Grade levels saved.' };
    } catch (error) {
        log.error({ error, schoolId }, 'Failed to upsert grade levels.');
        return { success: false, message: 'An unexpected server error occurred.' };
    }
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
