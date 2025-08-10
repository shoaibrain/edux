// app/(dashboard)/dashboard/(tenant)/layout.tsx
import { notFound } from "next/navigation"
import { getSession, UserSession } from "@/lib/session"
import React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { MobileNav } from "@/components/mobile-nav"
import { NavUser } from "@/components/user-nav"
import { getTenantNavItems } from "@/lib/navigation"
import { NavItem } from "@/components/navigation-provider"


interface TenantLayoutProps {
  children?: React.ReactNode;
}

export default async function TenantLayout({ children }: TenantLayoutProps) {
  const user: UserSession = await getSession();
  if (!user) {
    return notFound();
  }

  // Fetch tenant-specific navigation items from our service
  const tenantNavItems: NavItem[] = getTenantNavItems(user);

  return (
    <SidebarProvider>
      {/* Pass the nav items directly to AppSidebar */}
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
  )
}