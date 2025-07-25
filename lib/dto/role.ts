import { z } from 'zod';

export const RoleFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Role name must be at least 2 characters.' }),
  description: z.string().optional(),
  // New: permissions is an array of strings (permission names) and is optional.
  // The server-side will map these names to IDs.
  permissions: z.array(z.string()).optional(), 
});

export type RoleFormInput = z.infer<typeof RoleFormSchema>;
