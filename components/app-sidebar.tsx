"use client"

import * as React from "react"
import { Rocket, DollarSign, Plug, Home, Users, Folder, Settings, PanelLeft } from "lucide-react"

import { type UserSession } from "@/lib/session"
import { useTenant } from "@/components/tenant-provider"
import { MainNav } from "./main-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserSession;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { state: sidebarState } = useSidebar(true);
  const { user: currentUserSession } = useTenant();
  console.debug("[AppSidebar] Sidebar state:", sidebarState);
  const canViewSchools = currentUserSession.permissions.includes('school:read');
  const canCreateSchool = currentUserSession.permissions.includes('school:create');
  const canEditSchool = currentUserSession.permissions.includes('school:update');

  const canViewBilling = currentUserSession.permissions.includes('tenant:view_billing');
  const canViewPeople = currentUserSession.permissions.includes('person:read');

  console.log("[AppSidebar] Current user session:", currentUserSession);
    console.debug("[AppSidebar] User permissions:", currentUserSession?.permissions);

  const allNavItems = [
    { title: "Dashboard", url: "/dashboard", iconName: "Home" as const, requiredPermission: 'dashboard:view' },
    { title: "People", url: "/dashboard/people", iconName: "Users" as const, requiredPermission: 'person:read' },
    { title: "Roles", url: "/dashboard/roles", iconName: "Folder" as const, requiredPermission: 'role:read' },
    { title: "Schools", url: "/dashboard/schools", iconName: "Home" as const, requiredPermission: 'school:read' },
    { title: "Billings", url: "/dashboard/billing", iconName: "DollarSign" as const, requiredPermission: 'tenant:view_billing' },
    { title: "Integrations", url: "/dashboard/integrations", iconName: "Plug" as const, requiredPermission: 'tenant:manage' },
    { title: "Settings", url: "/dashboard/settings", iconName: "Settings" as const, requiredPermission: null },
  ];
   console.debug("[AppSidebar] All nav items:", allNavItems);

  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) {
      return true;
    }
    return currentUserSession?.permissions?.includes(item.requiredPermission);
  });

  console.log("[AppSidebar] Filtered nav items:", navItems);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Rocket className="size-4" />
                </div>

                <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">EduX</span>
                  <span className="text-xs text-muted-foreground">Tenant Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav items={navItems} />
      </SidebarContent>

      <SidebarFooter className="p-2 hidden md:block">
        <SidebarTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "default" }),
            "w-full justify-start"
          )}
        >
          <PanelLeft className="mr-2 size-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Collapse
          </span>
        </SidebarTrigger>
      </SidebarFooter>
    </Sidebar>
  )
}