import { z } from 'zod';

export const UserFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().optional(),
  roles: z.array(z.string()).min(1, { message: 'At least one role must be selected.' }),
}).refine(data => {
    // If it's a new user (no id), password must be a string of at least 8 chars.
    if (!data.id) {
        return !!data.password && data.password.length >= 8;
    }
    // If it's an existing user and a password IS provided, it must be at least 8 chars.
    // If no password is provided for an existing user, it's valid (means no change).
    if (data.id && data.password) {
        return data.password.length >= 8;
    }
    return true;
}, {
    message: "Password must be at least 8 characters.",
    path: ["password"], // Point the error to the password field
});

export type UserFormInput = z.infer<typeof UserFormSchema>;