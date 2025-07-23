import { z } from 'zod';

export const RoleFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Role name must be at least 2 characters.' }),
  description: z.string().optional(),
});

export type RoleFormInput = z.infer<typeof RoleFormSchema>;