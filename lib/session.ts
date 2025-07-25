import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import log from './logger';
import { getTenantDb } from './db'; 
import { users, usersToRoles, roles, permissions, rolesToPermissions } from './db/schema/tenant'; 
import { eq } from 'drizzle-orm';

// Define the structure of the UserSession
export interface UserSession {
  tenantId: string;
  userId: number;
  email: string;
  name: string;
  permissions: string[]; // Array of permission NAMES (strings)
}

/**
 * Retrieves the session from the auth token cookie.
 * Redirects to '/login' if the token is missing or invalid.
 * This function should be used in Server Components and Server Actions to protect routes.
 * @returns {Promise<UserSession>} The decoded user session with permissions.
 */
export async function getSession(): Promise<UserSession> {
  const token = (await cookies()).get('authToken')?.value;

  if (!token) {
    log.warn('No auth token found, redirecting to login.');
    redirect('/login');
  }

  try {
    // Verify the token to get basic session info (tenantId, userId)
    // The JWT payload itself might not contain 'name' or 'email' directly,
    // but we'll get them from the DB query.
    const decodedToken = verify(token, env.JWT_SECRET) as { tenantId: string; userId: number; };

    // Fetch user details and their permissions from the tenant database
    const tenantDb = await getTenantDb(decodedToken.tenantId);

    // Drizzle's `with` clause should correctly type the nested objects.
    const userWithPermissions = await tenantDb.query.users.findFirst({
      where: eq(users.id, decodedToken.userId),
      with: {
        usersToRoles: {
          with: {
            role: {
              with: {
                rolesToPermissions: {
                  with: {
                    permission: true, // Fetch the full permission object
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithPermissions) {
      log.error({ userId: decodedToken.userId, tenantId: decodedToken.tenantId }, 'User not found in tenant DB during session retrieval.');
      redirect('/login'); // User not found in their tenant DB, invalid session
    }

    // Aggregate all unique permission names for the user
    const userPermissions = new Set<string>();
    userWithPermissions.usersToRoles.forEach(userRole => {
      userRole.role.rolesToPermissions.forEach(rolePermission => {
        userPermissions.add(rolePermission.permission.name); // Add only the name to the set
      });
    });

    // Construct the full UserSession object
    const session: UserSession = {
      tenantId: decodedToken.tenantId,
      userId: userWithPermissions.id, // Use ID from DB fetch
      email: userWithPermissions.email,
      name: userWithPermissions.name,
      permissions: Array.from(userPermissions), // Convert Set to Array of strings
    };

    return session;
  } catch (e) {
    log.error({ error: e }, 'Invalid session token or failed to retrieve user permissions. Redirecting to login.');
    redirect('/login');
  }
}

/**
 * Checks if the current user session has the required permission(s).
 * This function should be used in Server Components and Server Actions.
 * @param requiredPermissions A single permission string or an array of permission strings.
 * @returns {Promise<boolean>} True if the user has all required permissions, false otherwise.
 */
export async function hasPermission(requiredPermissions: string | string[]): Promise<boolean> {
  try {
    const session = await getSession(); // This will redirect if no session
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    const hasAllPermissions = permissionsToCheck.every(perm => session.permissions.includes(perm));

    if (!hasAllPermissions) {
      log.warn({ userId: session.userId, tenantId: session.tenantId, missingPermissions: permissionsToCheck.filter(p => !session.permissions.includes(p)) }, 'User does not have required permissions.');
    }
    return hasAllPermissions;
  } catch (error) {
      // Log the error but do not re-throw, as this function is meant to return a boolean.
      // The `enforcePermission` wrapper handles redirection for denied access.
    log.error({ error }, 'Error checking permissions. Denying access.');
    return false; 
  }
}

/**
 * Enforces a permission check. If the user does not have the required permission,
 * it throws an error or redirects.
 * @param requiredPermissions A single permission string or an array of permission strings.
 * @param redirectTo Optional URL to redirect to if permission is denied. Defaults to '/dashboard'.
 */
export async function enforcePermission(requiredPermissions: string | string[], redirectTo: string = '/dashboard') {
  const authorized = await hasPermission(requiredPermissions);
  if (!authorized) {
    log.warn({ requiredPermissions }, `Permission denied. Redirecting to ${redirectTo}`);
    redirect(redirectTo); 
  }
}
