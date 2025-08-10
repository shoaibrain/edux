"use client";

import * as React from "react";
import { type schools } from "@/lib/db/schema/tenant";

// Infer the 'School' type directly from the Drizzle schema.
// This creates a precise type based on your 'schools' table columns.
type School = typeof schools.$inferSelect;

// Update the context to expect a 'School' object or 'null'.
export const SchoolContext = React.createContext<School | null>(null);

// Use the specific 'School' type for the prop instead of 'any'.
export function SchoolProvider({ school, children }: { school: School, children: React.ReactNode }) {
  return (
    <SchoolContext.Provider value={school}>
      {children}
    </SchoolContext.Provider>
  );
}