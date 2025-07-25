import { z } from 'zod';

export const SchoolFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, { message: 'School name must be at least 3 characters.' }).max(100),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: 'Invalid email address.' }).optional().nullable(),
  website: z.string().url({ message: 'Invalid URL.' }).optional().nullable(),
  logoUrl: z.string().url({ message: 'Invalid URL.' }).optional().nullable(),
  // Changed z.any() to z.unknown() for better type safety
  brandingJson: z.record(z.string(), z.unknown()).optional().nullable(), 
});

export type SchoolFormInput = z.infer<typeof SchoolFormSchema>;
