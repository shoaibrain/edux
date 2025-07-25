'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import { getTenantDb } from '@/lib/db';
import { UserFormSchema, type UserFormInput } from '@/lib/dto/user';
import { users, usersToRoles, roles } from '@/lib/db/schema/tenant'; // Import roles for joining
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';
import { enforcePermission, getSession, hasPermission, UserSession } from '../session'; // Import enforcePermission and UserSession

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

// The getSession function is now imported from lib/session directly.
// No need to redefine it here.

export async function getUsersWithRoles() {
    await enforcePermission('user:read'); // Enforce permission to read users
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    try {
        const usersWithRoles = await db.query.users.findMany({
            with: {
                usersToRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        return usersWithRoles.map(user => ({
           ...user,
            roles: user.usersToRoles.map(ur => ur.role.name).join(', ')
        }));
    } catch (error) {
        log.error({ error, tenantId: session.tenantId }, 'Failed to fetch users with roles.');
        throw new Error('Failed to retrieve users.');
    }
}

export async function upsertUserAction(data: UserFormInput) {
    const session = await getSession();
    
    // Determine required permission based on whether it's a new user or update
    const requiredPermission = data.id ? 'user:update' : 'user:create';
    await enforcePermission(requiredPermission);

    // Additionally, check if the user is attempting to assign roles without permission
    if (data.roles && data.roles.length > 0) {
        const canAssignRoles = await hasPermission('user:assign_roles');
        if (!canAssignRoles) {
            log.warn({ userId: session.userId, tenantId: session.tenantId, attemptedRoles: data.roles }, 'User attempted to assign roles without permission.');
            return { success: false, message: 'You do not have permission to assign roles.' };
        }
    }

    const db = await getTenantDb(session.tenantId);

    const { id, name, email, password, roles: roleIdsStr } = data;
    const roleIds = roleIdsStr.map(Number);
    
    try {
        await db.transaction(async (tx) => {
            if (id) { // Update existing user
                const userToUpdate: { name: string; email: string; password?: string } = { name, email };
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 12);
                    userToUpdate.password = hashedPassword;
                }
                
                await tx.update(users).set(userToUpdate).where(eq(users.id, id));
                
                // Update user roles
                await tx.delete(usersToRoles).where(eq(usersToRoles.userId, id));
                if (roleIds.length > 0) {
                    await tx.insert(usersToRoles).values(roleIds.map(roleId => ({
                        userId: id,
                        roleId: roleId
                    })));
                }

            } else { // Create new user
                if (!password) {
                    log.error({ tenantId: session.tenantId, email }, 'Password missing for new user creation.');
                    throw new Error("Password is required for new users.");
                }
                
                const hashedPassword = await bcrypt.hash(password, 12);
                
                const [newUser] = await tx.insert(users).values({
                    name,
                    email,
                    password: hashedPassword,
                }).returning({ id: users.id });

                if (roleIds.length > 0) {
                    await tx.insert(usersToRoles).values(roleIds.map(roleId => ({
                        userId: newUser.id,
                        roleId: roleId
                    })));
                }
            }
        });
    } catch (error: unknown) {
        log.error({ error, tenantId: session.tenantId, userId: session.userId, data }, 'Failed to upsert user');
        if (isDatabaseError(error) && error.code === '23505') {
            return { 
                success: false, 
                message: "A user with this email already exists.",
                errors: { email: ["This email is already in use."] }
            };
        }
        return { success: false, message: "An unexpected error occurred while saving user." };
    }

    revalidatePath('/dashboard/people');
    // Revalidate roles page as well, in case a user's role assignment affects role display (e.g., role usage counts)
    revalidatePath('/dashboard/roles'); 
    return { success: true, message: `User successfully ${id ? 'updated' : 'created'}.` };
}

export async function deleteUserAction(userId: number) {
    await enforcePermission('user:delete'); // Enforce permission to delete users
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    if (userId === session.userId) {
        log.warn({ userId: session.userId, tenantId: session.tenantId }, 'Attempted to delete own account via user management. Denied.');
        return { success: false, message: "You cannot delete your own account from here. Use settings." };
    }

    try {
        await db.delete(users).where(eq(users.id, userId));
        revalidatePath('/dashboard/people');
        return { success: true, message: "User deleted successfully." };
    } catch (error) {
        log.error({ error, userId, tenantId: session.tenantId }, 'Failed to delete user');
        return { success: false, message: "Failed to delete user." };
    }
}