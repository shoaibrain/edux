import { z } from 'zod';
import { RRule } from 'rrule';

// Base schema for a class, used for both creation and updates.
export const ClassFormSchema = z.object({
  id: z.number().optional(),
  schoolId: z.number(),
  name: z.string().min(1, "Class name is required."),
  academicTermId: z.number().min(1, "Academic Term is required."),
  subjectId: z.number().min(1, "Subject is required."),
  teacherId: z.number().min(1, "Teacher is required."),
  gradeLevelId: z.number().optional().nullable(),
  locationId: z.number().optional().nullable(),
  isRecurring: z.boolean(), // Remove .default(false) and make it required
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
  rrule: z.string().optional().nullable(),
}).refine(data => {
  // If recurring, RRULE string must be present and valid
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
  message: "A valid recurrence rule is required for recurring classes.",
  path: ["rrule"],
}).refine(data => {
    // End time must be after start time
    return data.endTime > data.startTime;
}, {
    message: "End time must be after start time.",
    path: ["endTime"],
});

// Infer the TypeScript type from the Zod schema for use in the form component.
export type ClassFormInput = z.infer<typeof ClassFormSchema>;

// This type can be used for the payload sent to the server action,
// allowing for any transformations if needed.
export type UpsertClassPayload = ClassFormInput;

// Add this type definition
export type Prerequisites = {
  academicTerms: Array<{
    id: number;
    termName: string;
    yearName: string;
    startDate: string; // Change from Date to string
  }>;
  subjects: Array<{
    id: number;
    name: string;
  }>;
  teachers: Array<{
    id: number;
    firstName: string;
    lastName: string;
  }>;
  gradeLevels: Array<{
    id: number;
    name: string;
  }>;
  locations: Array<{
    id: number;
    name: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
  }>;
};