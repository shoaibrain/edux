import { serial, text, pgTable, integer, timestamp, primaryKey, uniqueIndex, boolean, jsonb, date } from 'drizzle-orm/pg-core';
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

// Existing permissions table
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
    // Adding schoolId to usersToRoles to allow roles to be scoped to a specific school
    // A NULL schoolId means the role applies at the tenant level (e.g., TENANT_ADMIN)
    schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }), 
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }), // Primary key remains on userId, roleId
}));

// Existing roles_to_permissions join table
export const rolesToPermissions = pgTable('roles_to_permissions', {
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));


// --- NEW TABLES FOR MILESTONE 1 ---

// 1. Schools Table
export const schools = pgTable('schools', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    logoUrl: text('logo_url'), // URL to school logo for branding
    brandingJson: jsonb('branding_json'), // Flexible JSONB for custom branding/theme settings
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Academic Years Table (e.g., 2023-2024)
export const academicYears = pgTable('academic_years', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    yearName: text('year_name').notNull(), // e.g., "2023-2024"
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isCurrent: boolean('is_current').default(false).notNull(), // Only one current academic year per school
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolYear: uniqueIndex('unq_school_year').on(t.schoolId, t.yearName),
}));

// 3. Academic Terms Table (e.g., Fall Semester, Spring Semester within an Academic Year)
export const academicTerms = pgTable('academic_terms', {
    id: serial('id').primaryKey(),
    academicYearId: integer('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
    termName: text('term_name').notNull(), // e.g., "Fall Semester", "Q1"
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isCurrent: boolean('is_current').default(false).notNull(), // Only one current term per academic year
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqYearTerm: uniqueIndex('unq_year_term').on(t.academicYearId, t.termName),
}));

// 4. Departments Table (e.g., Math, Science, English)
export const departments = pgTable('departments', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolDept: uniqueIndex('unq_school_dept').on(t.schoolId, t.name),
}));

// 5. Grade Levels Table (e.g., Kindergarten, 1st Grade, 12th Grade)
export const gradeLevels = pgTable('grade_levels', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., "Kindergarten", "Grade 1", "Senior Year"
    levelOrder: integer('level_order').notNull(), // Numeric order for sorting (e.g., K=0, 1st=1)
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolGrade: uniqueIndex('unq_school_grade').on(t.schoolId, t.name),
    unqSchoolOrder: uniqueIndex('unq_school_order').on(t.schoolId, t.levelOrder), // Ensure unique order per school
}));


// --- RELATIONS (Updated with new tables) ---

export const usersRelations = relations(users, ({ many }) => ({
    usersToRoles: many(usersToRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
    usersToRoles: many(usersToRoles),
    rolesToPermissions: many(rolesToPermissions), 
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolesToPermissions: many(rolesToPermissions), 
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
    school: one(schools, { // New relation for school scoping
        fields: [usersToRoles.schoolId],
        references: [schools.id],
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

// New relations for Milestone 1 tables
export const schoolsRelations = relations(schools, ({ many }) => ({
    academicYears: many(academicYears),
    departments: many(departments),
    gradeLevels: many(gradeLevels),
    usersToRoles: many(usersToRoles), // For roles scoped to a school
}));

export const academicYearsRelations = relations(academicYears, ({ one, many }) => ({
    school: one(schools, {
        fields: [academicYears.schoolId],
        references: [schools.id],
    }),
    academicTerms: many(academicTerms),
}));

export const academicTermsRelations = relations(academicTerms, ({ one }) => ({
    academicYear: one(academicYears, {
        fields: [academicTerms.academicYearId],
        references: [academicYears.id],
    }),
}));

export const departmentsRelations = relations(departments, ({ one }) => ({
    school: one(schools, {
        fields: [departments.schoolId],
        references: [schools.id],
    }),
}));

export const gradeLevelsRelations = relations(gradeLevels, ({ one }) => ({
    school: one(schools, {
        fields: [gradeLevels.schoolId],
        references: [schools.id],
    }),
}));
