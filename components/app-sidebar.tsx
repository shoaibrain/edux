// components/app-sidebar.tsx
"use client"

import * as React from "react"
import { Rocket, PanelLeft } from "lucide-react"

import { type UserSession } from "@/lib/session"
import { useTenant } from "@/components/tenant-provider"
import { MainNav } from "./sidebar-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
// We no longer need useNavigation, but we still need the NavItem type
import { type NavItem } from "@/components/navigation-provider"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    user: UserSession;
    // Add navItems as a required prop
    navItems: NavItem[];
}

/**
 * @param param0 - The user session object and navigation items.
 * @param props - Additional props for the sidebar component.
 * @returns - A sidebar component that displays navigation items based on user permissions.
 */
export function AppSidebar({ user, navItems: allNavItems,...props }: AppSidebarProps) {
  const { user: currentUserSession } = useTenant();

  console.debug(" User permissions:", currentUserSession?.permissions);
  console.debug(" Nav items from props:", allNavItems);

  // The permission filtering logic remains the same
  const navItems = allNavItems.filter(item => {
    if (!item.requiredPermission) {
      return true;
    }
    return currentUserSession?.permissions?.includes(item.requiredPermission);
  });

  console.log(" Filtered nav items:", navItems);
  // Get the first nav item's URL or default to dashboard
  const firstNavUrl = allNavItems[0]?.url || '/dashboard';
  const isSchoolContext = firstNavUrl.startsWith('/dashboard/schools');

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              {/* This link should dynamically go back to the correct dashboard */}
              <a href={isSchoolContext ? '/dashboard/schools' : '/dashboard'}>
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
        {/* MainNav already accepts items as a prop, so this works perfectly */}
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