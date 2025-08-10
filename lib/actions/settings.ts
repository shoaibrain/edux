'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '@/lib/logger';
import { getSession } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { users, people } from '@/lib/db/schema/tenant';
import { UpdateProfileSchema, UpdatePasswordSchema } from '@/lib/dto/settings';
import { logout } from '@/lib/actions/auth';

// Action to update the user's profile information
export async function updateProfileAction(data: unknown) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const validatedFields = UpdateProfileSchema.safeParse(data);
    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), userId: session.userId }, "Invalid profile update data provided.");
        return { success: false, message: "Invalid data provided." };
    }

    const { name, email } = validatedFields.data; // 'name' is from the form, will update person's firstName

    try {
        await db.transaction(async (tx) => {
            // Update user's email
            await tx.update(users)
                .set({ email })
                .where(eq(users.id, session.userId));

            // Update person's name (linked to user)
            // First, find the user's associated personId
            const user = await tx.query.users.findFirst({ where: eq(users.id, session.userId) });
            if (user && user.personId) {
                // Assuming 'name' in UpdateProfileSchema is the person's first name for simplicity.
                // In a real application, you'd have separate firstName/lastName fields in the DTO.
                await tx.update(people)
                    .set({ firstName: name })
                    .where(eq(people.id, user.personId));
            } else {
                log.warn({ userId: session.userId }, "User has no associated person record during profile update.");
            }
        });

        revalidatePath('/dashboard/settings');
        return { success: true, message: "Profile updated successfully." };

    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === '23505') {
            log.warn({ error, email, userId: session.userId }, "Email already in use during profile update.");
            return { success: false, message: "This email is already in use by another account." };
        }
        log.error({ error, userId: session.userId }, "Failed to update user profile");
        return { success: false, message: "An unexpected error occurred." };
    }
}

// Action to update the user's password
export async function updatePasswordAction(data: unknown) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const validatedFields = UpdatePasswordSchema.safeParse(data);
    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), userId: session.userId }, "Invalid password update data provided.");
        return { success: false, message: "Invalid data provided." };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
        if (!user) {
            log.error({ userId: session.userId, tenantId: session.tenantId }, "User not found for password update.");
            return { success: false, message: "User not found." };
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            log.warn({ userId: session.userId }, "Invalid current password provided during password update.");
            return { success: false, message: "The current password you entered is incorrect." };
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await db.update(users)
            .set({ password: hashedNewPassword })
            .where(eq(users.id, session.userId));

        log.info({ userId: session.userId }, "Password updated successfully.");
        return { success: true, message: "Password updated successfully." };

    } catch (error) {
        log.error({ error, userId: session.userId }, "Failed to update user password");
        return { success: false, message: "An unexpected error occurred." };
    }
}

// Action to delete the user's own account
export async function deleteAccountAction() {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        // Deleting the user account should NOT delete the person record.
        // The person record might still be needed for historical data (e.g., student records).
        await db.delete(users).where(eq(users.id, session.userId));
        log.info({ userId: session.userId, tenantId: session.tenantId }, "User account deleted successfully.");
        await logout();
        return { success: true, message: "Your account has been deleted." };
    } catch (error) {
        log.error({ error, userId: session.userId, tenantId: session.tenantId }, "Failed to delete user account");
        return { success: false, message: "An unexpected error occurred." };
    }
}
