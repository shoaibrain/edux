import * as React from 'react';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { getSession, hasPermission, UserSession } from '@/lib/session';
import { getTenantDb } from '@/lib/db';
import { schools } from '@/lib/db/schema/tenant';
import { NavigationProvider } from '@/components/navigation-provider';
import { getSchoolNavItems } from '@/lib/navigation'; // Import the new function
import { TenantContextType, TenantProvider } from '@/components/tenant-provider';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { MobileNav } from '@/components/mobile-nav';
import { NavUser } from '@/components/user-nav';

interface SchoolLayoutProps {
  children: React.ReactNode;
  params: Promise<{ // `params` must be a Promise for dynamic layouts in Next.js 15
    schoolId: string;
  }>;
}

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

  // if (!session || !hasPermission(session, 'school:read')) {
  //   notFound();
  // }
  
  const school = await getSchoolData(schoolId, session.tenantId);
  if (!school) {
    notFound();
  }

  // Get the school-specific nav items from our centralized function
  const schoolNavItems = getSchoolNavItems(schoolId, session);

  const tenantContextValue: TenantContextType = {
    user: session,
    tenant: {
      id: session.tenantId,
      tenantId: session.tenantId,
      name: session.name
    },
  };

  return (
    <TenantProvider value={tenantContextValue}>
      <NavigationProvider initialItems={schoolNavItems}>
        <SidebarProvider>
          {/* Render the AppSidebar with the school-specific nav items */}
          <AppSidebar user={session} navItems={schoolNavItems} />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="mr-2 h-4 hidden md:flex" />
                <Breadcrumb />
                <MobileNav />
              </div>
              <div className="flex items-center gap-4">
                <NavUser user={session} />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </NavigationProvider>
    </TenantProvider>
  );
}