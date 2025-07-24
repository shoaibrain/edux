'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';
import { getSession } from '../session';
import { getTenantDb } from '../db';
import { users } from '../db/schema/tenant';
import { UpdateProfileSchema, UpdatePasswordSchema } from '../dto/settings';
import { logout } from './auth';

// Action to update the user's profile information
export async function updateProfileAction(data: unknown) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const validatedFields = UpdateProfileSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: "Invalid data provided." };
    }

    const { name, email } = validatedFields.data;

    try {
        await db.update(users)
            .set({ name, email })
            .where(eq(users.id, session.userId));
        
        revalidatePath('/dashboard/settings');
        return { success: true, message: "Profile updated successfully." };

    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === '23505') {
            return { success: false, message: "This email is already in use by another account." };
        }
        log.error({ error }, "Failed to update user profile");
        return { success: false, message: "An unexpected error occurred." };
    }
}

// Action to update the user's password
export async function updatePasswordAction(data: unknown) {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    const validatedFields = UpdatePasswordSchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: "Invalid data provided." };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    try {
        const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
        if (!user) {
            return { success: false, message: "User not found." };
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return { success: false, message: "The current password you entered is incorrect." };
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);
        await db.update(users)
            .set({ password: hashedNewPassword })
            .where(eq(users.id, session.userId));

        return { success: true, message: "Password updated successfully." };

    } catch (error) {
        log.error({ error }, "Failed to update user password");
        return { success: false, message: "An unexpected error occurred." };
    }
}

// Action to delete the user's own account
export async function deleteAccountAction() {
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        await db.delete(users).where(eq(users.id, session.userId));
        // After deletion, log the user out and redirect
        await logout();
        return { success: true, message: "Your account has been deleted." };
    } catch (error) {
        log.error({ error, userId: session.userId }, "Failed to delete user account");
        return { success: false, message: "An unexpected error occurred." };
    }
}