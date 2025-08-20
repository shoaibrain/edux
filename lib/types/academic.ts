export type AcademicEventType = 'ACADEMIC_YEAR' | 'ACADEMIC_TERM' | 'HOLIDAY' | 'EXAM_PERIOD' | 'BREAK_PERIOD';

export interface AcademicYear {
  id: string;
  yearName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  schoolId: string;
  terms: AcademicTerm[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicTerm {
  id: string;
  termName: string;
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  // ✅ Remove gradeLevels - they're not tied to terms
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicConstraint {
  id: string;
  name: string;
  description: string;
  constraintType: 'NO_CLASSES' | 'EXAM_ONLY' | 'BREAK_PERIOD' | 'CUSTOM';
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  termId?: string;
  gradeLevels?: string[];
  metadata: Record<string, unknown>;
}

export interface CreateAcademicYearOptions {
  yearName: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  schoolId: string;
  terms: Array<{
    termName: string;
    startDate: Date;
    endDate: Date;
    // ✅ Remove gradeLevels requirement
  }>;
  holidays?: Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
  }>;
  examPeriods?: Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
  }>;
}

export interface CreateAcademicTermOptions {
  termName: string;
  startDate: Date;
  endDate: Date;
  academicYearId: string;
  // ✅ Remove gradeLevels requirement
  isActive: boolean;
}

// Database DTOs - what we get from the database
export interface AcademicYearDB {
  id: number;
  yearName: string;
  startDate: string; // ISO date string from database
  endDate: string;   // ISO date string from database
  isCurrent: boolean | null;
  schoolId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicTermDB {
  id: number;
  termName: string;
  startDate: string; // ISO date string from database
  endDate: string;   // ISO date string from database
  academicYearId: number;
  // ✅ Remove gradeLevels field
  isActive: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to transform DB data to frontend types
export function transformAcademicYearFromDB(dbYear: AcademicYearDB, terms: AcademicTerm[]): AcademicYear {
  return {
    id: dbYear.id.toString(),
    yearName: dbYear.yearName,
    startDate: new Date(dbYear.startDate),
    endDate: new Date(dbYear.endDate),
    isCurrent: dbYear.isCurrent ?? false, // Convert null to false
    schoolId: dbYear.schoolId.toString(),
    terms: terms,
    createdAt: dbYear.createdAt,
    updatedAt: dbYear.updatedAt,
  };
}

export function transformAcademicTermFromDB(dbTerm: AcademicTermDB): AcademicTerm {
  return {
    id: dbTerm.id.toString(),
    termName: dbTerm.termName,
    startDate: new Date(dbTerm.startDate),
    endDate: new Date(dbTerm.endDate),
    academicYearId: dbTerm.academicYearId.toString(),
    // ✅ Remove gradeLevels mapping
    isActive: dbTerm.isActive ?? true,
    createdAt: dbTerm.createdAt,
    updatedAt: dbTerm.updatedAt,
  };
}

export interface AcademicYearUpdateData {
  yearName?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  updatedAt?: Date;
}

export interface AcademicTermUpdateData {
  termName?: string;
  startDate?: string;
  endDate?: string;
  gradeLevels?: string[];
  isActive?: boolean;
  updatedAt?: Date;
}
