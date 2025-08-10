// Define the default roles
export const defaultRoles = [
  { name: 'TENANT_ADMIN', description: 'Full administrative access across the entire tenant.' },
  { name: 'SCHOOL_ADMIN', description: 'Administrative access within a specific school.' },
  { name: 'MEMBER', description: 'View-only access at the school level.' },
];

// Define granular permissions
export const defaultPermissions = [
  // Tenant-level permissions
  { name: 'tenant:manage', description: 'Manage tenant-wide settings and billing.' },
  { name: 'tenant:view_billing', description: 'View tenant billing information.' },

  // User management permissions (refers to system users, not people)
  { name: 'user:create', description: 'Create new system users.' },
  { name: 'user:read', description: 'View system user details.' },
  { name: 'user:update', description: 'Update existing system user details.' },
  { name: 'user:delete', description: 'Delete system users.' },
  { name: 'user:assign_roles', description: 'Assign and revoke roles for system users.' },

  // Role management permissions
  { name: 'role:create', description: 'Create new roles.' },
  { name: 'role:read', description: 'View role details.' },
  { name: 'role:update', 'description': 'Update existing roles.' },
  { name: 'role:delete', description: 'Delete roles.' },
  { name: 'role:assign_permissions', description: 'Assign and revoke permissions for roles.' },

  // School management permissions
  { name: 'school:create', description: 'Create new schools.' },
  { name: 'school:read', description: 'View school details.' },
  { name: 'school:update', description: 'Update existing school details.' },
  { name: 'school:delete', description: 'Delete schools.' },
  { name: 'academic_year:manage', description: 'Create, read, update, and delete academic years.' },
  { name: 'academic_term:manage', description: 'Create, read, update, and delete academic terms.' },
  { name: 'department:manage', description: 'Create, read, update, and delete departments.' },
  { name: 'grade_level:manage', description: 'Create, read, update, and delete grade levels.' },

  // People Management Permissions
  { name: 'person:create', description: 'Create new people records (students, employees, guardians).' },
  { name: 'person:read', description: 'View people records.' },
  { name: 'person:update', description: 'Update existing people records.' },
  { name: 'person:delete', description: 'Delete people records.' },
  { name: 'student:admit', description: 'Admit new students and manage their records.' },
  { name: 'employee:onboard', description: 'Onboard new employees and manage their records.' },
  { name: 'guardian:manage', description: 'Manage guardian records and their association with students.' },
  { name: 'user:grant_access', description: 'Grant system access to a person by creating a user account.' }, // New permission for linking Person to User

  // General dashboard view
  { name: 'dashboard:view', description: 'Access the main dashboard overview.' },
];

// Define which roles get which permissions
export const rolePermissionsMap: Record<string, string[]> = {
  'TENANT_ADMIN': [
    'tenant:manage', 'tenant:view_billing',
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:assign_roles', 'user:grant_access',
    'role:create', 'role:read', 'role:update', 'role:delete', 'role:assign_permissions',
    'school:create', 'school:read', 'school:update', 'school:delete',
    'academic_year:manage', 'academic_term:manage', 'department:manage', 'grade_level:manage', 
    'person:create', 'person:read', 'person:update', 'person:delete',
    'student:admit', 'employee:onboard', 'guardian:manage',
    'dashboard:view',
  ],
  'SCHOOL_ADMIN': [
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:assign_roles', 'user:grant_access',
    'role:read', 
    'school:read', 'school:update', 
    'academic_year:manage', 'academic_term:manage', 'department:manage', 'grade_level:manage', 
    'person:create', 'person:read', 'person:update', 'person:delete',
    'student:admit', 'employee:onboard', 'guardian:manage',
    'dashboard:view',
  ],
  'MEMBER': [
    'user:read', 
    'role:read', 
    'school:read', 
    'person:read', // Members can view people records
    'dashboard:view',
  ],
};
