import { z } from 'zod';

export const LocationFormSchema = z.object({
  id: z.number().optional(),
  schoolId: z.number(),
  name: z.string().min(2, { message: "Location name must be at least 2 characters." }),
  description: z.string().optional(),
});

export type LocationFormInput = z.infer<typeof LocationFormSchema>;