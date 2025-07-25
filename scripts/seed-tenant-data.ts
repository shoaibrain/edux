    import { NodePgDatabase } from 'drizzle-orm/node-postgres';
    import * as tenantSchema from '@/lib/db/schema/tenant'; 
    import { eq } from 'drizzle-orm';
    import log from '@/lib/logger';
import { defaultPermissions, defaultRoles, rolePermissionsMap } from '@/lib/constants/rbac';

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
    