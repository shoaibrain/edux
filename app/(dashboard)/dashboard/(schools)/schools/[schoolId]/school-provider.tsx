import React from "react";

export const SchoolContext = React.createContext(null);

export function SchoolProvider({ school, children }: { school: any, children: React.ReactNode }) {
  return (
    <SchoolContext.Provider value={school}>
      {children}
    </SchoolContext.Provider>
  );
}