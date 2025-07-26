"use client"

import * as React from "react"
import { Rocket, DollarSign, Plug, Home, Users, Folder, Settings } from "lucide-react" 

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
  useSidebar,
} from "@/components/ui/sidebar"
import { NavUser } from "./user-nav"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserSession; 
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { state: sidebarState } = useSidebar(true);
  const { user: currentUserSession } = useTenant(); 

  const allNavItems = [
    { title: "Dashboard", url: "/dashboard", iconName: "Home" as const, requiredPermission: 'dashboard:view' },
    { title: "People", url: "/dashboard/people", iconName: "Users" as const, requiredPermission: 'person:read' }, // Updated permission to 'person:read'
    { title: "Roles", url: "/dashboard/roles", iconName: "Folder" as const, requiredPermission: 'role:read' },
    { title: "Schools", url: "/dashboard/schools", iconName: "Home" as const, requiredPermission: 'school:read' }, 
    { title: "Billings", url: "/dashboard/billing", iconName: "DollarSign" as const, requiredPermission: 'tenant:view_billing' },
    { title: "Integrations", url: "/dashboard/integrations", iconName: "Plug" as const, requiredPermission: 'tenant:manage' }, 
    { title: "Settings", url: "/dashboard/settings", iconName: "Settings" as const, requiredPermission: null }, 
  ];

  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) {
      return true; 
    }
    return currentUserSession.permissions.includes(item.requiredPermission);
  });

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
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
