import { z } from 'zod';
import { personTypeEnum } from '@/lib/db/schema/tenant';

/**
 * @description Zod schema for validating the person form.
 * This schema is used to validate the data from the person form before it's sent to the server.
 * It ensures that all required fields are present and that the data is in the correct format.
 */
export const PersonFormSchema = z.object({
  id: z.number().optional(),
  schoolId: z.number().int({ message: "School ID must be an integer." }).nullable().optional(),
  firstName: z.string().min(1, 'First name is required.').max(100),
  lastName: z.string().min(1, 'Last name is required.').max(100),
  middleName: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  contactEmail: z.string().email('Invalid email address.').or(z.literal('')).nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  personType: z.enum(personTypeEnum.enumValues as Readonly<[string, ...string[]]>),
  profilePictureUrl: z.string().url('Invalid URL.').nullable().optional(),

  // Fields for optional user account creation/update
  createUserAccount: z.boolean().optional(),
  // FIX: Allow an empty string, as it's only required if createUserAccount is true.
  userEmail: z.string().email('Invalid email address.').or(z.literal('')).nullable().optional(),
  userPassword: z.string().min(8, 'Password must be at least 8 characters.').or(z.literal('')).nullable().optional(),
  userRoles: z.array(z.string()).nullable().optional(),

}).superRefine((data, ctx) => {
  if (data.createUserAccount) {
    if (!data.userEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'User email is required to create a user account.',
        path: ['userEmail'],
      });
    }
    // Password is required only when creating a new user account.
    if (!data.id && !data.userPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'User password is required to create a new user account.',
        path: ['userPassword'],
      });
    }
  }
});

export type PersonFormInput = z.infer<typeof PersonFormSchema>;
