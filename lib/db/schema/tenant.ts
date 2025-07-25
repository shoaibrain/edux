import { serial, text, pgTable, integer, timestamp, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Existing users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

// Existing roles table
export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// This table will store granular permissions like 'school:create', 'user:read', 'billing:manage'
export const permissions = pgTable('permissions', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(), // e.g., 'user:create', 'school:manage', 'billing:view'
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Existing users_to_roles join table
export const usersToRoles = pgTable('users_to_roles', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// New roles_to_permissions join table - This was missing in your provided current version
// This table links roles to specific permissions
export const rolesToPermissions = pgTable('roles_to_permissions', {
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));


// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
    usersToRoles: many(usersToRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    usersToRoles: many(usersToRoles),
    rolesToPermissions: many(rolesToPermissions), // New relation for roles to permissions
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolesToPermissions: many(rolesToPermissions), // New relation for permissions to roles
}));

export const usersToRolesRelations = relations(usersToRoles, ({ one }) => ({
    role: one(roles, {
        fields: [usersToRoles.roleId],
        references: [roles.id],
    }),
    user: one(users, {
        fields: [usersToRoles.userId],
        references: [users.id],
    }),
}));

export const rolesToPermissionsRelations = relations(rolesToPermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolesToPermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolesToPermissions.permissionId],
        references: [permissions.id],
    }),
}));
