import { serial, text, pgTable, integer, timestamp, primaryKey, uniqueIndex, boolean, jsonb, date, pgEnum, time } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const personTypeEnum = pgEnum('person_type', ['student', 'guardian', 'staff']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'open', 'paid', 'void', 'past_due']);
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'bank_transfer', 'cash', 'check', 'scholarship']);
export const scheduleTypeEnum = pgEnum('schedule_type', ['recurring_class', 'one_time_event']);

// Define enums as types, not as pgEnum functions
export const eventTypeEnum = pgEnum('event_type', ['class_period','school_event','meeting','exam','holiday','field_trip','parent_conference']);
export const eventStatusEnum = pgEnum('event_status', ['scheduled','cancelled','completed','postponed']);
export const recurrenceFrequencyEnum = pgEnum('recurrence_frequency', ['daily','weekly','monthly','yearly']);
export const instanceStatusEnum = pgEnum('instance_status', ['scheduled','cancelled','completed','postponed']);
export const attendeeRoleEnum = pgEnum('attendee_role', ['organizer','attendee','optional','required']);

// IMPORTANT: use a new PG enum name so it doesn't clash with existing 'attendance_status'
export const eventAttendanceStatusEnum = pgEnum('event_attendance_status', ['invited','confirmed','declined','tentative']);
export const resourceTypeEnum = pgEnum('resource_type', ['room','equipment','vehicle','other']);

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
    yearName: text('year_name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    isCurrent: boolean('is_current').default(false),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
    unqSchoolYear: uniqueIndex('unq_school_year').on(t.schoolId, t.yearName),
}));

export const academicTerms = pgTable('academic_terms', {
    id: serial('id').primaryKey(),
    termName: text('term_name').notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    academicYearId: integer('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
    gradeLevels: text('grade_levels').array(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
    unqYearTerm: uniqueIndex('unq_year_term').on(t.academicYearId, t.termName),
}));

export const academicConstraints = pgTable('academic_constraints', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  constraintType: text('constraint_type', { enum: ['NO_CLASSES', 'EXAM_ONLY', 'BREAK_PERIOD', 'CUSTOM'] }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  academicYearId: integer('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  termId: integer('term_id').references(() => academicTerms.id, { onDelete: 'cascade' }),
  gradeLevels: text('grade_levels').array(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

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

export const locations = pgTable('locations', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., "Room 201", "Science Lab", "Gymnasium"
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    unqSchoolLocation: uniqueIndex('unq_school_location').on(table.schoolId, table.name),
}));

export const subjects = pgTable('subjects', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    departmentId: integer('department_id').references(() => departments.id, { onDelete: 'set null' }),
    name: text('name').notNull(), // e.g., "Algebra I"
    subjectCode: text('subject_code'), // e.g., "MATH-101"
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    unqSchoolSubject: uniqueIndex('unq_school_subject').on(table.schoolId, table.name),
}));

export const classPeriods = pgTable('class_periods', {
    id: serial('id').primaryKey(),
    schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
    academicTermId: integer('academic_term_id').notNull().references(() => academicTerms.id, { onDelete: 'cascade' }),
    subjectId: integer('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
    teacherId: integer('teacher_id').notNull().references(() => people.id, { onDelete: 'cascade' }), // References 'people' table
    gradeLevelId: integer('grade_level_id').references(() => gradeLevels.id, { onDelete: 'set null' }),
    locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
    name: text('name').notNull(), // e.g., "Algebra I - Section A"
    rrule: text('rrule'), // Stores the RRULE string for recurring classes
    startTime: time('start_time').notNull(), // e.g., '09:00:00'
    endTime: time('end_time').notNull(), // e.g., '09:50:00'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classPeriodEnrollments = pgTable('class_period_enrollments', {
    studentId: integer('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
    classPeriodId: integer('class_period_id').notNull().references(() => classPeriods.id, { onDelete: 'cascade' }),
    enrollmentDate: date('enrollment_date').notNull().defaultNow(),
}, (t) => ({
    pk: primaryKey({ columns: [t.studentId, t.classPeriodId] }),
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
    subjects: many(subjects), // New
    locations: many(locations), // New
    classPeriods: many(classPeriods), // New
}));

export const academicYearsRelations = relations(academicYears, ({ one, many }) => ({
    school: one(schools, {
        fields: [academicYears.schoolId],
        references: [schools.id],
    }),
    academicTerms: many(academicTerms),
    constraints: many(academicConstraints),
}));

export const academicTermsRelations = relations(academicTerms, ({ one, many }) => ({
    academicYear: one(academicYears, {
        fields: [academicTerms.academicYearId],
        references: [academicYears.id],
    }),
    classPeriods: many(classPeriods), // New
}));

export const academicConstraintsRelations = relations(academicConstraints, ({ one, many }) => ({
    academicYear: one(academicYears, {
        fields: [academicConstraints.academicYearId],
        references: [academicYears.id],
    }),
    term: one(academicTerms, {
        fields: [academicConstraints.termId],
        references: [academicTerms.id],
    }),
}));


export const departmentsRelations = relations(departments, ({ one, many }) => ({
    school: one(schools, {
        fields: [departments.schoolId],
        references: [schools.id],
    }),
    employees: many(employees),
    subjects: many(subjects), // New
}));

export const gradeLevelsRelations = relations(gradeLevels, ({ one, many }) => ({
    school: one(schools, {
        fields: [gradeLevels.schoolId],
        references: [schools.id],
    }),
    students: many(students),
    classPeriods: many(classPeriods), // New
}));

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
    taughtClasses: many(classPeriods), // New: A person (teacher) can teach many classes
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
    classPeriodEnrollments: many(classPeriodEnrollments), // New
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

export const locationsRelations = relations(locations, ({ one, many }) => ({
    school: one(schools, { fields: [locations.schoolId], references: [schools.id] }),
    classPeriods: many(classPeriods),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
    school: one(schools, { fields: [subjects.schoolId], references: [schools.id] }),
    department: one(departments, { fields: [subjects.departmentId], references: [departments.id] }),
    classPeriods: many(classPeriods),
}));

export const classPeriodsRelations = relations(classPeriods, ({ one, many }) => ({
    school: one(schools, { fields: [classPeriods.schoolId], references: [schools.id] }),
    academicTerm: one(academicTerms, { fields: [classPeriods.academicTermId], references: [academicTerms.id] }),
    subject: one(subjects, { fields: [classPeriods.subjectId], references: [subjects.id] }),
    teacher: one(people, { fields: [classPeriods.teacherId], references: [people.id] }),
    gradeLevel: one(gradeLevels, { fields: [classPeriods.gradeLevelId], references: [gradeLevels.id] }),
    location: one(locations, { fields: [classPeriods.locationId], references: [locations.id] }),
    classPeriodEnrollments: many(classPeriodEnrollments),
}));

export const classPeriodEnrollmentsRelations = relations(classPeriodEnrollments, ({ one }) => ({
    student: one(students, { fields: [classPeriodEnrollments.studentId], references: [students.id] }),
    classPeriod: one(classPeriods, { fields: [classPeriodEnrollments.classPeriodId], references: [classPeriods.id] }),
}));

// Enhanced event management (following existing table pattern)
export const events = pgTable('events', {
    id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  eventType: eventTypeEnum('event_type').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurrenceRuleId: integer('recurrence_rule_id').references(() => recurrenceRules.id, { onDelete: 'set null' }),
  parentEventId: integer('parent_event_id'),
  status: eventStatusEnum('status').notNull(),
  maxAttendees: integer('max_attendees'),
  requiresRegistration: boolean('requires_registration').default(false).notNull(),
  metadata: jsonb('metadata'),
  academicYearId: integer('academic_year_id').references(() => academicYears.id, { onDelete: 'set null' }),
  termId: integer('term_id').references(() => academicTerms.id, { onDelete: 'set null' }),
  createdBy: integer('created_by').notNull().references(() => people.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Recurrence rules (following existing table pattern)
export const recurrenceRules = pgTable('recurrence_rules', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  frequency: recurrenceFrequencyEnum('frequency').notNull(),
  interval: integer('interval').notNull().default(1),
  weekdays: integer('weekdays').array(),
  monthDay: integer('month_day'),
  monthWeek: integer('month_week'),
  monthWeekday: integer('month_weekday'),
  endDate: timestamp('end_date', { withTimezone: true }),
  occurrenceCount: integer('occurrence_count'),
  exceptions: timestamp('exceptions', { withTimezone: true }).array(),
  rruleString: text('rrule_string'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Event instances (following existing table pattern)
export const eventInstances = pgTable('event_instances', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: instanceStatusEnum('status').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Event attendees (following existing table pattern)
export const eventAttendees = pgTable('event_attendees', {
    id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  personId: integer('person_id').notNull().references(() => people.id, { onDelete: 'cascade' }),
  role: attendeeRoleEnum('role').notNull(),
  status: eventAttendanceStatusEnum('status').notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Event resources (following existing table pattern)
export const eventResources = pgTable('event_resources', {
    id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  resourceType: resourceTypeEnum('resource_type').notNull(),
  resourceId: integer('resource_id'),
  resourceName: text('resource_name').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Add relations
export const eventsRelations = relations(events, ({ one, many }) => ({
  school: one(schools, { fields: [events.schoolId], references: [schools.id] }),
  recurrenceRule: one(recurrenceRules, { fields: [events.recurrenceRuleId], references: [recurrenceRules.id] }),
  parentEvent: one(events, { fields: [events.parentEventId], references: [events.id] }),
  academicYear: one(academicYears, { fields: [events.academicYearId], references: [academicYears.id] }),
  term: one(academicTerms, { fields: [events.termId], references: [academicTerms.id] }),
  createdByPerson: one(people, { fields: [events.createdBy], references: [people.id] }),
  instances: many(eventInstances),
  attendees: many(eventAttendees),
  resources: many(eventResources),
}));

export const recurrenceRulesRelations = relations(recurrenceRules, ({ one, many }) => ({
  school: one(schools, { fields: [recurrenceRules.schoolId], references: [schools.id] }),
  events: many(events),
}));

export const eventInstancesRelations = relations(eventInstances, ({ one }) => ({
  event: one(events, { fields: [eventInstances.eventId], references: [events.id] }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, { fields: [eventAttendees.eventId], references: [events.id] }),
  person: one(people, { fields: [eventAttendees.personId], references: [people.id] }),
}));

export const eventResourcesRelations = relations(eventResources, ({ one }) => ({
  event: one(events, { fields: [eventResources.eventId], references: [events.id] }),
}));
