import { serial, text, pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Existing users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
});

// New roles table
export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// New users_to_roles join table
export const usersToRoles = pgTable('users_to_roles', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
    usersToRoles: many(usersToRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    usersToRoles: many(usersToRoles),
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
