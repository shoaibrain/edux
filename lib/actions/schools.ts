'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import log from '../logger';
import { enforcePermission, getSession } from '../session';
import { 
    schools, academicYears, academicTerms, departments, gradeLevels 
} from '../db/schema/tenant'; // Import all relevant schemas
import { SchoolFormSchema, type SchoolFormInput } from '@/lib/dto/school'; 

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export async function getSchools() {
    await enforcePermission('school:read');
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    try {
        const result = await db.query.schools.findMany({
            with: { // Eager load relations for comprehensive school data retrieval
                academicYears: { with: { academicTerms: true } },
                departments: true,
                gradeLevels: true,
            }
        });
        // Convert brandingJson back to BrandingConfig structure for UI consumption
        return result.map(school => ({
            ...school,
            // Parse brandingJson back to a structured object if it exists
            branding: school.brandingJson ? school.brandingJson as SchoolFormInput['branding'] : {
                // Provide default BrandingConfig if brandingJson is null
                colors: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#38bdf8", background: "#ffffff", text: "#1f2937" },
                typography: { headingFont: "Inter, sans-serif", bodyFont: "Inter, sans-serif", fontSize: "medium" },
                theme: { mode: "light", borderRadius: "medium", shadows: true },
                layout: { sidebarPosition: "left", headerStyle: "standard", cardStyle: "elevated" },
            },
        }));
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

    const { 
        id, name, address, phone, email, website, logoUrl, branding, 
        academicYears: formAcademicYears, departments: formDepartments, gradeLevels: formGradeLevels
    } = validatedFields.data;
    
    const requiredPermission = id ? 'school:update' : 'school:create';
    await enforcePermission(requiredPermission);

    const db = await getTenantDb(session.tenantId);

    try {
        let schoolId: number;
        await db.transaction(async (tx) => {
            // Convert BrandingConfig object to JSONB string for database storage
            const brandingJsonData = JSON.stringify(branding); 

            if (id) { // Update existing school
                await tx.update(schools).set({
                    name,
                    address,
                    phone,
                    email,
                    website,
                    logoUrl,
                    brandingJson: brandingJsonData as any, // Cast to any to satisfy jsonb type (Drizzle limitation)
                    updatedAt: new Date(),
                }).where(eq(schools.id, id));
                schoolId = id;
                log.info({ schoolId: id, name, tenantId: session.tenantId }, 'School updated.');
            } else { // Create new school
                const [newSchool] = await tx.insert(schools).values({
                    name,
                    address,
                    phone,
                    email,
                    website,
                    logoUrl,
                    brandingJson: brandingJsonData as any, // Cast to any to satisfy jsonb type
                }).returning({ id: schools.id });
                schoolId = newSchool.id;
                log.info({ name, tenantId: session.tenantId }, 'School created.');
            }

            // --- Handle Academic Years, Terms, Departments, Grade Levels ---
            // For updates, you would typically delete existing and re-insert or compare and update.
            // For simplicity in this first iteration, we'll re-insert or create.
            // A more robust approach involves diffing and updating existing records.

            // Clear existing academic data if updating
            if (id) {
                await tx.delete(academicTerms).where(eq(academicTerms.academicYearId, db.query.academicYears.id)); // Need proper join
                await tx.delete(academicYears).where(eq(academicYears.schoolId, schoolId));
                await tx.delete(departments).where(eq(departments.schoolId, schoolId));
                await tx.delete(gradeLevels).where(eq(gradeLevels.schoolId, schoolId));
            }


            // Insert Academic Years and Terms
            for (const yearData of formAcademicYears) {
                const [newYear] = await tx.insert(academicYears).values({
                    schoolId,
                    yearName: yearData.yearName,
                    startDate: new Date(yearData.startDate),
                    endDate: new Date(yearData.endDate),
                    isCurrent: yearData.isCurrent,
                }).returning({ id: academicYears.id });

                for (const termData of yearData.terms) {
                    await tx.insert(academicTerms).values({
                        academicYearId: newYear.id,
                        termName: termData.termName,
                        startDate: new Date(termData.startDate),
                        endDate: new Date(termData.endDate),
                        isCurrent: termData.isCurrent,
                    });
                }
            }

            // Insert Departments
            await tx.insert(departments).values(formDepartments.map(dept => ({
                schoolId,
                name: dept.name,
                description: dept.description,
            })));

            // Insert Grade Levels
            await tx.insert(gradeLevels).values(formGradeLevels.map(grade => ({
                schoolId,
                name: grade.name,
                levelOrder: grade.levelOrder,
                description: grade.description,
            })));

        }); // End transaction

    } catch (error: unknown) {
        log.error({ error, tenantId: session.tenantId, userId: session.userId, data }, 'Failed to upsert school');
        if (isDatabaseError(error) && error.code === '23505') { // Unique constraint violation
            if (error.message.includes('schools_name_unique')) {
                return { success: false, message: "A school with this name already exists.", errors: { name: ["This school name is already in use."] } };
            }
            if (error.message.includes('academic_years_unq_school_year')) {
                return { success: false, message: "An academic year with this name already exists for this school.", errors: { academicYears: ["Duplicate academic year name."] } };
            }
            if (error.message.includes('academic_terms_unq_year_term')) {
                return { success: false, message: "An academic term with this name already exists for this year.", errors: { academicYears: ["Duplicate academic term name within a year."] } };
            }
            if (error.message.includes('departments_unq_school_dept')) {
                return { success: false, message: "A department with this name already exists for this school.", errors: { departments: ["Duplicate department name."] } };
            }
            if (error.message.includes('grade_levels_unq_school_grade') || error.message.includes('grade_levels_unq_school_order')) {
                return { success: false, message: "A grade level with this name or order already exists for this school.", errors: { gradeLevels: ["Duplicate grade level name or order."] } };
            }
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
        // Deleting a school will cascade delete its academic years, terms, departments, grade levels,
        // and potentially related usersToRoles entries.
        await db.delete(schools).where(eq(schools.id, schoolId));
        log.info({ schoolId, tenantId: session.tenantId }, 'School deleted.');
        revalidatePath('/dashboard/schools');
        return { success: true, message: "School deleted successfully." };
    } catch (error) {
        log.error({ error, schoolId, tenantId: session.tenantId }, 'Failed to delete school');
        return { success: false, message: "Failed to delete school." };
    }
}
