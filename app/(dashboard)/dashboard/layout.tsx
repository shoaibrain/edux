import { notFound } from "next/navigation";
import { getSession, UserSession } from "@/lib/session";
import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import log from "@/lib/logger";
import { TenantContextType, TenantProvider } from "@/components/tenant-provider";
import { MobileNav } from "@/components/mobile-nav";
import { NavUser } from "@/components/user-nav";
import { NavigationProvider } from "@/components/navigation-provider";
import { getTenantNavItems } from "@/lib/navigation"; // Import the new function

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user: UserSession = await getSession();
  if (!user) {
    log.warn("No user session found in dashboard layout, redirecting.");
    return notFound();
  }

  const tenantContextValue: TenantContextType = {
    user: user,
    tenant: {
      id: user.tenantId,
      tenantId: user.tenantId,
      name: user.name
    },
  };

  // Get the navigation items from our centralized function
  const tenantNavItems = getTenantNavItems(user);

  return (
    <TenantProvider value={tenantContextValue}>
      <NavigationProvider initialItems={tenantNavItems}>
        <SidebarProvider>
          {/* Pass the nav items directly to the AppSidebar */}
          <AppSidebar user={user} navItems={tenantNavItems} />
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
  );
}