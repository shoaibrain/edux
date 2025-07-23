'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { users } from '@/lib/db/schema/tenant';
import type { tenants } from '@/lib/db/schema/shared';

type User = Omit<typeof users.$inferSelect, 'password'>;
type Tenant = typeof tenants.$inferSelect;

interface TenantContextType {
  user: User;
  tenant: Tenant;
}

const TenantContext = createContext<TenantContextType | null>(null);

export function TenantProvider({
  user,
  tenant,
  children,
}: {
  user: User;
  tenant: Tenant;
  children: ReactNode;
}) {
  return (
    <TenantContext.Provider value={{ user, tenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}