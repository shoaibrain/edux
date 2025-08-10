import { notFound } from "next/navigation"
import { getSession, UserSession } from "@/lib/session"
import React from "react"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import log from "@/lib/logger"
import { TenantContextType, TenantProvider } from "@/components/tenant-provider"
import { MobileNav } from "@/components/mobile-nav"
import { NavUser } from "@/components/user-nav"
import { NavigationProvider, NavItem } from "@/components/navigation-provider"


interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const tenantNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", iconName: "Home", requiredPermission: 'dashboard:view' },
  { title: "People", url: "/dashboard/people", iconName: "Users", requiredPermission: 'person:read' },
  { title: "Roles", url: "/dashboard/roles", iconName: "Folder", requiredPermission: 'role:read' },
  { title: "Schools", url: "/dashboard/schools", iconName: "Home", requiredPermission: 'school:read' },
  { title: "Billings", url: "/dashboard/billing", iconName: "DollarSign", requiredPermission: 'tenant:view_billing' },
  { title: "Integrations", url: "/dashboard/integrations", iconName: "Plug", requiredPermission: 'tenant:manage' },
  { title: "Settings", url: "/dashboard/settings", iconName: "Settings", requiredPermission: 'tenant:manage_settings' },
];

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 1. Fetch the session data once for the entire dashboard
  const user: UserSession = await getSession();
  if (!user) {
    log.warn("No user session found in dashboard layout, redirecting.");
    return notFound();
  }
  console.log("[DashboardLayout] User session:", user);

    // 2. Prepare the context value with user and tenant information
  const tenantContextValue: TenantContextType = {
    user: user,
    tenant: {
      id: user.tenantId,
      tenantId: user.tenantId,
      name: user.name
    },
  };

  return (
    <TenantProvider value={tenantContextValue}>
      <NavigationProvider initialItems={tenantNavItems}>
        <SidebarProvider>
          <AppSidebar user={user} />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="mr-2 h-4 hidden md:flex" />
                  <Breadcrumb />
                <MobileNav />
              </div>
              <div className="flex items-center gap-4">
                  <NavUser user={user} />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </NavigationProvider>
    </TenantProvider>
  )
}