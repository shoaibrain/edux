import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as tenantSchema from '@/lib/db/schema/tenant';
import { eq } from 'drizzle-orm';
import log from '@/lib/logger';

// Define the default roles and their associated permissions
const defaultRoles = [
  { name: 'TENANT_ADMIN', description: 'Full administrative access across the entire tenant.' },
  { name: 'SCHOOL_ADMIN', description: 'Administrative access within a specific school.' },
  { name: 'MEMBER', description: 'View-only access at the school level.' },
];

// Define granular permissions
const defaultPermissions = [
  // Tenant-level permissions
  { name: 'tenant:manage', description: 'Manage tenant-wide settings and billing.' },
  { name: 'tenant:view_billing', description: 'View tenant billing information.' },

  // User management permissions
  { name: 'user:create', description: 'Create new users.' },
  { name: 'user:read', description: 'View user details.' },
  { name: 'user:update', description: 'Update existing user details.' },
  { name: 'user:delete', description: 'Delete users.' },
  { name: 'user:assign_roles', description: 'Assign and revoke roles for users.' },

  // Role management permissions
  { name: 'role:create', description: 'Create new roles.' },
  { name: 'role:read', description: 'View role details.' },
  { name: 'role:update', description: 'Update existing roles.' },
  { name: 'role:delete', description: 'Delete roles.' },
  { name: 'role:assign_permissions', description: 'Assign and revoke permissions for roles.' },

  // School management permissions
  { name: 'school:create', description: 'Create new schools.' },
  { name: 'school:read', description: 'View school details.' },
  { name: 'school:update', description: 'Update existing school details.' },
  { name: 'school:delete', description: 'Delete schools.' },

  // General dashboard view
  { name: 'dashboard:view', description: 'Access the main dashboard overview.' },
];

// Define which roles get which permissions
const rolePermissionsMap: Record<string, string[]> = {
  'TENANT_ADMIN': [
    'tenant:manage',
    'tenant:view_billing',
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:assign_roles',
    'role:create', 'role:read', 'role:update', 'role:delete', 'role:assign_permissions',
    'school:create', 'school:read', 'school:update', 'school:delete',
    'dashboard:view',
  ],
  'SCHOOL_ADMIN': [
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:assign_roles',
    'role:read', // Can view roles, but not create/update/delete them or their permissions
    'school:read', 'school:update', // Can manage their own school, but not create/delete
    'dashboard:view',
  ],
  'MEMBER': [
    'user:read', // Can view users
    'role:read', // Can view roles
    'school:read', // Can view schools
    'dashboard:view',
  ],
};

export async function seedTenantData(db: NodePgDatabase<typeof tenantSchema>) {
  log.info('Starting tenant data seeding...');
  try {
    // Insert permissions
    const insertedPermissions = await Promise.all(
      defaultPermissions.map(async (perm) => {
        const [existingPerm] = await db.select().from(tenantSchema.permissions).where(eq(tenantSchema.permissions.name, perm.name));
        if (existingPerm) {
          log.info(`Permission '${perm.name}' already exists, skipping insertion.`);
          return existingPerm;
        } else {
          const [newPerm] = await db.insert(tenantSchema.permissions).values(perm).returning();
          log.info(`Inserted permission: ${newPerm.name}`);
          return newPerm;
        }
      })
    );

    // Insert roles
    const insertedRoles = await Promise.all(
      defaultRoles.map(async (role) => {
        const [existingRole] = await db.select().from(tenantSchema.roles).where(eq(tenantSchema.roles.name, role.name));
        if (existingRole) {
          log.info(`Role '${role.name}' already exists, skipping insertion.`);
          return existingRole;
        } else {
          const [newRole] = await db.insert(tenantSchema.roles).values(role).returning();
          log.info(`Inserted role: ${newRole.name}`);
          return newRole;
        }
      })
    );

    // Assign permissions to roles
    for (const role of insertedRoles) {
      const permissionsForRole = rolePermissionsMap[role.name];
      if (permissionsForRole) {
        for (const permName of permissionsForRole) {
          const permission = insertedPermissions.find(p => p.name === permName);
          if (permission) {
            // Check if the association already exists
            const [existingAssociation] = await db.select()
              .from(tenantSchema.rolesToPermissions)
              .where(
                eq(tenantSchema.rolesToPermissions.roleId, role.id) &&
                eq(tenantSchema.rolesToPermissions.permissionId, permission.id)
              );

            if (!existingAssociation) {
              await db.insert(tenantSchema.rolesToPermissions).values({
                roleId: role.id,
                permissionId: permission.id,
              });
              log.info(`Assigned permission '${permission.name}' to role '${role.name}'.`);
            } else {
              log.info(`Permission '${permission.name}' already assigned to role '${role.name}', skipping.`);
            }
          } else {
            log.warn(`Permission '${permName}' not found for role '${role.name}'.`);
          }
        }
      }
    }

    log.info('Tenant data seeding completed successfully.');
  } catch (error) {
    log.error({ error }, 'Tenant data seeding failed.');
    throw error;
  }
}
