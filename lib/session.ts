import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import { env } from '@/env.mjs';
import log from './logger';
import { getTenantDb } from './db';
import { users } from './db/schema/tenant';
import { eq } from 'drizzle-orm';

export interface UserSession {
  tenantId: string;
  userId: number;
  email: string;
  name: string; // This will now be derived from the associated person's name
  permissions: string[];
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
    const decodedToken = verify(token, env.JWT_SECRET) as { tenantId: string; userId: number; };

    const tenantDb = await getTenantDb(decodedToken.tenantId);

    // Eagerly load the 'person' relation to get the user's name
    const userWithPermissions = await tenantDb.query.users.findFirst({
      where: eq(users.id, decodedToken.userId),
      with: {
        person: true, // Load associated person data
        usersToRoles: {
          with: {
            role: {
              with: {
                rolesToPermissions: {
                  with: {
                    permission: true,
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
      redirect('/login');
    }

    const userPermissions = new Set<string>();
    userWithPermissions.usersToRoles.forEach(userRole => {
      userRole.role.rolesToPermissions.forEach(rolePermission => {
        userPermissions.add(rolePermission.permission.name);
      });
    });

    const session: UserSession = {
      tenantId: decodedToken.tenantId,
      userId: userWithPermissions.id,
      email: userWithPermissions.email,
      // Derive name from person's first and last name, fallback to email if person data is missing
      name: userWithPermissions.person
            ? `${userWithPermissions.person.firstName} ${userWithPermissions.person.lastName}`
            : userWithPermissions.email,
      permissions: Array.from(userPermissions),
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
    const session = await getSession();
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    const hasAllPermissions = permissionsToCheck.every(perm => session.permissions.includes(perm));

    if (!hasAllPermissions) {
      log.warn({ userId: session.userId, tenantId: session.tenantId, missingPermissions: permissionsToCheck.filter(p => !session.permissions.includes(p)) }, 'User does not have required permissions.');
    }
    return hasAllPermissions;
  } catch (error) {
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
