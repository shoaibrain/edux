import { serial, text, pgTable, integer, timestamp, primaryKey, uniqueIndex, boolean, jsonb, date, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const personTypeEnum = pgEnum('person_type', ['student', 'guardian', 'staff']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'tardy', 'excused']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'open', 'paid', 'void', 'past_due']);
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'bank_transfer', 'cash', 'check', 'scholarship']);
export const scheduleTypeEnum = pgEnum('schedule_type', ['recurring_class', 'one_time_event']);


// Existing users table (now links to people)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }).unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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
    name: text('name').notNull().unique(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Existing users_to_roles join table (schoolId is already added in Milestone 1)
export const usersToRoles = pgTable('users_to_roles', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    schoolId: integer('school_id').references(() => schools.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
}));

// Existing roles_to_permissions join table
export const rolesToPermissions = pgTable('roles_to_permissions', {
    roleId: integer('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: integer('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));


// Existing tables from Milestone 1
export const schools = pgTable('schools', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    phone: text('phone'),
    email: text('email'),
    website: text('website'),
    logoUrl: text('logo_url'),
    brandingJson: jsonb('branding_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const academicYears = pgTable('academic_years', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    yearName: text('year_name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isCurrent: boolean('is_current').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolYear: uniqueIndex('unq_school_year').on(t.schoolId, t.yearName),
}));

export const academicTerms = pgTable('academic_terms', {
    id: serial('id').primaryKey(),
    academicYearId: integer('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
    termName: text('term_name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isCurrent: boolean('is_current').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqYearTerm: uniqueIndex('unq_year_term').on(t.academicYearId, t.termName),
}));

export const departments = pgTable('departments', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolDept: uniqueIndex('unq_school_dept').on(t.schoolId, t.name),
}));

export const gradeLevels = pgTable('grade_levels', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    levelOrder: integer('level_order').notNull(),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
    unqSchoolGrade: uniqueIndex('unq_school_grade').on(t.schoolId, t.name),
    unqSchoolOrder: uniqueIndex('unq_school_order').on(t.schoolId, t.levelOrder),
}));


// --- NEW TABLES FOR MILESTONE 2: PEOPLE & IDENTITY ---

// 1. People Table (Central registry for all individuals)
export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  // schoolId is now nullable, allowing tenant-level people (e.g., initial TENANT_ADMIN)
  schoolId: integer('school_id').references(() => schools.id, { onDelete: 'set null' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender'),
  contactEmail: text('contact_email').unique(),
  contactPhone: text('contact_phone'),
  address: text('address'),
  personType: personTypeEnum('person_type').notNull(),
  profilePictureUrl: text('profile_picture_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Students Table (Specific details for students)
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }).unique(),
  studentId: text('student_id').notNull().unique(),
  enrollmentDate: date('enrollment_date').notNull(),
  graduationDate: date('graduation_date'),
  currentGradeLevelId: integer('current_grade_level_id').references(() => gradeLevels.id, { onDelete: 'set null' }),
  academicHistoryJson: jsonb('academic_history_json'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Employees Table (Specific details for staff/teachers)
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }).unique(),
  employeeId: text('employee_id').notNull().unique(),
  hireDate: date('hire_date').notNull(),
  terminationDate: date('termination_date'),
  position: text('position'),
  departmentId: integer('department_id').references(() => departments.id, { onDelete: 'set null' }),
  employmentHistoryJson: jsonb('employment_history_json'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Guardians Table (Links guardians to students)
export const guardians = pgTable('guardians', {
  id: serial('id').primaryKey(),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }).unique(),
  relationship: text('relationship'),
  isPrimaryContact: boolean('is_primary_contact').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Student-Guardian Join Table (Many-to-many relationship)
export const studentGuardians = pgTable('student_guardians', {
  studentId: integer('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  guardianId: integer('guardian_id').notNull().references(() => guardians.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.guardianId] }),
}));


// --- RELATIONS (Updated with new tables) ---

export const usersRelations = relations(users, ({ one, many }) => ({
    person: one(people, {
        fields: [users.personId],
        references: [people.id],
    }),
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
    school: one(schools, {
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

export const schoolsRelations = relations(schools, ({ many }) => ({
    academicYears: many(academicYears),
    departments: many(departments),
    gradeLevels: many(gradeLevels),
    people: many(people), // A school has many people
    usersToRoles: many(usersToRoles),
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

export const departmentsRelations = relations(departments, ({ one, many }) => ({
    school: one(schools, {
        fields: [departments.schoolId],
        references: [schools.id],
    }),
    employees: many(employees),
}));

export const gradeLevelsRelations = relations(gradeLevels, ({ one, many }) => ({
    school: one(schools, {
        fields: [gradeLevels.schoolId],
        references: [schools.id],
    }),
    students: many(students),
}));

// New relations for Milestone 2 tables
export const peopleRelations = relations(people, ({ one, many }) => ({
    school: one(schools, {
        fields: [people.schoolId],
        references: [schools.id],
    }),
    user: one(users, {
        fields: [people.id],
        references: [users.personId],
    }),
    student: one(students, {
        fields: [people.id],
        references: [students.personId],
    }),
    employee: one(employees, {
        fields: [people.id],
        references: [employees.personId],
    }),
    guardian: one(guardians, {
        fields: [people.id],
        references: [guardians.personId],
    }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
    person: one(people, {
        fields: [students.personId],
        references: [people.id],
    }),
    currentGradeLevel: one(gradeLevels, {
        fields: [students.currentGradeLevelId],
        references: [gradeLevels.id],
    }),
    studentGuardians: many(studentGuardians),
}));

export const employeesRelations = relations(employees, ({ one }) => ({
    person: one(people, {
        fields: [employees.personId],
        references: [people.id],
    }),
    department: one(departments, {
        fields: [employees.departmentId],
        references: [departments.id],
    }),
}));

export const guardiansRelations = relations(guardians, ({ one, many }) => ({
    person: one(people, {
        fields: [guardians.personId],
        references: [people.id],
    }),
    studentGuardians: many(studentGuardians),
}));

export const studentGuardiansRelations = relations(studentGuardians, ({ one }) => ({
    student: one(students, {
        fields: [studentGuardians.studentId],
        references: [students.id],
    }),
    guardian: one(guardians, {
        fields: [studentGuardians.guardianId],
        references: [guardians.id],
    }),
}));
