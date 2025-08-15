import { z } from 'zod';
import { RRule } from 'rrule';

// Option types for dropdowns (string IDs for UI forms)
export type SelectOption = {
  id: string;
  name: string;
};

export type TeacherOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export type AcademicTermOption = {
  id: string;
  name: string; // e.g., "Fall 2025"
  yearName?: string; // e.g., "2025-2026"
  startDate?: string; // ISO date string to seed recurrence dtstart
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export type Prerequisites = {
  academicTerms: AcademicTermOption[];
  subjects: (SelectOption & { departmentId?: string | null })[];
  teachers: TeacherOption[];
  gradeLevels: SelectOption[];
  locations: SelectOption[];
  departments: DepartmentOption[];
};

// UI schema for the Class Period creation form (string IDs)
export const ClassPeriodFormSchema = z
  .object({
    id: z.string().optional(),
    schoolId: z.string(),
    name: z.string().min(1, 'Class name is required.'),
    academicTermId: z.string().min(1, 'Academic Term is required.'),
    subjectId: z.string().min(1, 'Subject is required.'),
    teacherId: z.string().min(1, 'Teacher is required.'),
    gradeLevelId: z.string().optional().nullable(),
    locationId: z.string().optional().nullable(),
    departmentId: z.string().min(1, 'Department is required.'),
    isRecurring: z.boolean().default(false),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm).'),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm).'),
    rrule: z.string().optional().nullable(),
  })
  .refine((data) => {
    if (data.isRecurring) {
      if (!data.rrule) return false;
      try {
        RRule.fromString(data.rrule);
        return true;
      } catch (e) {
        return false;
      }
    }
    return true;
  }, {
    message: 'A valid recurrence rule is required for recurring classes.',
    path: ['rrule'],
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time.',
    path: ['endTime'],
  });

export type ClassPeriodFormInput = z.infer<typeof ClassPeriodFormSchema>;