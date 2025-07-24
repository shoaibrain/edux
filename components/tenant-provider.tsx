"use client";

import { createContext, useContext, ReactNode } from 'react';
import { type UserSession } from '@/lib/session';

// Define the shape of the context data
export interface TenantContextType {
  user: UserSession;
  tenant: {
    id: string;
    tenantId: string;
    name: string;
    // Add other tenant details here as needed, e.g., name
  };
}

// Create the context with a null default value
const TenantContext = createContext<TenantContextType | null>(null);

// The provider component that will wrap our dashboard layout
export function TenantProvider({ children, value }: { children: ReactNode; value: TenantContextType }) {
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

// The custom hook that client components will use to access the data
export function useTenant() {
  const context = useContext(TenantContext);
  if (context === null) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}