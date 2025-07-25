import { notFound } from "next/navigation"
import { getSession, UserSession } from "@/lib/session"
import React from "react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import log from "@/lib/logger"
import { TenantContextType, TenantProvider } from "@/components/tenant-provider"
import { MobileNav } from "@/components/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"


interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 1. Fetch the session data once for the entire dashboard
  const user: UserSession = await getSession();
  if (!user) {
    log.warn("No user session found in dashboard layout, redirecting.");
    return notFound();
  }

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
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
         <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1 hidden md:flex" />
            <Separator orientation="vertical" className="mr-2 h-4 hidden md:flex" />
            <Breadcrumb />
             <MobileNav />
          </div>
          <div className="flex gap-4">
              <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TenantProvider>
  )
}