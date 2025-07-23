// lib/dto/tenant.ts
import { z } from 'zod';

export const TenantSignupDto = z.object({
  orgName: z.string().min(3, 'Org name must be at least 3 characters').max(50),
  tenantId: z.string().min(3, 'Tenant ID must be at least 3 characters').max(50).regex(/^[a-z0-9-]+$/, 'Tenant ID must be lowercase letters, numbers, or hyphens'),
  adminName: z.string().min(3, 'Admin name must be at least 3 characters').max(100),
  adminEmail: z.string().email('Invalid email'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginDto = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginWithTenantDto = LoginDto.extend({
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

export type TenantSignupInput = z.infer<typeof TenantSignupDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type LoginWithTenantInput = z.infer<typeof LoginWithTenantDto>;