import { z } from 'zod';

export const SubjectFormSchema = z.object({
  id: z.number().optional(),
  schoolId: z.number(),
  name: z.string().min(2, { message: "Subject name must be at least 2 characters." }),
  subjectCode: z.string().optional(),
  departmentId: z.coerce.number()
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Please select a department.'
    }),
});

export type SubjectFormInput = z.infer<typeof SubjectFormSchema>;