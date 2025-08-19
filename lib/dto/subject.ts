import { z } from 'zod';

export const SubjectFormSchema = z.object({
  id: z.number().optional(),
  schoolId: z.number(),
  name: z.string().min(1, "Subject name is required."),
  subjectCode: z.string().optional(),
  departmentId: z.number().min(1, "Department is required."),
});

export type SubjectFormInput = z.infer<typeof SubjectFormSchema>;