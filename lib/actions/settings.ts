'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';
import { getSession, enforcePermission } from '../session';
import { getTenantDb } from '../db';
import { users } from '../db/schema/tenant';
import { UpdateProfileSchema, UpdatePasswordSchema } from '../dto/settings';
import { logout } from './auth';

// Action to update the user's profile information
export async function updateProfileAction(data: unknown) {
    // No specific permission needed for a user to update their own profile
    // However, if we were allowing admins to update *other* users, we'd add 'user:update' here.
    const session = await getSession(); // Ensure user is authenticated
    const db = await getTenantDb(session.tenantId);

    const validatedFields = UpdateProfileSchema.safeParse(data);
    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), userId: session.userId }, "Invalid profile update data provided.");
        return { success: false, message: "Invalid data provided." };
    }

    const { name, email } = validatedFields.data;

    try {
        await db.update(users)
            .set({ name, email })
            .where(eq(users.id, session.userId));
        
        revalidatePath('/dashboard/settings');
        // If user's name/email is part of the session token, you might need to re-issue it or update context
        // For now, assume the session is re-fetched on subsequent requests or relevant UI updates.
        // TODO: Need more details on this
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
    // No specific permission needed for a user to update their own password
    const session = await getSession(); // Ensure user is authenticated
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
    // No specific permission needed for a user to delete their own account.
    // This is a self-service action.
    const session = await getSession(); // Ensure user is authenticated
    const db = await getTenantDb(session.tenantId);

    try {
        await db.delete(users).where(eq(users.id, session.userId));
        log.info({ userId: session.userId, tenantId: session.tenantId }, "User account deleted successfully.");
        // After deletion, log the user out and redirect
        await logout();
        return { success: true, message: "Your account has been deleted." };
    } catch (error) {
        log.error({ error, userId: session.userId, tenantId: session.tenantId }, "Failed to delete user account");
        return { success: false, message: "An unexpected error occurred." };
    }
}
