'use server';

import { cookies } from 'next/headers'; // Keep if used elsewhere, otherwise remove
import { redirect } from 'next/navigation'; // Keep if used elsewhere, otherwise remove
import { verify } from 'jsonwebtoken'; // Keep if used elsewhere, otherwise remove
import { env } from '@/env.mjs'; // Keep if used elsewhere, otherwise remove
import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import log from '../logger';
import { roles, permissions, rolesToPermissions, usersToRoles } from '../db/schema/tenant'; 
import { RoleFormSchema } from '../dto/role';
import { enforcePermission, hasPermission, UserSession, getSession } from '../session'; 

export async function getRoles() {
    await enforcePermission('role:read'); // Enforce permission to read roles
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);
    
    try {
        // Fetch roles with their associated permissions
        const rolesWithPermissions = await db.query.roles.findMany({
            with: {
                rolesToPermissions: { 
                    with: {
                        permission: true, // Eagerly load the full permission object
                    },
                },
            },
        });

        // Format the output to include the full permission objects directly in the 'permissions' array.
        return rolesWithPermissions.map(role => ({
            ...role,
            // Map `rolesToPermissions` to an array of `permission` objects
            permissions: role.rolesToPermissions.map(rtp => rtp.permission), 
        }));
    } catch (error) {
        log.error({ error, tenantId: session.tenantId }, 'Failed to fetch roles with permissions.');
        throw new Error('Failed to retrieve roles.');
    }
}

export async function upsertRole(data: unknown) {
    const session = await getSession();
    
    const validatedFields = RoleFormSchema.safeParse(data);

    if (!validatedFields.success) {
        log.warn({ errors: validatedFields.error.flatten(), data }, 'Invalid role data provided for upsert.');
        return { success: false, message: 'Invalid role data.' };
    }

    const { id, name, description, permissions: newPermissionNames } = validatedFields.data; // `newPermissionNames` is an array of strings
    
    // Enforce permission based on operation type
    const requiredPermission = id ? 'role:update' : 'role:create';
    await enforcePermission(requiredPermission);

    // Additionally, check if the user is attempting to assign permissions to roles
    if (newPermissionNames && newPermissionNames.length > 0) {
        const canAssignRolePermissions = await hasPermission('role:assign_permissions');
        if (!canAssignRolePermissions) {
            log.warn({ userId: session.userId, tenantId: session.tenantId, attemptedPermissions: newPermissionNames }, 'User attempted to assign permissions to a role without permission.');
            return { success: false, message: 'You do not have permission to assign permissions to roles.' };
        }
    }

    const db = await getTenantDb(session.tenantId);

    try {
        await db.transaction(async (tx) => {
            let roleId: number;
            if (id) {
                // Update existing role
                await tx.update(roles).set({ name, description }).where(eq(roles.id, id));
                roleId = id;
                log.info({ roleId, name, tenantId: session.tenantId }, 'Role updated.');
            } else {
                // Create new role
                const [newRole] = await tx.insert(roles).values({ name, description }).returning({ id: roles.id });
                roleId = newRole.id;
                log.info({ roleId, name, tenantId: session.tenantId }, 'Role created.');
            }

            // Handle permissions assignment
            if (newPermissionNames) {
                // Fetch all existing permissions to get their IDs
                const allPermissionsInDb = await tx.select().from(permissions); 
                const permissionIds = newPermissionNames.map(pName => {
                    const found = allPermissionsInDb.find(p => p.name === pName);
                    if (!found) {
                        log.warn({ permissionName: pName, tenantId: session.tenantId }, `Permission '${pName}' not found during role assignment.`);
                    }
                    return found?.id;
                }).filter(Boolean) as number[];

                // Clear existing permissions for this role and re-insert
                await tx.delete(rolesToPermissions).where(eq(rolesToPermissions.roleId, roleId)); 
                if (permissionIds.length > 0) {
                    await tx.insert(rolesToPermissions).values( 
                        permissionIds.map(permId => ({
                            roleId: roleId,
                            permissionId: permId,
                        }))
                    );
                    log.info({ roleId, assignedPermissions: newPermissionNames, tenantId: session.tenantId }, 'Permissions assigned to role.');
                } else {
                    log.info({ roleId, tenantId: session.tenantId }, 'No permissions assigned to role or all specified permissions were invalid.');
                }
            }
        });

        revalidatePath('/dashboard/roles');
        revalidatePath('/dashboard/people'); // Revalidate users page as role changes might affect user display
        return { success: true, message: `Role successfully ${id ? 'updated' : 'created'}.` };
    } catch (error) {
        log.error({ error, data, tenantId: session.tenantId }, 'Failed to upsert role.');
        // Check for unique constraint violation on role name
        if (error instanceof Error && 'code' in error && error.code === '23505') {
            return { success: false, message: 'A role with this name already exists.' };
        }
        return { success: false, message: 'Failed to save role.' };
    }
}

export async function deleteRole(roleId: number) {
    await enforcePermission('role:delete'); // Enforce permission to delete roles
    const session = await getSession();
    const db = await getTenantDb(session.tenantId);

    try {
        // Prevent deletion of default/system roles (e.g., TENANT_ADMIN, SCHOOL_ADMIN, MEMBER)
        const roleToDelete = await db.query.roles.findFirst({ where: eq(roles.id, roleId) });
        if (roleToDelete && ['TENANT_ADMIN', 'SCHOOL_ADMIN', 'MEMBER'].includes(roleToDelete.name)) {
            log.warn({ roleId, roleName: roleToDelete.name, tenantId: session.tenantId }, 'Attempted to delete a default system role. Denied.');
            return { success: false, message: `Cannot delete default system role: ${roleToDelete.name}.` };
        }

        // Check if role is currently assigned to any users
        const usersWithRole = await db.query.usersToRoles.findMany({ where: eq(usersToRoles.roleId, roleId) }); 
        if (usersWithRole.length > 0) {
            log.warn({ roleId, tenantId: session.tenantId, userCount: usersWithRole.length }, 'Attempted to delete role assigned to users. Denied.');
            return { success: false, message: 'Cannot delete role: it is currently assigned to one or more users. Please unassign it first.' };
        }

        await db.delete(roles).where(eq(roles.id, roleId));
        revalidatePath('/dashboard/roles');
        revalidatePath('/dashboard/people'); // Revalidate users page as roles might be removed from users
        return { success: true, message: 'Role deleted successfully.' };
    } catch (error) {
        log.error({ error, roleId, tenantId: session.tenantId }, 'Failed to delete role');
        return { success: false, message: 'Failed to delete role. An unexpected error occurred.' };
    }
}
