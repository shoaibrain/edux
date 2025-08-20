"use server";

import { getTenantDb } from "@/lib/db";
import { academicYears, academicTerms } from "@/lib/db/schema/tenant";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  AcademicYear, 
  AcademicTerm, 
  CreateAcademicYearOptions,
  CreateAcademicTermOptions,
  transformAcademicYearFromDB,
  transformAcademicTermFromDB,
  AcademicYearDB,
  AcademicTermDB
} from "@/lib/types/academic";
import { AcademicSchedulerService } from "@/lib/services/scheduler/academic-scheduler.service";
import { AcademicYearUpdateData, AcademicTermUpdateData } from '@/lib/types/academic';

/**
 * Get tenant ID from school ID using the tenant context
 */
async function getTenantIdFromSchoolId(schoolId: string, tenantId: string): Promise<string> {
  // Since we're already in the tenant context, we can use the tenantId directly
  // The schoolId is used to identify which school within the tenant
  return tenantId;
}

/**
 * Get all academic years for a school
 */
export async function getAcademicYears(schoolId: string, tenantId: string): Promise<AcademicYear[]> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    const dbYears = await tenantDb
      .select()
      .from(academicYears)
      .where(eq(academicYears.schoolId, parseInt(schoolId)))
      .orderBy(desc(academicYears.startDate));

    const result: AcademicYear[] = [];

    for (const dbYear of dbYears) {
      // Get terms for this academic year
      const dbTerms = await tenantDb
        .select()
        .from(academicTerms)
        .where(eq(academicTerms.academicYearId, dbYear.id));

      const terms = dbTerms.map(transformAcademicTermFromDB);
      const academicYear = transformAcademicYearFromDB(dbYear, terms);
      result.push(academicYear);
    }

    return result;
  } catch (error) {
    console.error("Error fetching academic years:", error);
    throw new Error("Failed to fetch academic years");
  }
}

/**
 * Get current academic year for a school
 */
export async function getCurrentAcademicYear(schoolId: string, tenantId: string): Promise<AcademicYear | null> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    const dbYear = await tenantDb
      .select()
      .from(academicYears)
      .where(
        and(
          eq(academicYears.schoolId, parseInt(schoolId)),
          eq(academicYears.isCurrent, true)
        )
      )
      .limit(1);

    if (dbYear.length === 0) return null;

    const year = dbYear[0];
    
    // Get terms for this academic year
    const dbTerms = await tenantDb
      .select()
      .from(academicTerms)
      .where(eq(academicTerms.academicYearId, year.id));

    const terms = dbTerms.map(transformAcademicTermFromDB);
    return transformAcademicYearFromDB(year, terms);
  } catch (error) {
    console.error("Error fetching current academic year:", error);
    throw new Error("Failed to fetch current academic year");
  }
}

/**
 * Create a new academic year with terms
 */
export async function createAcademicYear(options: CreateAcademicYearOptions, tenantId: string): Promise<{ success: boolean; data?: AcademicYear; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);
    const academicScheduler = new AcademicSchedulerService(options.schoolId);
    
    // ✅ Create academic year object (without ID)
    const academicYearData = await academicScheduler.createAcademicYear(options);

    // ✅ Insert to database and get the generated ID
    const [dbYear] = await tenantDb.insert(academicYears).values({
      yearName: academicYearData.yearName,
      startDate: academicYearData.startDate.toISOString().split('T')[0],
      endDate: academicYearData.endDate.toISOString().split('T')[0],
      isCurrent: academicYearData.isCurrent,
      schoolId: parseInt(academicYearData.schoolId),
      createdAt: academicYearData.createdAt,
      updatedAt: academicYearData.updatedAt,
    }).returning();

    // ✅ Create scheduler event with database ID
    await academicScheduler.createSchedulerEvent({
      id: dbYear.id,
      type: 'ACADEMIC_YEAR',
      title: `Academic Year: ${academicYearData.yearName}`,
      startDate: academicYearData.startDate,
      endDate: academicYearData.endDate,
      metadata: {
        yearName: academicYearData.yearName,
        isCurrent: academicYearData.isCurrent,
      },
    });

    // ✅ Create terms with correct database ID
    for (const termData of options.terms) {
      const term = await academicScheduler.createAcademicTerm({
        ...termData,
        academicYearId: dbYear.id.toString(),
        isActive: true,
      });

      const [dbTerm] = await tenantDb.insert(academicTerms).values({
        termName: term.termName,
        startDate: term.startDate.toISOString().split('T')[0],
        endDate: term.endDate.toISOString().split('T')[0],
        academicYearId: dbYear.id, // ✅ Direct database ID reference
        isActive: term.isActive,
        createdAt: term.createdAt,
        updatedAt: term.updatedAt,
      }).returning();

      // ✅ Create scheduler event for term
      await academicScheduler.createSchedulerEvent({
        id: dbTerm.id,
        type: 'ACADEMIC_TERM',
        title: `Term: ${term.termName}`,
        startDate: term.startDate,
        endDate: term.endDate,
        metadata: {
          termName: term.termName,
          academicYearId: dbYear.id,
          isActive: term.isActive,
        },
      });
    }

    revalidatePath(`/dashboard/schools/${options.schoolId}/settings`);
    
    return { success: true, data: { ...academicYearData, id: dbYear.id.toString() } };
  } catch (error) {
    console.error("Error creating academic year:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create academic year" 
    };
  }
}

/**
 * Update an academic year
 */
export async function updateAcademicYear(
  id: string, 
  updates: Partial<AcademicYear>,
  schoolId: string,
  tenantId: string
): Promise<{ success: boolean; data?: AcademicYear; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    // ✅ Properly typed update data
    const updateData: AcademicYearUpdateData = {};
    
    if (updates.yearName) updateData.yearName = updates.yearName;
    if (updates.startDate) updateData.startDate = updates.startDate.toISOString().split('T')[0];
    if (updates.endDate) updateData.endDate = updates.endDate.toISOString().split('T')[0];
    if (updates.isCurrent !== undefined) updateData.isCurrent = updates.isCurrent;
    if (updates.updatedAt) updateData.updatedAt = new Date();

    await tenantDb
      .update(academicYears)
      .set(updateData)
      .where(eq(academicYears.id, parseInt(id)));

    revalidatePath(`/dashboard/schools/${schoolId}/settings`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating academic year:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update academic year" 
    };
  }
}

/**
 * Delete an academic year
 */
export async function deleteAcademicYear(id: string, schoolId: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    // Delete terms first (due to foreign key constraint)
    await tenantDb.delete(academicTerms).where(eq(academicTerms.academicYearId, parseInt(id)));
    
    // Delete the academic year
    await tenantDb.delete(academicYears).where(eq(academicYears.id, parseInt(id)));

    revalidatePath(`/dashboard/schools/${schoolId}/settings`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting academic year:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete academic year" 
    };
  }
}

/**
 * Create a new academic term
 */
export async function createAcademicTerm(options: CreateAcademicTermOptions, tenantId: string): Promise<{ success: boolean; data?: AcademicTerm; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    // ✅ Get schoolId from the academic year that this term belongs to
    const academicYear = await tenantDb
      .select({ schoolId: academicYears.schoolId })
      .from(academicYears)
      .where(eq(academicYears.id, parseInt(options.academicYearId)))
      .limit(1);

    if (academicYear.length === 0) {
      throw new Error('Academic year not found');
    }

    const academicScheduler = new AcademicSchedulerService(academicYear[0].schoolId.toString());
    const term = await academicScheduler.createAcademicTerm(options);

    // Persist to tenant database
    await tenantDb.insert(academicTerms).values({
      termName: term.termName,
      startDate: term.startDate.toISOString().split('T')[0],
      endDate: term.endDate.toISOString().split('T')[0],
      academicYearId: parseInt(term.academicYearId),
      isActive: term.isActive,
      createdAt: term.createdAt,
      updatedAt: term.updatedAt,
    });

    return { success: true, data: term };
  } catch (error) {
    console.error("Error creating academic term:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create academic term" 
    };
  }
}

/**
 * Update an academic term
 */
export async function updateAcademicTerm(
  id: string, 
  updates: Partial<AcademicTerm>,
  schoolId: string,
  tenantId: string
): Promise<{ success: boolean; data?: AcademicTerm; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    // ✅ Properly typed update data
    const updateData: AcademicTermUpdateData = {};
    
    if (updates.termName) updateData.termName = updates.termName;
    if (updates.startDate) updateData.startDate = updates.startDate.toISOString().split('T')[0];
    if (updates.endDate) updateData.endDate = updates.endDate.toISOString().split('T')[0];
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.updatedAt) updateData.updatedAt = new Date();

    await tenantDb
      .update(academicTerms)
      .set(updateData)
      .where(eq(academicTerms.id, parseInt(id)));

    return { success: true };
  } catch (error) {
    console.error("Error updating academic term:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update academic term" 
    };
  }
}

/**
 * Delete an academic term
 */
export async function deleteAcademicTerm(id: string, schoolId: string, tenantId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tenantDb = await getTenantDb(tenantId);

    await tenantDb.delete(academicTerms).where(eq(academicTerms.id, parseInt(id)));
    return { success: true };
  } catch (error) {
    console.error("Error deleting academic term:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete academic term" 
    };
  }
}
