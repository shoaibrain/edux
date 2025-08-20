import { SchedulerService } from './scheduler.service';
import { 
  AcademicYear, 
  AcademicTerm, 
  AcademicConstraint,
  CreateAcademicYearOptions,
  CreateAcademicTermOptions 
} from '../../types/academic';
import { v4 as uuidv4 } from 'uuid';
import log from '@/lib/logger';

export class AcademicSchedulerService {
  private schedulerService: SchedulerService;
  private academicYears: Map<number, AcademicYear> = new Map(); // ✅ Use number keys
  private academicTerms: Map<number, AcademicTerm> = new Map(); // ✅ Use number keys
  private academicConstraints: Map<string, AcademicConstraint> = new Map();
  private schoolId: string; // ✅ Add school ID to the service

  constructor(schoolId: string) {
    this.schedulerService = new SchedulerService();
    this.schoolId = schoolId;
  }

  // ✅ Add this method to create scheduler events
  async createSchedulerEvent(data: {
    id: number;
    type: 'ACADEMIC_YEAR' | 'ACADEMIC_TERM';
    title: string;
    startDate: Date;
    endDate: Date;
    metadata: Record<string, unknown>;
  }): Promise<void> {
    await this.schedulerService.createEvent({
      title: data.title,
      description: `${data.type} from ${data.startDate.toDateString()} to ${data.endDate.toDateString()}`,
      startTime: data.startDate,
      endTime: data.endDate,
      eventType: data.type === 'ACADEMIC_YEAR' ? 'ACADEMIC_YEAR' : 'ACADEMIC_TERM',
      timezone: 'UTC',
      maxAttendees: undefined,
      requiresRegistration: false,
      metadata: {
        ...data.metadata,
        id: data.id,
        type: data.type,
      },
      createdBy: 'system',
      tenantId: this.schoolId,
    });
  }

  /**
   * Create a complete academic year with terms, holidays, and constraints
   */
  async createAcademicYear(options: CreateAcademicYearOptions): Promise<AcademicYear> {
    try {
      // ✅ Let the database generate the ID
      const academicYear: Omit<AcademicYear, 'id'> = {
        yearName: options.yearName,
        startDate: options.startDate,
        endDate: options.endDate,
        isCurrent: options.isCurrent,
        schoolId: options.schoolId,
        terms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // ✅ Create scheduler event after database insert
      // (We'll do this in the calling function)

      return academicYear as AcademicYear;
    } catch (error) {
      log.error(`Failed to create academic year: ${error}`);
      throw error;
    }
  }

  /**
   * Create an academic term within an academic year
   */
  async createAcademicTerm(options: CreateAcademicTermOptions): Promise<AcademicTerm> {
    try {
      // ✅ Fix the type mismatch - convert string to number
      const academicYearId = parseInt(options.academicYearId);
      
      const academicTerm: Omit<AcademicTerm, 'id'> = {
        termName: options.termName,
        startDate: options.startDate,
        endDate: options.endDate,
        academicYearId: options.academicYearId, // Keep as string for interface compatibility
        isActive: options.isActive,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return academicTerm as AcademicTerm;
    } catch (error) {
      log.error(`Failed to create academic term: ${error}`);
      throw error;
    }
  }

  /**
   * Validate class period within academic constraints
   */
  async validateClassPeriodWithinAcademicYear(
    classPeriod: {
      startTime: Date;
      endTime: Date;
      // ✅ Remove gradeLevels - they're not tied to terms
    },
    academicYearId: string
  ): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    const result = { isValid: true, errors: [] as string[], warnings: [] as string[] };
    
    try {
      const academicYear = this.academicYears.get(academicYearId);
      if (!academicYear) {
        result.errors.push('Academic year not found');
        result.isValid = false;
        return result;
      }

      // Check if class period fits within academic year
      if (classPeriod.startTime < academicYear.startDate || classPeriod.endTime > academicYear.endDate) {
        result.errors.push('Class period must be within academic year boundaries');
        result.isValid = false;
      }

      // Check if class period fits within any active term
      const activeTerms = academicYear.terms.filter(term => term.isActive);
      const fitsInTerm = activeTerms.some(term => 
        classPeriod.startTime >= term.startDate && classPeriod.endTime <= term.endDate
      );

      if (!fitsInTerm) {
        result.errors.push('Class period must be within an active academic term');
        result.isValid = false;
      }

      // Check for holiday/exam period conflicts
      const conflicts = await this.checkAcademicConstraintConflicts(classPeriod, academicYearId);
      if (conflicts.length > 0) {
        result.errors.push(...conflicts.map(c => c.message));
        result.isValid = false;
      }

      // Check business hours (warning only)
      const startHour = classPeriod.startTime.getHours();
      const endHour = classPeriod.endTime.getHours();
      if (startHour < 8 || endHour > 18) {
        result.warnings.push('Class period is outside standard business hours (8 AM - 6 PM)');
      }

      return result;

    } catch (error) {
      log.error(`Error validating class period | ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}`);
      result.errors.push('Error during validation');
      result.isValid = false;
      return result;
    }
  }

  /**
   * Get current academic year for a school
   */
  async getCurrentAcademicYear(schoolId: string): Promise<AcademicYear | null> {
    return Array.from(this.academicYears.values()).find(year => 
      year.schoolId === schoolId && year.isCurrent
    ) || null;
  }

  /**
   * Get active terms for an academic year
   */
  async getActiveTerms(academicYearId: string): Promise<AcademicTerm[]> {
    return Array.from(this.academicTerms.values()).filter(term => 
      term.academicYearId === academicYearId && term.isActive
    );
  }

  // Private helper methods
  private validateAcademicYearData(options: CreateAcademicYearOptions): void {
    if (!options.yearName.trim()) {
      throw new Error('Academic year name is required');
    }

    if (options.startDate >= options.endDate) {
      throw new Error('Start date must be before end date');
    }

    if (options.terms.length === 0) {
      throw new Error('At least one term is required');
    }

    // Validate term dates
    for (const term of options.terms) {
      if (term.startDate < options.startDate || term.endDate > options.endDate) {
        throw new Error('Term dates must be within academic year boundaries');
      }
    }
  }

  private validateAcademicTermData(options: CreateAcademicTermOptions): void {
    if (!options.termName?.trim()) {
      throw new Error('Term name is required');
    }

    if (!options.startDate || !options.endDate) {
      throw new Error('Start and end dates are required');
    }

    if (options.startDate >= options.endDate) {
      throw new Error('Start date must be before end date');
    }

    // ✅ Remove grade level validation - not required for terms
    // Grade levels are school-wide entities, not term-specific
  }

  private async checkAcademicYearConflicts(options: CreateAcademicYearOptions): Promise<Array<{type: string; message: string; severity: string}>> {
    const conflicts: Array<{type: string; message: string; severity: string}> = [];

    // Check for overlapping academic years
    const overlappingYears = Array.from(this.academicYears.values()).filter(year => 
      year.schoolId === options.schoolId &&
      this.hasTimeOverlap(options.startDate, options.endDate, year.startDate, year.endDate)
    );

    if (overlappingYears.length > 0) {
      conflicts.push({
        type: 'OVERLAP',
        message: `Academic year overlaps with existing year: ${overlappingYears[0].yearName}`,
        severity: 'ERROR'
      });
    }

    return conflicts;
  }

  private hasTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
    return start1 < end2 && start2 < end1;
  }

  private async deactivateOtherCurrentYears(schoolId: string): Promise<void> {
    Array.from(this.academicYears.values())
      .filter(year => year.schoolId === schoolId && year.isCurrent)
      .forEach(year => {
        year.isCurrent = false;
        year.updatedAt = new Date();
      });
  }

  private async createHolidayEvents(holidays: Array<{name: string; startDate: Date; endDate: Date; description?: string}>, academicYearId: string, schoolId: string): Promise<void> {
    for (const holiday of holidays) {
      await this.schedulerService.createEvent({
        title: holiday.name,
        description: holiday.description || `Holiday: ${holiday.name}`,
        startTime: holiday.startDate,
        endTime: holiday.endDate,
        eventType: 'HOLIDAY',
        timezone: 'UTC',
        maxAttendees: undefined,
        requiresRegistration: false,
        metadata: {
          academicYearId,
          type: 'HOLIDAY',
          holidayName: holiday.name
        },
        createdBy: 'system',
        tenantId: schoolId,
      });
    }
  }

  private async createExamPeriodEvents(examPeriods: Array<{name: string; startDate: Date; endDate: Date; description?: string}>, academicYearId: string, schoolId: string): Promise<void> {
    for (const examPeriod of examPeriods) {
      await this.schedulerService.createEvent({
        title: examPeriod.name,
        description: examPeriod.description || `Exam Period: ${examPeriod.name}`,
        startTime: examPeriod.startDate,
        endTime: examPeriod.endDate,
        eventType: 'EXAM_PERIOD',
        timezone: 'UTC',
        maxAttendees: undefined,
        requiresRegistration: false,
        metadata: {
          academicYearId,
          type: 'EXAM_PERIOD',
          examPeriodName: examPeriod.name
        },
        createdBy: 'system',
        tenantId: schoolId,
      });
    }
  }

  private async checkAcademicConstraintConflicts(classPeriod: {startTime: Date; endTime: Date}, academicYearId: string): Promise<Array<{message: string}>> {
    // Implementation for checking holiday/exam period conflicts
    // This would check against the events created for holidays and exam periods
    return [];
  }
}
