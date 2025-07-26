'use server';

import { getTenantDb } from '@/lib/db';
import { type UserFormInput } from '@/lib/dto/user'; 
import { users, usersToRoles, roles, people } from '@/lib/db/schema/tenant'; 
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import log from '../logger';
import { enforcePermission, hasPermission, getSession } from '../session'; 

function isDatabaseError(error: unknown): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export async function getUsersWithRoles() {
    await enforcePermission('user:read'); 
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    try {
        // Fetch users and eager load their associated person and roles
        const usersWithRoles = await db.query.users.findMany({
            with: {
                person: true, // Load associated person data
                usersToRoles: {
                    with: {
                        role: true
                    }
                }
            }
        });

        // Map to a more consumable format, including person's name
        return usersWithRoles.map(user => ({
           ...user,
            personName: user.person ? `${user.person.firstName} ${user.person.lastName}` : 'N/A',
            roles: user.usersToRoles.map(ur => ur.role.name).join(', ')
        }));
    } catch (error) {
        log.error({ error, tenantId: session.tenantId }, 'Failed to fetch users with roles.');
        throw new Error('Failed to retrieve users.');
    }
}

// This action is now primarily for managing an existing user record (email, password, roles).
// Direct creation of a user linked to a person should happen via upsertPersonAction.
export async function upsertUserAction(data: UserFormInput) {
    const session = await getSession();
    
    const requiredPermission = data.id ? 'user:update' : 'user:create'; 
    await enforcePermission(requiredPermission);

    if (data.roles && data.roles.length > 0) {
        const canAssignRoles = await hasPermission('user:assign_roles');
        if (!canAssignRoles) {
            log.warn({ userId: session.userId, tenantId: session.tenantId, attemptedRoles: data.roles }, 'User attempted to assign roles without permission.');
            return { success: false, message: 'You do not have permission to assign roles.' };
        }
    }

    const db = await getTenantDb(session.tenantId);

    // Note: 'name' field is no longer part of 'users' table. It's on 'people'.
    const { id, email, password, roles: roleIdsStr } = data; 
    const roleIds = roleIdsStr ? roleIdsStr.map(Number) : []; 
    
    try {
        await db.transaction(async (tx) => {
            if (id) { // Update existing user
                const userToUpdate: { email: string; password?: string } = { email };
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
                        roleId: roleId,
                        // schoolId: ?? // Decide how schoolId for role assignment is handled here if roles are school-scoped.
                    })));
                }
                log.info({ userId: id, email, tenantId: session.tenantId }, 'User updated.');

            } else { 
                log.warn({ tenantId: session.tenantId, email }, 'Attempted to create user without personId via upsertUserAction. This flow should be deprecated.');
                return { success: false, message: "User creation without a linked person is not allowed." };
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
    revalidatePath('/dashboard/users'); 
    return { success: true, message: `User successfully ${id ? 'updated' : 'created'}.` };
}

export async function deleteUserAction(userId: number) {
    await enforcePermission('user:delete'); 
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    if (userId === session.userId) {
        log.warn({ userId: session.userId, tenantId: session.tenantId }, 'Attempted to delete own account via user management. Denied.');
        return { success: false, message: "You cannot delete your own account from here. Use settings." };
    }

    try {
        // Deleting a user does NOT delete the associated person record.
        await db.delete(users).where(eq(users.id, userId));
        log.info({ userId, tenantId: session.tenantId }, 'User deleted.');
        revalidatePath('/dashboard/people');
        revalidatePath('/dashboard/users'); 
        return { success: true, message: "User deleted successfully." };
    } catch (error) {
        log.error({ error, userId, tenantId: session.tenantId }, 'Failed to delete user');
        return { success: false, message: "Failed to delete user." };
    }
}
