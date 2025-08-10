import { z } from 'zod';
import { personTypeEnum } from '@/lib/db/schema/tenant'; // Import the Drizzle enum

export const PersonFormSchema = z.object({
  id: z.number().optional(),
  // schoolId is nullable in DB, so Zod should reflect that. Add .nullable().optional()
  // .int() ensures it's an integer.
  schoolId: z.number().int({ message: "School ID must be an integer." }).nullable().optional(),
  firstName: z.string().min(1, 'First name is required.').max(100),
  lastName: z.string().min(1, 'Last name is required.').max(100),
  middleName: z.string().nullable().optional(), // Added .optional() for consistency with DB schema
  dateOfBirth: z.string().nullable().optional(), // Added .optional()
  gender: z.string().nullable().optional(), // Added .optional()
  contactEmail: z.email('Invalid email address.').nullable().optional(), // Added .optional()
  contactPhone: z.string().nullable().optional(), // Added .optional()
  address: z.string().nullable().optional(), // Added .optional()
  
  // Definitive fix for personType:
  // 1. Cast personTypeEnum.enumValues to a tuple type for z.enum() to ensure correct overload.
  // 2. Remove `required_error` from the options object, as it's not valid here.
  personType: z.enum(personTypeEnum.enumValues as Readonly<[string, ...string[]]>),

  profilePictureUrl: z.string().url('Invalid URL.').nullable().optional(), // Added .optional()

  // Fields for optional user account creation/update
  createUserAccount: z.boolean().default(false), // .optional() is redundant with .default()
  userEmail: z.string().email('Invalid email address.').nullable().optional(), // Added .optional()

  // IMPROVEMENT: Explicitly allow an empty string to pass validation, matching your form's logic.
  // .nullable().optional() ensures it matches the DB schema if it can be null.
  userPassword: z.string().min(8, 'Password must be at least 8 characters.').or(z.literal('')).nullable().optional(),
  
  userRoles: z.array(z.string()).nullable().optional(), // Added .optional() for consistency.

}).superRefine((data, ctx) => {
  // This conditional validation is great and remains unchanged.
  if (data.createUserAccount) {
    if (!data.userEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'User email is required to create a user account.',
        path: ['userEmail'],
      });
    }
    // Password is required for new users. An empty string is not a valid password.
    if (!data.userPassword && !data.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'User password is required to create a new user account.',
        path: ['userPassword'],
      });
    }
  }
});

// This remains the same, ensuring your type is always in sync with the schema.
export type PersonFormInput = z.infer<typeof PersonFormSchema>;
