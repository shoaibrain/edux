// app/dashboard/schools/[schoolId]/(school)/layout.tsx
import * as React from 'react';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { getSession, hasPermission } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { schools } from '@/lib/db/schema/tenant';



interface SchoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{ // Changed to Promise
    schoolId: string;
  }>;
}

// This is a shared data-fetching and authorization function for the school context.
async function getSchoolData(schoolIdParam: string, tenantId: string) {
  console.log("Fetching school data for schoolId:", schoolIdParam, "and tenantId:", tenantId);
  const schoolId = parseInt(schoolIdParam, 10);
  if (isNaN(schoolId)) {
    return null;
  }

  const db = await getTenantDb(tenantId);
  const school = await db.query.schools.findFirst({
    where: eq(schools.id, schoolId),
  });
  console.log(`[SchoolLayout] Fetched school:`, school);
  return school;
}

export default async function SchoolLayout({ children, params }: SchoolLayoutProps) {
  // Await the params to get the actual object
  const { schoolId } = await params; // Destructure after awaiting

  const session = await getSession();

  // RBAC check: Does the user have permission to even view school data?
  // if (!hasPermission(session, 'school:read')) {
  //   // In a real app, you might redirect to an access-denied page
  //   notFound();
  // }
  
  const school = await getSchoolData(schoolId, session.tenantId); // Pass the resolved schoolId

  if (!school) {
    notFound();
  }
  
  // TODO: Add fine-grained authorization.
  // e.g., A SCHOOL_ADMIN should only be able to access schools they are assigned to.
  // This would involve checking the usersToRoles table for an entry matching
  // session.userId and school.id.

  return (
    <div className="flex-1 space-y-4">
        <main>{children}</main>
  
    </div>
  );
}
