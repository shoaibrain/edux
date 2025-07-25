export const DEFAULT_ROLES = [
  {
    name: 'TENANT_ADMIN',
    description: 'Full access to tenant and all schools',
    permissions: [
      'create:school', 'delete:school', 'update:school',
      'create:user', 'delete:user', 'update:user', 'read:user',
      'create:role', 'delete:role', 'update:role',
      'read:all', 'write:all' // Wildcards for tenant-level
    ]
  },
  {
    name: 'SCHOOL_ADMIN',
    description: 'Manage specific school',
    permissions: [
      'create:user:school', 'delete:user:school', 'update:user:school', 'read:user:school',
      'update:school', 'read:school',
      'read:reports:school', 'write:classes:school'
    ]
  },
  {
    name: 'MEMBER',
    description: 'View access at school level',
    permissions: [
      'read:user:self', 'read:classes:school', 'read:reports:self'
    ]
  }
];