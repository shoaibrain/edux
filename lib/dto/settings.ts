import { z } from 'zod';

// Schema for updating the user's general profile information
export const UpdateProfileSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;


// Schema for updating the user's password
export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
});
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordSchema>;

// Schema for the danger zone account deletion
export const DeleteAccountSchema = z.object({
    confirm: z.string().refine((val) => val === 'delete my account', {
        message: "You must type 'delete my account' to confirm.",
    }),
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;