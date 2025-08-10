import * as React from 'react';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { getSession, hasPermission } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { schools } from '@/lib/db/schema/tenant';
import { NavigationProvider, NavItem } from '@/components/navigation-provider';

interface SchoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{ // `params` must be a Promise for dynamic layouts in Next.js 15
    schoolId: string;
  }>;
}

/**
 * Generates the navigation items specific to the school context.
 * @param schoolId - The ID of the current school.
 * @returns An array of NavItem objects for the school sidebar.
 */
const getSchoolNavItems = (schoolId: string): NavItem[] => [
    {
        title: "School Dashboard",
        url: `/dashboard/schools/${schoolId}`,
        iconName: "Home",
        requiredPermission: "school:read",
    },
    {
        title: "Students",
        url: `/dashboard/schools/${schoolId}/students`,
        iconName: "GraduationCap",
        requiredPermission: "student:read",
    },
    {
        title: "Staff",
        url: `/dashboard/schools/${schoolId}/staff`,
        iconName: "UserCheck",
        requiredPermission: "staff:read",
    },
    {
        title: "Academics",
        url: `/dashboard/schools/${schoolId}/academics`,
        iconName: "BookOpen",
        requiredPermission: "academics:read",
    },
    {
        title: "School Settings",
        url: `/dashboard/schools/${schoolId}/settings`,
        iconName: "Settings",
        requiredPermission: "school:manage_settings",
    },
];


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
  const { schoolId } = await params;
  const session = await getSession();

  // RBAC check: User must have general permission to view any school.
  // if (!session || !hasPermission(session, 'school:read')) {
  //   // In a real app, you might redirect to an access-denied page
  //   notFound();
  // }
  
  const school = await getSchoolData(schoolId, session.tenantId);

  if (!school) {
    notFound();
  }
  
  // TODO: Add fine-grained authorization.
  // e.g., A SCHOOL_ADMIN should only be able to access schools they are assigned to.
  // This would involve checking the usersToRoles table for an entry matching
  // session.userId and school.id.

  const schoolNavItems = getSchoolNavItems(schoolId);
  console.log("[SchoolLayout] Navigation items:", schoolNavItems);

  // This provider overrides the parent layout's navigation items,
  // making the sidebar context-aware for the school section.
  return (
    <NavigationProvider initialItems={schoolNavItems}>
      {children}
    </NavigationProvider>
  );
}