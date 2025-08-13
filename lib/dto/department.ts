// /lib/dto/department.ts

import { z } from 'zod';

/**
 * Schema for CREATING a single new department.
 * 'schoolId' is required to associate it with the correct school.
 */
export const CreateDepartmentSchema = z.object({
  schoolId: z.number(),
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
  description: z.string().optional(),
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;

/**
 * Schema for UPDATING a single existing department.
 * 'id' is required to identify the department to update.
 * All other fields are optional for partial updates.
 */
export const UpdateDepartmentSchema = z.object({
  id: z.number(),
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }).optional(),
  description: z.string().optional(),
});
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;

/**
 * Schema for DELETING a single department.
 * Requires the department 'id' for identification.
 */
export const DeleteDepartmentSchema = z.object({
  id: z.number(),
});
export type DeleteDepartmentInput = z.infer<typeof DeleteDepartmentSchema>;